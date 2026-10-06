import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAdminDashboard, listPatients, listAppointments } from '../../lib/api';

const toneStyles = {
  teal: 'bg-teal-50 text-teal-700',
  sky: 'bg-sky-50 text-sky-700',
  amber: 'bg-amber-50 text-amber-800',
  rose: 'bg-rose-50 text-rose-800',
};

const apptStatusStyles = {
  scheduled: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-slate-200 text-slate-700',
  cancelled: 'bg-rose-100 text-rose-800',
  no_show: 'bg-amber-100 text-amber-800',
};

const apptStatusLabels = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No show',
};

function ApptBadge({ status }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        apptStatusStyles[status] || 'bg-slate-100 text-slate-700'
      }`}
    >
      {apptStatusLabels[status] || status}
    </span>
  );
}


export function AdminLayout() {
  const { user } = useAuth();
  return (
    <div className="min-h-[70vh] bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Admin console</p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Platform overview</h1>
          </div>
          <p className="text-sm text-slate-600">Hi, {user?.name?.split(' ')[0] || 'admin'}</p>
        </div>
        <nav aria-label="Admin sections" className="mx-auto flex max-w-7xl gap-5 overflow-x-auto px-4 sm:px-6">
          <NavItem to="/admin" label="Home" end />
          <NavItem to="/admin/patients" label="Patients" />
          <NavItem to="/admin/appointments" label="Appointments" />
          <NavItem to="/admin/providers" label="Doctors" />
          <NavItem to="/admin/alerts" label="Alerts" />
        </nav>
      </div>
      <Outlet />
    </div>
  );
}

function NavItem({ to, label }) {
  return (
    <Link
      to={to}
      className="shrink-0 border-b-2 border-transparent px-1 pb-3 text-sm font-semibold text-slate-500 hover:border-teal-300 hover:text-teal-700"
    >
      {label}
    </Link>
  );
}

export default function AdminHomePage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [listError, setListError] = useState('');

  useEffect(() => {
    getAdminDashboard()
      .then(setStats)
      .catch((err) => setError(err.message || 'Unable to load dashboard'));

    listPatients({ status: 'active', limit: 100 })
      .then((data) => setPatients(Array.isArray(data) ? data : []))
      .catch((err) => setListError(err.message || 'Unable to load patients'));

    listAppointments({ limit: 100 })
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .catch((err) => setListError((prev) => prev || err.message || 'Unable to load appointments'));
  }, []);

  const cards = [
    {
      key: 'patients',
      label: 'Total active patients',
      value: stats ? String(stats.activePatients) : '—',
      detail: 'Active accounts',
      to: '/admin/patients',
      tone: 'teal',
      icon: '♙',
    },
    {
      key: 'appointments',
      label: 'Appointments today',
      value: stats ? String(stats.appointmentsToday) : '—',
      detail: 'Across all locations',
      to: '/admin/appointments',
      tone: 'sky',
      icon: '▣',
    },
    {
      key: 'providers',
      label: 'Pending doctor approvals',
      value: stats ? String(stats.pendingProviders) : '—',
      detail: 'Applications awaiting review',
      to: '/admin/providers?status=pending',
      tone: 'amber',
      icon: '✓',
    },
    {
      key: 'alerts',
      label: 'System alerts',
      value: stats ? String(stats.systemAlerts) : '—',
      detail: 'Items need attention',
      to: '/admin/alerts',
      tone: 'rose',
      icon: '!',
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h2 className="text-base font-bold text-slate-900">Today at a glance</h2>
        <p className="mt-1 text-sm text-slate-600">
          Current platform activity and items that may need your attention.
        </p>
      </div>
      {error && (
        <p className="mb-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
          {error}
        </p>
      )}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Platform KPIs">
        {cards.map((card) => (
          <Link
            key={card.key}
            to={card.to}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-teal-200 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            <div className="flex items-start justify-between">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${toneStyles[card.tone]}`}
                aria-hidden="true"
              >
                {card.icon}
              </span>
              <span
                className="text-xl text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-700"
                aria-hidden="true"
              >
                ›
              </span>
            </div>
            <p className="mt-5 text-sm font-semibold text-slate-600">{card.label}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">
              {card.detail}
              {card.key === 'alerts' && stats?.systemAlerts > 0 && (
                <span className="ml-1 font-semibold text-rose-700">(review)</span>
              )}
            </p>
          </Link>
        ))}
      </section>

      {listError && (
        <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
          {listError}
        </p>
      )}

      <section className="mt-6 grid gap-4 lg:grid-cols-2" aria-label="Active patients and appointments">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active patients</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {patients.length
                  ? `${patients.length} active account${patients.length === 1 ? '' : 's'}`
                  : 'Loading…'}
              </p>
            </div>
            <Link to="/admin/patients" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {patients.length ? (
              patients.slice(0, 6).map((patient) => (
                <Link
                  key={patient.id}
                  to={`/admin/patients/${patient.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{patient.name}</p>
                    <p className="truncate text-xs text-slate-500">{patient.email}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      Number(patient.balance) > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {Number(patient.balance) > 0 ? `$${Number(patient.balance).toFixed(2)} owed` : 'Paid up'}
                  </span>
                </Link>
              ))
            ) : (
              <p className="px-5 py-6 text-sm text-slate-600">No active patients found.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Appointments</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {appointments.length
                  ? `${appointments.length} appointment${appointments.length === 1 ? '' : 's'} on record`
                  : 'Loading…'}
              </p>
            </div>
            <Link to="/admin/appointments" className="text-xs font-semibold text-teal-700 hover:text-teal-800">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {appointments.length ? (
              appointments.slice(0, 6).map((appt) => (
                <div key={appt.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {appt.patient?.name || 'Patient'}
                      <span className="font-normal text-slate-500"> → </span>
                      {appt.provider}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {appt.date}
                      {appt.time ? `, ${appt.time}` : ''} · {appt.visitType} · {appt.reason}
                    </p>
                  </div>
                  <ApptBadge status={appt.rawStatus || appt.status} />
                </div>
              ))
            ) : (
              <p className="px-5 py-6 text-sm text-slate-600">No appointments found.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export function AdminPlaceholder({ title }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">
          This admin detail workspace will be added in a future milestone.
        </p>
        <Link
          to="/admin"
          className="mt-5 inline-flex rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Back to overview
        </Link>
      </section>
    </main>
  );
}
