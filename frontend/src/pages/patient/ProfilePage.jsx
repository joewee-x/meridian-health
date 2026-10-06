import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getProfile,
  updatePersonalProfile,
  updateInsuranceProfile,
  updateNotificationPrefs,
  createProxy,
  revokeProxy,
} from '../../lib/api';

function BackLink() {
  return (
    <Link to="/patient/profile" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
      ← Profile & settings
    </Link>
  );
}

function Saved({ text = 'Changes saved.' }) {
  return (
    <p className="mt-3 text-sm font-medium text-emerald-700" role="status">
      ✓ {text}
    </p>
  );
}

export function ProfileOverview() {
  const cards = [
    { to: 'personal', title: 'Personal info', text: 'Name, date of birth, contact details, and address.' },
    { to: 'insurance', title: 'Insurance info', text: 'Plan, member ID, and group number.' },
    { to: 'notifications', title: 'Notification preferences', text: 'Choose what you hear about and how.' },
    { to: 'proxies', title: 'Family & proxy access', text: 'Manage who can see your account.' },
  ];
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6 sm:py-7">
      <h1 className="text-xl font-bold tracking-tight text-slate-900">Profile & settings</h1>
      <p className="mt-1 text-sm text-slate-600">Keep your details and preferences up to date.</p>
      <section className="mt-6 space-y-3">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={`/patient/profile/${card.to}`}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-slate-900">{card.title}</span>
              <span className="mt-1 block text-xs text-slate-600">{card.text}</span>
            </span>
            <span className="text-xl text-teal-700" aria-hidden="true">
              ›
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}

export function PersonalInfoPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [dob, setDob] = useState(user?.dateOfBirth || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProfile()
      .then((data) => {
        if (data.personal) {
          setName(data.personal.name || '');
          setDob((data.personal.dob || '').toString().slice(0, 10));
          setPhone(data.personal.phone || '');
          setAddress(data.personal.address || '');
        }
      })
      .catch((err) => setError(err.message || 'Unable to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await updatePersonalProfile({ name, dob, phone, address });
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Unable to save');
    }
  };

  return (
    <EditLayout title="Personal info">
      {loading ? (
        <p className="mt-5 text-sm text-slate-600">Loading…</p>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          {error && (
            <p className="rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
              {error}
            </p>
          )}
          <label className="block text-sm font-semibold text-slate-800">
            Full name
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Date of birth
            <input
              type="date"
              value={dob || ''}
              onChange={(e) => {
                setDob(e.target.value);
                setSaved(false);
              }}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Phone
            <input
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setSaved(false);
              }}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Address
            <textarea
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setSaved(false);
              }}
              rows="2"
              className="mt-1 w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          <button className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
            Save changes
          </button>
          {saved && <Saved text="Personal information updated." />}
        </form>
      )}
    </EditLayout>
  );
}

export function InsurancePage() {
  const [form, setForm] = useState({ provider: '', memberId: '', groupNumber: '' });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProfile()
      .then((data) => {
        if (data.insurance) setForm(data.insurance);
      })
      .catch((err) => setError(err.message || 'Unable to load insurance'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await updateInsuranceProfile(form);
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Unable to save');
    }
  };

  return (
    <EditLayout title="Insurance info">
      {loading ? (
        <p className="mt-5 text-sm text-slate-600">Loading…</p>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          {error && (
            <p className="rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
              {error}
            </p>
          )}
          {[
            ['provider', 'Insurance provider'],
            ['memberId', 'Member ID'],
            ['groupNumber', 'Group number'],
          ].map(([key, label]) => (
            <label key={key} className="block text-sm font-semibold text-slate-800">
              {label}
              <input
                value={form[key] || ''}
                onChange={(e) => {
                  setForm({ ...form, [key]: e.target.value });
                  setSaved(false);
                }}
                required
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
              />
            </label>
          ))}
          <button className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
            Save changes
          </button>
          {saved && <Saved text="Insurance information updated." />}
        </form>
      )}
    </EditLayout>
  );
}

export function NotificationsPage() {
  const [settings, setSettings] = useState({
    appointment: true,
    messages: true,
    results: true,
    billing: false,
    email: true,
    sms: true,
    push: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then((data) => {
        if (data.notifications) setSettings(data.notifications);
      })
      .catch((err) => setError(err.message || 'Unable to load preferences'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (key) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    try {
      await updateNotificationPrefs(next);
    } catch (err) {
      setError(err.message || 'Unable to save preference');
      setSettings(settings);
    }
  };

  const groups = [
    ['appointment', 'Appointment reminders'],
    ['messages', 'New messages'],
    ['results', 'New test results'],
    ['billing', 'Billing updates'],
    ['email', 'Email notifications'],
    ['sms', 'SMS notifications'],
    ['push', 'Push notifications'],
  ];

  return (
    <EditLayout title="Notification preferences">
      {loading ? (
        <p className="mt-5 text-sm text-slate-600">Loading…</p>
      ) : (
        <div className="mt-5 space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          {error && (
            <p className="rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
              {error}
            </p>
          )}
          {groups.map(([key, label]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0"
            >
              <span className="text-sm font-semibold text-slate-800">{label}</span>
              <input
                type="checkbox"
                checked={!!settings[key]}
                onChange={() => toggle(key)}
                className="h-5 w-5 accent-teal-700"
              />
            </label>
          ))}
          <Saved text="Preferences update instantly." />
        </div>
      )}
    </EditLayout>
  );
}

export function ProxiesPage() {
  const [proxies, setProxies] = useState([]);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('Limited access');
  const [revoking, setRevoking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    getProfile()
      .then((data) => setProxies(data.proxies || []))
      .catch((err) => setError(err.message || 'Unable to load proxies'));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const invite = async () => {
    if (!name.trim()) return;
    setError('');
    try {
      await createProxy({
        name: name.trim(),
        level,
        accessLevel: level === 'Full access' ? 'full' : 'limited',
      });
      setName('');
      await load();
    } catch (err) {
      setError(err.message || 'Unable to invite');
    }
  };

  const revoke = async () => {
    try {
      await revokeProxy(revoking.id);
      setRevoking(null);
      await load();
    } catch (err) {
      setError(err.message || 'Unable to revoke');
      setRevoking(null);
    }
  };

  return (
    <EditLayout title="Family & proxy access">
      {error && (
        <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p className="mt-5 text-sm text-slate-600">Loading…</p>
      ) : (
        <div className="mt-5 space-y-3">
          {proxies.map((proxy) => (
            <div key={proxy.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-slate-900">{proxy.name}</span>
                <span className="block text-xs text-slate-600">{proxy.level}</span>
              </span>
              <button
                type="button"
                onClick={() => setRevoking(proxy)}
                className="rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                Revoke
              </button>
            </div>
          ))}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Invite someone</h2>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Their full name"
              aria-label="Proxy full name"
              className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            />
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              aria-label="Proxy access level"
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            >
              <option>Limited access</option>
              <option>Full access</option>
            </select>
            <button
              type="button"
              onClick={invite}
              className="mt-3 w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              Send invite
            </button>
          </div>
        </div>
      )}
      {revoking && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-slate-900/40 p-4 sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">Revoke access?</h2>
            <p className="mt-2 text-sm text-slate-600">
              {revoking.name} will no longer be able to view your account.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRevoking(null)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Keep access
              </button>
              <button
                type="button"
                onClick={revoke}
                className="rounded-lg bg-rose-700 px-3 py-2 text-sm font-semibold text-white"
              >
                Revoke access
              </button>
            </div>
          </div>
        </div>
      )}
    </EditLayout>
  );
}

function EditLayout({ title, children }) {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-5 sm:px-6 sm:py-7">
      <BackLink />
      <h1 className="mt-5 text-xl font-bold text-slate-900">{title}</h1>
      {children}
    </main>
  );
}
