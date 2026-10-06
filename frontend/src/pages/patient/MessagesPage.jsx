import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  listMessageThreads,
  getMessageThread,
  createMessageThread,
  sendMessage,
  listProviders,
} from '../../lib/api';

function Avatar({ provider }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
      {provider?.initials || 'CT'}
    </span>
  );
}

function threadProvider(thread) {
  if (thread?.provider) {
    return {
      ...thread.provider,
      initials:
        thread.provider.initials ||
        `${thread.provider.name?.replace(/^Dr\.\s*/, '').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'CT'}`,
    };
  }
  return null;
}

export function MessagesInbox() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    listMessageThreads()
      .then((data) => {
        if (!cancelled) setThreads(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Unable to load messages');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Messages</h1>
          <p className="mt-0.5 text-sm text-slate-600">A private space for your care team.</p>
        </div>
        <Link
          to="/patient/messages/new"
          className="shrink-0 rounded-xl bg-teal-700 px-3 py-2.5 text-xs font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:px-4 sm:text-sm"
        >
          New message
        </Link>
      </div>
      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
          {error}
        </p>
      )}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs" aria-label="Message threads">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-600">Loading messages…</div>
        ) : threads.length ? (
          threads.map((thread) => {
            const provider = threadProvider(thread);
            const last = thread.messages[thread.messages.length - 1];
            return (
              <Link
                key={thread.id}
                to={`/patient/messages/${thread.id}`}
                className={`flex min-w-0 items-center gap-3 border-b border-slate-100 p-4 last:border-0 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 ${
                  thread.unread ? 'bg-teal-50/30' : ''
                }`}
              >
                <Avatar provider={provider} />
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm ${thread.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                    {provider?.name || 'Care team'}
                  </span>
                  <span className={`mt-0.5 block truncate text-xs ${thread.unread ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>
                    {last?.text}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-[11px] text-slate-500">
                  {last?.timestamp}
                  {thread.unread && <span className="h-2.5 w-2.5 rounded-full bg-teal-600" aria-label="Unread" />}
                </span>
              </Link>
            );
          })
        ) : (
          <div className="p-8 text-center">
            <p className="text-base font-bold text-slate-900">Message your care team</p>
            <p className="mt-1 text-sm text-slate-600">Start a private conversation with one of your providers.</p>
            <Link
              to="/patient/messages/new"
              className="mt-4 inline-flex rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Start a message
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export function NewMessagePage() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [providerId, setProviderId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listProviders({ limit: 50 })
      .then((data) => setProviders(data.filter((p) => p.status !== 'pending')))
      .catch((err) => setError(err.message || 'Unable to load providers'))
      .finally(() => setLoading(false));
  }, []);

  const start = async () => {
    setSubmitting(true);
    setError('');
    try {
      const thread = await createMessageThread(providerId);
      navigate(`/patient/messages/${thread.id}`);
    } catch (err) {
      setError(err.message || 'Unable to start conversation');
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-5 sm:px-6 sm:py-7">
      <Link to="/patient/messages" className="text-sm font-semibold text-teal-700">
        ← Messages
      </Link>
      <h1 className="mt-5 text-xl font-bold text-slate-900">Message my care team</h1>
      <p className="mt-1 text-sm text-slate-600">Choose a provider to start a private conversation.</p>
      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
          {error}
        </p>
      )}
      <section className="mt-6 space-y-2">
        {loading ? (
          <p className="text-sm text-slate-600">Loading providers…</p>
        ) : (
          providers.map((provider) => (
            <button
              key={provider.id}
              type="button"
              onClick={() => setProviderId(provider.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                providerId === provider.id ? 'border-teal-600 bg-teal-50' : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <Avatar provider={{ initials: provider.initials }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-slate-900">{provider.name}</span>
                <span className="block text-xs text-slate-600">{provider.specialty || provider.role}</span>
              </span>
              {providerId === provider.id && <span className="text-teal-700">✓</span>}
            </button>
          ))
        )}
      </section>
      <button
        type="button"
        disabled={!providerId || submitting}
        onClick={start}
        className="mt-6 w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
      >
        {submitting ? 'Opening…' : 'Continue'}
      </button>
    </main>
  );
}

export function MessageThreadPage() {
  const { threadId } = useParams();
  const [thread, setThread] = useState(null);
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMessageThread(threadId)
      .then((data) => {
        if (!cancelled) setThread(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Conversation not found');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [threadId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <p className="text-sm text-slate-600">Loading conversation…</p>
      </main>
    );
  }

  if (!thread) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <p className="text-sm text-slate-600">{error || 'Conversation not found.'}</p>
        <Link to="/patient/messages" className="mt-3 inline-block text-sm font-semibold text-teal-700">
          ← Messages
        </Link>
      </main>
    );
  }

  const provider = threadProvider(thread);

  const send = async () => {
    if (!text.trim() && !attachment) return;
    try {
      const message = await sendMessage(threadId, {
        text: text.trim() || undefined,
        attachment: attachment ? { name: attachment.name, type: attachment.type } : null,
      });
      setThread((prev) => ({
        ...prev,
        messages: [...(prev.messages || []), message],
        unread: false,
      }));
      setText('');
      setAttachment(null);
    } catch (err) {
      setError(err.message || 'Unable to send message');
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-5 sm:px-6 sm:py-7">
      <div className="flex items-center gap-3">
        <Link
          to="/patient/messages"
          aria-label="Back to messages"
          className="rounded-lg p-1 text-xl text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          ←
        </Link>
        <Avatar provider={provider} />
        <div>
          <h1 className="text-base font-bold text-slate-900">{provider?.name || 'Care team'}</h1>
          <p className="text-xs text-slate-600">{provider?.specialty}</p>
        </div>
      </div>
      {error && (
        <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
          {error}
        </p>
      )}
      <section
        className="mt-5 min-h-[320px] space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
        aria-label={`Conversation with ${provider?.name}`}
        aria-live="polite"
      >
        {thread.messages.length ? (
          thread.messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                  message.sender === 'patient' ? 'rounded-br-md bg-teal-700 text-white' : 'rounded-bl-md bg-slate-100 text-slate-800'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                {message.attachment && (
                  <span className="mt-2 block rounded-lg bg-black/10 px-2 py-1 text-xs">📎 {message.attachment.name}</span>
                )}
                <p className={`mt-1 text-[10px] ${message.sender === 'patient' ? 'text-teal-100' : 'text-slate-500'}`}>
                  <span className="sr-only">
                    {message.sender === 'patient' ? 'You, ' : `${provider?.name}, `}
                  </span>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="py-12 text-center text-sm text-slate-500">Start the conversation with {provider?.name}.</p>
        )}
      </section>
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-xs">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={(event) => setAttachment(event.target.files?.[0] || null)}
        />
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Attach a photo or file"
            className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            📎
          </button>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            rows="1"
            placeholder="Write a message…"
            aria-label="Message text"
            className="min-w-0 flex-1 resize-none rounded-xl border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-teal-600"
          />
          <button
            type="button"
            onClick={send}
            disabled={!text.trim() && !attachment}
            className="rounded-xl bg-teal-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            Send
          </button>
        </div>
        {attachment && <p className="px-11 pt-1 text-xs text-teal-700">Attached: {attachment.name}</p>}
      </div>
    </main>
  );
}
