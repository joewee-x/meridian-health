'use strict';

const { z } = require('zod');

const createAppointmentSchema = z.object({
  providerId: z.string().uuid(),
  startAt: z.string().datetime({ offset: true }).or(z.string().datetime()),
  endAt: z.string().datetime({ offset: true }).or(z.string().datetime()).optional(),
  visitType: z.enum(['Telehealth', 'In person', 'telehealth', 'in_person']),
  reason: z.string().trim().min(2).max(200),
  notes: z.string().trim().max(2000).optional(),
});

const updateAppointmentSchema = z.object({
  providerId: z.string().uuid().optional(),
  startAt: z.string().datetime({ offset: true }).or(z.string().datetime()).optional(),
  endAt: z.string().datetime({ offset: true }).or(z.string().datetime()).optional(),
  visitType: z.enum(['Telehealth', 'In person', 'telehealth', 'in_person']).optional(),
  reason: z.string().trim().min(2).max(200).optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
});

module.exports = { createAppointmentSchema, updateAppointmentSchema };
