import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { listProviders, getProvider, updateProvider } from '../../lib/api';

function Status({ value }) {
  const label = value === 'pending' ? 'Pending approval' : value === 'inactive' ? 'Deactivated' : 'Active';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        value === 'pending'
          ? 'bg-amber-100 text-amber-800'
          : value === 'inactive'
            ? 'bg-slate-200 text-slate-700'
            : 'bg-emerald-100 text-emerald-800'
      }`}
    >
      <span aria-hidden="true">{value === 'pending' ? '!' : value === 'inactive' ? '—' : '✓'}</span>
      {label}
    </span>
  );
}

export default function DoctorManagementPage() {
  const [params] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(params.get('status') || 'all');
  const [specialty, setSpecialty] = useState('all');
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const data = await listProviders({ status: 'all', limit: 100, search });
      setDoctors(data);
    } catch (err) {
      setError(err.message || 'Unable to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const s = params.get('status');
    if (s) setStatus(s);
  }, [params]);

  const specialties = [...new Set(doctors.map((doctor) => doctor.specialty || doctor.role).filter(Boolean))];
  const filtered = useMemo(
    () =>
      doctors
        .filter(
          (doctor) =>
            (status === 'all' || doctor.status === status) &&
            (specialty === 'all' || doctor.specialty === specialty || doctor.role === specialty) &&
            doctor.name.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => (a.status === 'pending' ? -1 : 0) - (b.status === 'pending' ? -1 : 0)),
    [doctors, search, status, specialty]
  );

  const update = async (id, nextStatus, rejectionReason) => {
    try {
      const updated = await updateProvider(id, {
        status: nextStatus,
        ...(rejectionReason ? { rejectionReason } : {}),
      });
      setDoctors((prev) => prev.map((doctor) => (doctor.id === id ? { ...doctor, ...updated } : doctor)));
    } catch (err) {
      setError(err.message || 'Unable to update doctor');
    }
  };

  const reject = async () => {
    await update(rejecting.id, 'inactive', reason);
    setRejecting(null);
    setReason('');
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Doctor management</h2>
          <p className="mt-1 text-sm text-slate-600">Review applications and manage provider access.</p>
        </div>
        <Link to="/admin/providers?status=pending" className="text-sm font-semibold text-teal-700">
          View pending approvals
        </Link>
      </div>
      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
          {error}
        </p>
      )}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <label className="sm:col-span-1">
          <span className="sr-only">Search doctors</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
          />
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
          className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending approval</option>
          <option value="active">Active</option>
          <option value="inactive">Deactivated</option>
        </select>
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          aria-label="Filter by specialty"
          className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
        >
          <option value="all">All specialties</option>
          {specialties.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="hidden grid-cols-[1.4fr_1fr_1fr_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 md:grid">
          <span>Provider</span>
          <span>Specialty</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-600">Loading doctors…</div>
        ) : filtered.length ? (
          filtered.map((doctor) => (
            <div
              key={doctor.id}
              className="grid gap-3 border-b border-slate-100 p-4 last:border-0 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center md:gap-4 md:px-5"
            >
              <div>
                <p className="text-sm font-bold text-slate-900">{doctor.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">Submitted {doctor.submitted || '—'}</p>
              </div>
              <p className="text-sm text-slate-700">{doctor.specialty || doctor.role}</p>
              <div>
                <Status value={doctor.status} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/admin/providers/${doctor.id}`}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                >
                  View / edit
                </Link>
                {doctor.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => update(doctor.id, 'active')}
                      className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejecting(doctor)}
                      className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-sm text-slate-600">No doctors match these filters.</div>
        )}
      </div>
      {rejecting && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-slate-900/40 p-4 sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h2 id="reject-title" className="text-lg font-bold text-slate-900">
              Reject this application?
            </h2>
            <p className="mt-2 text-sm text-slate-600">Add a short reason for {rejecting.name}.</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="3"
              placeholder="Reason"
              aria-label="Rejection reason"
              className="mt-3 w-full resize-none rounded-xl border border-slate-300 p-3 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejecting(null)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700"
              >
                Keep pending
              </button>
              <button
                type="button"
                disabled={!reason.trim()}
                onClick={reject}
                className="rounded-lg bg-rose-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                Reject application
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export function DoctorProfilePage() {
  const { providerId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [saved, setSaved] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProvider(providerId)
      .then(setDoctor)
      .catch((err) => setError(err.message || 'Doctor not found'))
      .finally(() => setLoading(false));
  }, [providerId]);

  if (loading) {
    return <main className="p-6 text-sm text-slate-600">Loading…</main>;
  }

  if (!doctor) {
    return <main className="p-6 text-sm text-slate-600">{error || 'Doctor not found.'}</main>;
  }

  const change = (key, value) => {
    setDoctor({ ...doctor, [key]: value });
    setSaved(false);
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const updated = await updateProvider(doctor.id, {
        specialty: doctor.specialty,
        bio: doctor.bio,
        credentials: doctor.credentials,
      });
      setDoctor({ ...doctor, ...updated });
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Unable to save');
    }
  };

  const toggleStatus = async () => {
    const nextStatus = doctor.status === 'inactive' ? 'active' : 'inactive';
    try {
      const updated = await updateProvider(doctor.id, { status: nextStatus });
      setDoctor({ ...doctor, ...updated });
      setConfirm(false);
    } catch (err) {
      setError(err.message || 'Unable to update status');
      setConfirm(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
      <Link to="/admin/providers" className="text-sm font-semibold text-teal-700">
        ← Doctor management
      </Link>
      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
          {error}
        </p>
      )}
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Provider profile</p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">{doctor.name}</h1>
          <div className="mt-2">
            <Status value={doctor.status} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          {doctor.status === 'inactive' ? 'Reactivate' : 'Deactivate'}
        </button>
      </div>
      <form onSubmit={save} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <p className="text-sm text-slate-600">
          Credentials: <strong>{doctor.credentials || doctor.education}</strong>
        </p>
        <label className="block text-sm font-semibold text-slate-800">
          Specialty
          <input
            value={doctor.specialty || ''}
            onChange={(e) => change('specialty', e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          />
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Bio
          <textarea
            value={doctor.bio || ''}
            onChange={(e) => change('bio', e.target.value)}
            rows="4"
            className="mt-1 w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          />
        </label>
        <p className="text-sm text-slate-600">
          Schedule:{' '}
          <Link to="/admin/appointments" className="font-semibold text-teal-700">
            View availability summary
          </Link>
        </p>
        <button className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white">Save changes</button>
        {saved && (
          <p className="text-sm font-medium text-emerald-700" role="status">
            ✓ Provider profile updated.
          </p>
        )}
      </form>
      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-slate-900/40 p-4 sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">
              {doctor.status === 'inactive' ? 'Reactivate this doctor?' : 'Deactivate this doctor?'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {doctor.status === 'inactive'
                ? 'Patients will be able to book this provider again.'
                : 'Patients will no longer be able to book this provider.'}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700"
              >
                Go back
              </button>
              <button
                type="button"
                onClick={toggleStatus}
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
