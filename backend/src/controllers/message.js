'use strict';

const {
  MessageThread,
  Message,
  User,
  ProviderProfile,
  sequelize,
} = require('../../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/response');
const { writeAuditLog } = require('../utils/audit');

function formatTimestamp(date) {
  const d = new Date(date);
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  if (sameDay) {
    return `Today, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function serializeThread(thread, viewerRole) {
  const provider = thread.Provider;
  const profile = provider?.ProviderProfile;
  return {
    id: thread.id,
    providerId: thread.providerId,
    patientId: thread.patientId,
    unread: viewerRole === 'provider' ? thread.unreadByProvider : thread.unreadByPatient,
    provider: provider
      ? {
          id: provider.id,
          name: `Dr. ${provider.firstName} ${provider.lastName}${profile?.credentials ? `, ${profile.credentials}` : ''}`.replace(/,\s*$/, ''),
          specialty: profile?.specialty || '',
          initials: `${provider.firstName?.[0] || ''}${provider.lastName?.[0] || ''}`.toUpperCase(),
        }
      : null,
    messages: (thread.Messages || []).map((m) => ({
      id: m.id,
      sender: m.senderRole === 'patient' ? 'patient' : 'provider',
      text: m.body,
      timestamp: formatTimestamp(m.createdAt),
      attachment: m.attachmentName
        ? { name: m.attachmentName, type: m.attachmentType }
        : null,
    })),
  };
}

const listThreads = asyncHandler(async (req, res) => {
  const where =
    req.user.role === 'provider'
      ? { providerId: req.user.id }
      : { patientId: req.user.id };

  const threads = await MessageThread.findAll({
    where,
    include: [
      {
        model: User,
        as: 'Provider',
        attributes: ['id', 'firstName', 'lastName'],
        include: [{ model: ProviderProfile, as: 'ProviderProfile' }],
      },
      {
        model: Message,
        as: 'Messages',
        separate: true,
        order: [['createdAt', 'ASC']],
      },
    ],
    order: [['updatedAt', 'DESC']],
  });

  return ok(res, threads.map((t) => serializeThread(t, req.user.role)));
});

const getThread = asyncHandler(async (req, res) => {
  const thread = await MessageThread.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'Provider',
        attributes: ['id', 'firstName', 'lastName'],
        include: [{ model: ProviderProfile, as: 'ProviderProfile' }],
      },
      {
        model: Message,
        as: 'Messages',
        separate: true,
        order: [['createdAt', 'ASC']],
      },
    ],
  });
  if (!thread) throw new AppError('Conversation not found', 404, 'NOT_FOUND');

  if (req.user.role === 'patient' && thread.patientId !== req.user.id) {
    throw new AppError('Conversation not found', 404, 'NOT_FOUND');
  }
  if (req.user.role === 'provider' && thread.providerId !== req.user.id) {
    throw new AppError('Conversation not found', 404, 'NOT_FOUND');
  }

  if (req.user.role === 'patient') await thread.update({ unreadByPatient: false });
  if (req.user.role === 'provider') await thread.update({ unreadByProvider: false });

  await writeAuditLog({
    userId: req.user.id,
    action: 'READ',
    entityType: 'MessageThread',
    entityId: thread.id,
    ipAddress: req.ip,
  });

  return ok(res, serializeThread(thread, req.user.role));
});

const createThread = asyncHandler(async (req, res) => {
  if (req.user.role !== 'patient') {
    throw new AppError('Only patients can start message threads', 403, 'FORBIDDEN');
  }

  const { providerId } = req.body;
  const provider = await User.findOne({ where: { id: providerId, role: 'provider' } });
  if (!provider) throw new AppError('Provider not found', 404, 'NOT_FOUND');

  let thread = await MessageThread.findOne({
    where: { patientId: req.user.id, providerId },
  });

  if (!thread) {
    thread = await MessageThread.create({
      patientId: req.user.id,
      providerId,
      unreadByPatient: false,
      unreadByProvider: false,
    });
  }

  const full = await MessageThread.findByPk(thread.id, {
    include: [
      {
        model: User,
        as: 'Provider',
        attributes: ['id', 'firstName', 'lastName'],
        include: [{ model: ProviderProfile, as: 'ProviderProfile' }],
      },
      { model: Message, as: 'Messages' },
    ],
  });

  return created(res, serializeThread(full, req.user.role));
});

const sendMessage = asyncHandler(async (req, res) => {
  const thread = await MessageThread.findByPk(req.params.id);
  if (!thread) throw new AppError('Conversation not found', 404, 'NOT_FOUND');

  if (req.user.role === 'patient' && thread.patientId !== req.user.id) {
    throw new AppError('Conversation not found', 404, 'NOT_FOUND');
  }
  if (req.user.role === 'provider' && thread.providerId !== req.user.id) {
    throw new AppError('Conversation not found', 404, 'NOT_FOUND');
  }

  const { text, attachment } = req.body;
  if (!text?.trim() && !attachment) {
    throw new AppError('Message body is required', 400, 'VALIDATION_ERROR');
  }

  const message = await sequelize.transaction(async (transaction) => {
    const createdMsg = await Message.create(
      {
        threadId: thread.id,
        senderId: req.user.id,
        senderRole: req.user.role,
        body: text?.trim() || (attachment ? `[Attachment: ${attachment.name}]` : ''),
        attachmentName: attachment?.name || null,
        attachmentType: attachment?.type || null,
      },
      { transaction }
    );

    await thread.update(
      {
        unreadByPatient: req.user.role !== 'patient',
        unreadByProvider: req.user.role !== 'provider',
        updatedAt: new Date(),
      },
      { transaction }
    );

    return createdMsg;
  });

  await writeAuditLog({
    userId: req.user.id,
    action: 'CREATE',
    entityType: 'Message',
    entityId: message.id,
    ipAddress: req.ip,
  });

  return created(res, {
    id: message.id,
    sender: req.user.role === 'patient' ? 'patient' : 'provider',
    text: message.body,
    timestamp: 'Just now',
    attachment: message.attachmentName
      ? { name: message.attachmentName, type: message.attachmentType }
      : null,
  });
});

module.exports = { listThreads, getThread, createThread, sendMessage };
