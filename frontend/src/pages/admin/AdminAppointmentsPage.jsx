import React, { useEffect, useMemo, useState } from 'react';
import { listAppointments } from '../../lib/api';

const statusLabels = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No show',
};

const statusStyles = {
  scheduled: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-slate-200 text-slate-700',
  cancelled: 'bg-rose-100 text-rose-800',
  no_show: 'bg-amber-100 text-amber-800',
};

function StatusBadge({ status }) {
  const style = statusStyles[status] || 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>
      <span aria-hidden="true">•</span>
      {statusLabels[status] || status}
    </span>
  );
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    listAppointments({ limit: 100 })
      .then((data) => {
        setAppointments(Array.isArray(data) ? data : []);
        setError('');
      })
      .catch((err) => setError(err.message || 'Unable to load appointments'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return appointments.filter((appt) => {
      const apptStatus = appt.rawStatus || appt.status;
      if (status !== 'all' && apptStatus !== status) return false;
      if (!term) return true;
      const haystack = [
        appt.patient?.name,
        appt.patient?.email,
        appt.provider,
        appt.reason,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [appointments, status, search]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Appointments oversight</h2>
        <p className="mt-1 text-sm text-slate-600">
          Every appointment booked on the platform, newest first.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Search appointments</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient, provider, or reason"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
          />
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter appointment status"
          className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No show</option>
        </select>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-5 text-sm text-slate-600">Loading appointments...</p>
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="hidden grid-cols-[1.2fr_1.2fr_1.2fr_1fr_1fr_1.2fr] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 md:grid">
            <span>Patient</span>
            <span>Provider</span>
            <span>Date &amp; time</span>
            <span>Visit type</span>
            <span>Status</span>
            <span>Reason</span>
          </div>
          {filtered.length ? (
            filtered.map((appt) => (
              <div
                key={appt.id}
                className="grid gap-3 border-b border-slate-100 p-4 last:border-0 md:grid-cols-[1.2fr_1.2fr_1.2fr_1fr_1fr_1.2fr] md:items-center md:gap-4 md:px-5"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">{appt.patient?.name || 'Patient'}</p>
                  {appt.patient?.email && (
                    <p className="mt-0.5 truncate text-xs text-slate-500">{appt.patient.email}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-900">{appt.provider}</p>
                  {appt.specialty && (
                    <p className="mt-0.5 truncate text-xs text-slate-500">{appt.specialty}</p>
                  )}
                </div>
                <p className="text-sm text-slate-700">
                  {appt.date}
                  {appt.time ? `, ${appt.time}` : ''}
                </p>
                <p className="text-sm text-slate-700">{appt.visitType}</p>
                <div>
                  <StatusBadge status={appt.rawStatus || appt.status} />
                </div>
                <p className="truncate text-sm text-slate-700">{appt.reason || '—'}</p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-slate-600">
              No appointments match your search.
            </div>
          )}
        </div>
      )}
    </main>
  );
}
