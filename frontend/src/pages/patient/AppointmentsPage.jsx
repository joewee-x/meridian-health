import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  listAppointments,
  cancelAppointment,
  listProviders,
  getAppointmentSlots,
  createAppointment,
  updateAppointment,
} from '../../lib/api';

const reasons = ['Annual checkup', 'Follow-up', 'New concern', 'Medication question'];

function ProviderMark({ initials }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
      {initials}
    </span>
  );
}

function providerInitials(provider) {
  if (provider?.initials) return provider.initials;
  if (!provider?.name) return 'MH';
  return provider.name
    .replace(/^Dr\.\s*/, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

function AppointmentCard({ appointment, providerMap, onCancel }) {
  const navigate = useNavigate();
  const provider = providerMap[appointment.providerId];
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
      <div className="flex min-w-0 gap-3">
        <ProviderMark initials={providerInitials(provider) || 'MH'} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold text-slate-900">{appointment.provider}</h2>
          <p className="mt-0.5 text-xs text-slate-600">
            {appointment.specialty} · {appointment.reason}
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-800">
            {appointment.date} at {appointment.time}
          </p>
          <p className="mt-1 text-xs font-medium text-teal-700">{appointment.visitType}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <Link
          to={`/patient/appointments/book?reschedule=${appointment.id}`}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          Reschedule
        </Link>
        <button
          type="button"
          onClick={() => onCancel(appointment)}
          className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          Cancel
        </button>
        {appointment.visitType === 'Telehealth' && appointment.startsSoon && (
          <button
            type="button"
            onClick={() => navigate(`/patient/appointments/${appointment.id}`)}
            className="ml-auto rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            Join video
          </button>
        )}
      </div>
    </article>
  );
}

export function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [providers, setProviders] = useState([]);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [appts, provs] = await Promise.all([
        listAppointments({ limit: 50 }),
        listProviders({ limit: 50 }),
      ]);
      setAppointments(appts);
      setProviders(provs);
    } catch (err) {
      setError(err.message || 'Unable to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const providerMap = useMemo(
    () => Object.fromEntries(providers.map((p) => [p.id, p])),
    [providers]
  );

  const visible = appointments.filter((appointment) => appointment.status === activeTab);

  const cancel = async () => {
    try {
      await cancelAppointment(cancelTarget.id);
      setAppointments((prev) => prev.filter((a) => a.id !== cancelTarget.id));
      setCancelTarget(null);
    } catch (err) {
      setError(err.message || 'Unable to cancel appointment');
      setCancelTarget(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Appointments</h1>
          <p className="mt-0.5 text-sm text-slate-600">Manage your upcoming care and past visits.</p>
        </div>
        <Link
          to="/patient/appointments/book"
          className="shrink-0 rounded-xl bg-teal-700 px-3 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:px-4 sm:text-sm"
        >
          Book new<span className="hidden sm:inline"> appointment</span>
        </Link>
      </div>
      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
          {error}
        </p>
      )}
      <div className="mt-6 flex gap-5 border-b border-slate-200" role="tablist" aria-label="Appointment history">
        {['upcoming', 'past'].map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-1 pb-3 text-sm font-semibold capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
              activeTab === tab ? 'border-teal-600 text-teal-800' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <section className="mt-4 space-y-3" aria-label={`${activeTab} appointments`}>
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading appointments…</div>
        ) : visible.length ? (
          visible.map((appointment) =>
            activeTab === 'upcoming' ? (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                providerMap={providerMap}
                onCancel={setCancelTarget}
              />
            ) : (
              <Link
                key={appointment.id}
                to="/patient/records"
                className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                <ProviderMark initials={providerInitials(providerMap[appointment.providerId]) || 'MH'} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-900">
                    {appointment.reason} with {appointment.provider}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-600">
                    {appointment.date} · {appointment.visitType} · View visit record
                  </span>
                </span>
                <span className="text-teal-700" aria-hidden="true">
                  ›
                </span>
              </Link>
            )
          )
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            No {activeTab} appointments.
          </div>
        )}
      </section>
      {cancelTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-slate-900/40 p-4 sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h2 id="cancel-title" className="text-lg font-bold text-slate-900">
              Cancel this appointment?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Your appointment with {cancelTarget.provider} on {cancelTarget.date} will be removed.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Keep appointment
              </button>
              <button
                type="button"
                onClick={cancel}
                className="rounded-lg bg-rose-700 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-800"
              >
                Cancel appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export function BookingPage() {
  const [params] = useSearchParams();
  const rescheduleId = params.get('reschedule');
  const providerParam = params.get('provider');

  const [providers, setProviders] = useState([]);
  const [existing, setExisting] = useState(null);
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [visitType, setVisitType] = useState('Telehealth');
  const [providerId, setProviderId] = useState(providerParam || '');
  const [firstAvailable, setFirstAvailable] = useState(false);
  const [slot, setSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [provs, appts] = await Promise.all([
          listProviders({ limit: 50 }),
          rescheduleId ? listAppointments({ limit: 50 }) : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setProviders(provs.filter((p) => p.acceptingNew !== false && p.status !== 'pending'));
        if (rescheduleId) {
          const found = appts.find((a) => a.id === rescheduleId);
          if (found) {
            setExisting(found);
            setReason(found.reason || '');
            setVisitType(found.visitType || 'Telehealth');
            setProviderId(found.providerId);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Unable to load booking data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rescheduleId]);

  useEffect(() => {
    if (!providerId || step < 3) return;
    let cancelled = false;
    getAppointmentSlots(providerId, 3)
      .then((slots) => {
        if (!cancelled) setAvailableSlots(slots);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Unable to load available times');
      });
    return () => {
      cancelled = true;
    };
  }, [providerId, step]);

  const provider = providers.find((item) => item.id === providerId);
  const next = () => setStep((current) => current + 1);
  const back = () => setStep((current) => Math.max(1, current - 1));

  const finish = async () => {
    if (!slot?.startAt || !providerId) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        providerId,
        startAt: slot.startAt,
        endAt: slot.endAt,
        visitType,
        reason,
      };
      if (existing) {
        await updateAppointment(existing.id, payload);
      } else {
        await createAppointment(payload);
      }
      setComplete(true);
    } catch (err) {
      setError(err.message || 'Unable to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6">
        <p className="text-sm text-slate-600">Loading booking…</p>
      </main>
    );
  }

  if (complete) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6">
        <section className="rounded-2xl border border-teal-200 bg-white p-6 text-center shadow-xs">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-xl text-teal-700">
            ✓
          </span>
          <h1 className="mt-4 text-xl font-bold text-slate-900">
            {existing ? 'Appointment rescheduled' : 'Added to your appointments'}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {provider?.name} · {slot.date} at {slot.time}
          </p>
          <a
            href={`data:text/calendar;charset=utf-8,BEGIN:VCALENDAR%0ASUMMARY:Meridian Health appointment%0AEND:VCALENDAR`}
            download="meridian-appointment.ics"
            className="mt-5 inline-flex rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-100"
          >
            Add to calendar
          </a>
          <Link to="/patient/appointments" className="mt-4 block text-sm font-semibold text-teal-700 hover:text-teal-800">
            View appointments
          </Link>
        </section>
      </main>
    );
  }

  const primaryDisabled =
    step === 1 ? !reason : step === 2 ? !providerId : step === 3 ? !slot : false;

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-5 sm:px-6 sm:py-7">
      <div className="mb-5">
        <Link to="/patient/appointments" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
          ← Appointments
        </Link>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-teal-700">
          {existing ? 'Reschedule appointment' : 'Book an appointment'}
        </p>
        <h1 className="mt-1 text-xl font-bold text-slate-900">
          {step === 1
            ? 'What do you need care for?'
            : step === 2
              ? 'Choose your provider'
              : step === 3
                ? 'Choose a time'
                : 'Review your appointment'}
        </h1>
        <p className="mt-1 text-sm text-slate-600">Step {step} of 4</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${step * 25}%` }} />
        </div>
      </div>
      {error && (
        <p className="mb-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
          {error}
        </p>
      )}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6">
        {step === 1 && (
          <>
            <div className="space-y-2">
              {reasons.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setReason(item)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                    reason === item ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item}
                  <span aria-hidden="true">{reason === item ? '✓' : ''}</span>
                </button>
              ))}
            </div>
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-slate-800">Visit type</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {['Telehealth', 'In person'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={visitType === item}
                    onClick={() => setVisitType(item)}
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                      visitType === item ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>
          </>
        )}
        {step === 2 && (
          <div className="space-y-2">
            {providers[0] && (
              <button
                type="button"
                onClick={() => {
                  setProviderId(providers[0].id);
                  setFirstAvailable(true);
                  setSlot(null);
                }}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  firstAvailable ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-700'
                }`}
              >
                First available
                <span>{firstAvailable ? '✓' : ''}</span>
              </button>
            )}
            {providers.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setProviderId(item.id);
                  setFirstAvailable(false);
                  setSlot(null);
                }}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  providerId === item.id && !firstAvailable ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ProviderMark initials={providerInitials(item)} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-900">{item.name}</span>
                  <span className="block text-xs text-slate-600">{item.specialty || item.role}</span>
                </span>
                <span className="text-teal-700">{providerId === item.id && !firstAvailable ? '✓' : ''}</span>
              </button>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="space-y-5">
            {availableSlots.length ? (
              availableSlots.map((day) => (
                <div key={day.dateISO || day.date}>
                  <h2 className="text-sm font-bold text-slate-800">{day.date}</h2>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {day.times.map((timeSlot) => {
                      const timeLabel = typeof timeSlot === 'string' ? timeSlot : timeSlot.time;
                      const startAt = typeof timeSlot === 'string' ? null : timeSlot.startAt;
                      const endAt = typeof timeSlot === 'string' ? null : timeSlot.endAt;
                      const selected = slot?.startAt === startAt;
                      return (
                        <button
                          key={startAt || timeLabel}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            setSlot({
                              date: day.date,
                              time: timeLabel,
                              startAt,
                              endAt,
                            })
                          }
                          className={`rounded-lg border px-1 py-2.5 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                            selected ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {timeLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No open slots for this provider in the next few days.</p>
            )}
          </div>
        )}
        {step === 4 && (
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-xs font-semibold text-slate-500">Reason</dt>
              <dd className="mt-1 font-semibold text-slate-900">{reason}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500">Provider</dt>
              <dd className="mt-1 font-semibold text-slate-900">{provider?.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500">Date and time</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {slot?.date} at {slot?.time}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-500">Visit type</dt>
              <dd className="mt-1 font-semibold text-slate-900">{visitType}</dd>
            </div>
          </dl>
        )}
      </section>
      <div className="mt-5 flex items-center justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={back}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            Back
          </button>
        ) : (
          <span />
        )}
        {step < 4 ? (
          <button
            type="button"
            disabled={primaryDisabled}
            onClick={next}
            className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={finish}
            className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            {submitting ? 'Saving…' : existing ? 'Confirm reschedule' : 'Confirm appointment'}
          </button>
        )}
      </div>
    </main>
  );
}
