import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listPatients, getPatient, listAppointments } from '../../lib/api';
import { getAdminPatients } from '../../data/adminPatients';

const apptStatusLabels = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No show',
  upcoming: 'Scheduled',
  past: 'Completed',
};

function Badge({ children, tone = 'neutral' }) {
  const styles = {
    active: 'bg-emerald-100 text-emerald-800',
    inactive: 'bg-slate-200 text-slate-700',
    owed: 'bg-amber-100 text-amber-800',
    paid: 'bg-emerald-100 text-emerald-800',
    neutral: 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[tone] || styles.neutral}`}>
      <span aria-hidden="true">{tone === 'active' || tone === 'paid' ? '✓' : tone === 'owed' ? '!' : '—'}</span>
      {children}
    </span>
  );
}

function PatientList({ patients, setPatients }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    listPatients({ limit: 100, status: status === 'all' ? undefined : status })
      .then((data) => {
        const rows = Array.isArray(data) ? data : data?.data || [];
        setPatients(rows);
        setError('');
      })
      .catch((err) => {
        setError(err.message || 'Unable to load patients');
        setPatients(getAdminPatients());
      })
      .finally(() => setLoading(false));
  }, [status, setPatients]);

  const filtered = useMemo(
    () => patients.filter((patient) => patient.name?.toLowerCase().includes(search.toLowerCase())),
    [patients, search]
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Patient management</h2>
        <p className="mt-1 text-sm text-slate-600">
          Look up patient accounts and billing status. Clinical chart details are not shown here.
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Search patients</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
          />
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter patient account status"
          className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
        >
          <option value="all">All account statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
          {error}
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 md:grid">
          <span>Patient</span>
          <span>Registered</span>
          <span>Account</span>
          <span>Billing</span>
          <span>Action</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-600">Loading patients...</div>
        ) : filtered.length ? (
          filtered.map((patient) => (
            <div
              key={patient.id}
              className="grid gap-3 border-b border-slate-100 p-4 last:border-0 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] md:items-center md:gap-4 md:px-5"
            >
              <div>
                <p className="text-sm font-bold text-slate-900">{patient.name}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">{patient.email}</p>
              </div>
              <p className="text-sm text-slate-700">{patient.registered}</p>
              <div>
                <Badge tone={patient.status}>{patient.status === 'active' ? 'Active' : 'Inactive'}</Badge>
              </div>
              <div>
                <Badge tone={patient.balance > 0 ? 'owed' : 'paid'}>
                  {patient.balance > 0 ? `$${patient.balance.toFixed(2)} owed` : 'Paid up'}
                </Badge>
              </div>
              <Link
                to={`/admin/patients/${patient.id}`}
                className="w-fit rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                View account
              </Link>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-sm text-slate-600">No patient accounts match your search.</div>
        )}
      </div>
    </main>
  );
}

export default function PatientManagementPage() {
  const [patients, setPatients] = useState(() => getAdminPatients());
  return <PatientList patients={patients} setPatients={setPatients} />;
}

export function PatientAccountPage() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPatient(patientId),
      listAppointments({ patientId, limit: 100 }).catch(() => []),
    ])
      .then(([data, apptRows]) => {
        const rows = Array.isArray(apptRows) ? apptRows : [];
        setPatient({
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          registered: data.registered || '—',
          status: data.status,
          balance: Number(data.outstandingBalance) || 0,
          insurance: data.insurance
            ? `${data.insurance.provider || 'Self-pay'}${
                data.insurance.memberId ? ` · ${data.insurance.memberId}` : ''
              }`
            : 'Self-pay',
          appointments: rows.map((appt) => ({
            date: `${appt.date}${appt.time ? `, ${appt.time}` : ''}`,
            provider: appt.provider,
            status: apptStatusLabels[appt.rawStatus || appt.status] || appt.status,
          })),
        });
        setError('');
      })
      .catch(() => {
        const fallback = getAdminPatients().find((item) => item.id === patientId);
        if (fallback) setPatient(fallback);
        else setError('Patient account not found.');
      })
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return <main className="p-6 text-sm text-slate-600">Loading patient account...</main>;
  if (error) return <main className="p-6 text-sm text-slate-600">{error}</main>;
  if (!patient) return <main className="p-6 text-sm text-slate-600">Patient account not found.</main>;

  const update = (changes) => {
    const next = { ...patient, ...changes };
    setPatient(next);
    setSaved(false);
  };

  const confirmAction = () => {
    if (confirm === 'reset') {
      setSaved(true);
      setConfirm(null);
    }
    if (confirm === 'status') {
      update({ status: patient.status === 'active' ? 'inactive' : 'active' });
      setConfirm(null);
    }
    if (confirm === 'billing') {
      update({ balance: 0, billing: 'paid up' });
      setSaved(true);
      setConfirm(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
      <Link to="/admin/patients" className="text-sm font-semibold text-teal-700">
        ← Patient management
      </Link>
      <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Account details</p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">{patient.name}</h1>
          <p className="mt-1 text-sm text-slate-600">Registered {patient.registered}</p>
        </div>
        <Badge tone={patient.status}>
          {patient.status === 'active' ? 'Active account' : 'Inactive account'}
        </Badge>
      </div>
      <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        Admin view is limited to account, insurance, billing, and appointment summaries. Clinical notes,
        results, prescriptions, and visit records are not available here.
      </p>
      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900">Contact information</h2>
          <label className="mt-3 block text-xs font-semibold text-slate-600">
            Email
            <input
              value={patient.email || ''}
              onChange={(e) => update({ email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="mt-3 block text-xs font-semibold text-slate-600">
            Phone
            <input
              value={patient.phone || ''}
              onChange={(e) => update({ phone: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          {saved && (
            <p className="mt-3 text-xs font-medium text-emerald-700" role="status">
              ✓ Changes saved.
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900">Insurance on file</h2>
          <p className="mt-3 text-sm text-slate-700">{patient.insurance}</p>
          <h2 className="mt-5 text-sm font-bold text-slate-900">Billing status</h2>
          <p className="mt-2 text-sm text-slate-700">
            {patient.balance > 0 ? `$${patient.balance.toFixed(2)} balance owed` : 'Paid up'}
          </p>
          {patient.balance > 0 && (
            <button
              type="button"
              onClick={() => setConfirm('billing')}
              className="mt-3 rounded-lg border border-teal-200 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50"
            >
              Mark balance resolved
            </button>
          )}
        </div>
      </section>
      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900">Appointment history</h2>
        <div className="mt-3 divide-y divide-slate-100">
          {patient.appointments?.length ? (
            patient.appointments.map((appointment) => (
              <div
                key={`${appointment.date}-${appointment.provider}`}
                className="flex justify-between gap-3 py-3 text-sm"
              >
                <span>
                  <span className="block font-semibold text-slate-800">{appointment.date}</span>
                  <span className="block text-xs text-slate-600">{appointment.provider}</span>
                </span>
                <span className="text-xs font-semibold text-slate-600">{appointment.status}</span>
              </div>
            ))
          ) : (
            <div className="py-3 text-sm text-slate-600">No appointments on record.</div>
          )}
        </div>
      </section>
      <section className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setConfirm('status')}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
        >
          {patient.status === 'active' ? 'Deactivate account' : 'Reactivate account'}
        </button>
        <button
          type="button"
          onClick={() => setConfirm('reset')}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
        >
          Reset login
        </button>
      </section>
      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-slate-900/40 p-4 sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">
              {confirm === 'reset'
                ? 'Reset this login?'
                : confirm === 'billing'
                ? 'Mark balance resolved?'
                : `${patient.status === 'active' ? 'Deactivate' : 'Reactivate'} this account?`}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {confirm === 'reset'
                ? 'The patient will need to set a new password at their next sign in. (Mock action)'
                : confirm === 'billing'
                ? 'This will mark the current account balance as paid.'
                : 'This changes whether the patient can access their account.'}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700"
              >
                Go back
              </button>
              <button
                type="button"
                onClick={confirmAction}
                className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
