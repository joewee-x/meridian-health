import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  listLabResults,
  listVisitSummaries,
  getVisitSummary,
  listMedications,
  requestMedicationRefill,
  listImmunizations,
} from '../../lib/api';

const tabs = [
  { id: 'results', label: 'Lab results' },
  { id: 'visits', label: 'Visit summaries' },
  { id: 'medications', label: 'Medications' },
  { id: 'immunizations', label: 'Immunizations' },
];

function Empty({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-600">
      {text}
    </div>
  );
}

export function RecordsPage() {
  const [tab, setTab] = useState('results');
  const [openLab, setOpenLab] = useState(null);
  const [labs, setLabs] = useState([]);
  const [visits, setVisits] = useState([]);
  const [medications, setMedications] = useState([]);
  const [immunizations, setImmunizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([listLabResults(), listVisitSummaries(), listMedications(), listImmunizations()])
      .then(([labData, visitData, medData, immData]) => {
        if (cancelled) return;
        setLabs(labData);
        setVisits(visitData);
        setMedications(medData);
        setImmunizations(immData);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Unable to load records');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const requestRefill = async (id) => {
    try {
      const result = await requestMedicationRefill(id);
      setMedications((prev) =>
        prev.map((med) => (med.id === id ? { ...med, refillStatus: result.refillStatus || 'Pending' } : med))
      );
    } catch (err) {
      setError(err.message || 'Unable to request refill');
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-7">
      <h1 className="text-xl font-bold tracking-tight text-slate-900">Records</h1>
      <p className="mt-0.5 text-sm text-slate-600">Your health information, explained clearly.</p>
      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
          {error}
        </p>
      )}
      <div className="mt-6 overflow-x-auto border-b border-slate-200">
        <div className="flex min-w-max gap-5" role="tablist" aria-label="Records sections">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`border-b-2 px-1 pb-3 text-sm font-semibold whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                tab === item.id ? 'border-teal-600 text-teal-800' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <section className="mt-4 space-y-3" aria-label={tabs.find((item) => item.id === tab)?.label}>
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Loading records…</div>
        ) : (
          <>
            {tab === 'results' &&
              (labs.length ? (
                labs.map((lab) => (
                  <article key={lab.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setOpenLab(openLab === lab.id ? null : lab.id)}
                      className="flex w-full min-w-0 items-start gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          lab.status === 'normal' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                        aria-hidden="true"
                      >
                        {lab.status === 'normal' ? '✓' : '!'}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-slate-900">{lab.name}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {lab.date} · {lab.status === 'normal' ? 'Normal' : 'Needs attention'}
                        </span>
                      </span>
                      <span className="text-right text-xs font-semibold text-slate-700">
                        {lab.value}
                        <br />
                        <span className="font-normal text-slate-400">
                          {openLab === lab.id ? 'Hide detail' : 'View detail'}
                        </span>
                      </span>
                    </button>
                    {openLab === lab.id && (
                      <div className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-600">
                        <p>{lab.explanation}</p>
                        <p className="mt-2 text-xs font-medium text-slate-500">{lab.range}</p>
                        {lab.education && (
                          <a
                            href={lab.education}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-block text-xs font-semibold text-teal-700 underline"
                          >
                            Learn more ↗
                          </a>
                        )}
                      </div>
                    )}
                  </article>
                ))
              ) : (
                <Empty text="No lab results yet. New results will appear here." />
              ))}
            {tab === 'visits' &&
              (visits.length ? (
                visits.map((visit) => (
                  <Link
                    key={visit.id}
                    to={`/patient/records/visit/${visit.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-slate-900">{visit.reason}</span>
                      <span className="mt-0.5 block truncate text-xs text-slate-600">
                        {visit.date} · {visit.provider}
                      </span>
                    </span>
                    <span className="text-teal-700" aria-hidden="true">
                      ›
                    </span>
                  </Link>
                ))
              ) : (
                <Empty text="No visit summaries yet." />
              ))}
            {tab === 'medications' &&
              (medications.length ? (
                medications.map((med) => (
                  <article key={med.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700" aria-hidden="true">
                      Rx
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-bold text-slate-900">{med.name}</h2>
                      <p className="text-xs text-slate-600">
                        {med.dosage} · {med.provider}
                      </p>
                    </div>
                    {med.refillStatus ? (
                      <span className="shrink-0 text-xs font-semibold text-amber-700">{med.refillStatus}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => requestRefill(med.id)}
                        className="shrink-0 rounded-lg border border-teal-200 px-2.5 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                      >
                        Request refill
                      </button>
                    )}
                  </article>
                ))
              ) : (
                <Empty text="No current medications listed." />
              ))}
            {tab === 'immunizations' &&
              (immunizations.length ? (
                immunizations.map((item) => (
                  <div key={item.id || item.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <span className="text-sm font-semibold text-slate-900">{item.name}</span>
                    <span className="text-xs text-slate-600">{item.date}</span>
                  </div>
                ))
              ) : (
                <Empty text="No immunizations recorded yet." />
              ))}
          </>
        )}
      </section>
    </main>
  );
}

export function VisitSummaryPage() {
  const { visitId } = useParams();
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getVisitSummary(visitId)
      .then(setVisit)
      .catch((err) => setError(err.message || 'Visit summary not found'))
      .finally(() => setLoading(false));
  }, [visitId]);

  if (loading) {
    return (
      <main className="p-6">
        <p className="text-sm text-slate-600">Loading…</p>
      </main>
    );
  }

  if (!visit) {
    return (
      <main className="p-6">
        <Empty text={error || 'Visit summary not found.'} />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-6 sm:px-6">
      <Link to="/patient/records" className="text-sm font-semibold text-teal-700">
        ← Records
      </Link>
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Visit summary</p>
        <h1 className="mt-2 text-xl font-bold text-slate-900">{visit.reason}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {visit.date} · {visit.provider}
        </p>
        <h2 className="mt-6 text-sm font-bold text-slate-900">What happened</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{visit.summary}</p>
        <h2 className="mt-5 text-sm font-bold text-slate-900">Follow-up</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{visit.followUp}</p>
      </section>
    </main>
  );
}
