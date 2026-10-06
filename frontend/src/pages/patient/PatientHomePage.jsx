import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPatientDashboard } from '../../lib/api';

const cardIcons = {
  appointment: <path d="M7 3v3m10-3v3M4 9h16m-15 11h14a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1Zm4 4 2 2 4-4" />,
  messages: <path d="M20 11.5a7.5 7.5 0 0 1-8 7.48 8.5 8.5 0 0 1-3.48-.74L4 20l1.76-4.1A7.4 7.4 0 0 1 4 11.5a7.5 7.5 0 0 1 16 0Z" />,
  records: <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm6 0v5h5M9 13h6m-6 4h6" />,
  billing: <path d="M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Zm0 3h16M8 16h3" />,
};

function CardIcon({ type }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        {cardIcons[type]}
      </svg>
    </span>
  );
}

function DashboardCard({ to, label, detail, type, badge, action }) {
  return (
    <Link
      to={to}
      aria-label={`${label}: ${detail}. ${action}`}
      className="group flex min-h-[82px] w-full min-w-0 max-w-full items-center gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-xs transition hover:border-teal-200 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:gap-3 sm:p-4"
    >
      <CardIcon type={type} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">{detail}</p>
      </div>
      {badge && (
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-teal-700 px-1.5 text-xs font-bold text-white" aria-hidden="true">
          {badge}
        </span>
      )}
      <svg className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
      </svg>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="flex min-h-[82px] w-full min-w-0 max-w-full animate-pulse items-center gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 sm:gap-3 sm:p-4">
      <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3 w-20 rounded bg-slate-200" />
        <div className="h-4 w-4/5 rounded bg-slate-200" />
      </div>
    </div>
  );
}

export default function PatientHomePage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setError('');
    getPatientDashboard()
      .then((data) => {
        if (!cancelled) setDashboard(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Unable to load dashboard');
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const cards =
    dashboard &&
    [
      {
        type: 'appointment',
        label: 'Next appointment',
        detail: dashboard.appointment
          ? `${dashboard.upcomingAppointmentCount} upcoming appointment${dashboard.upcomingAppointmentCount === 1 ? '' : 's'} · Next: ${dashboard.appointment.provider}`
          : 'No upcoming appointments — book one',
        to:
          dashboard.upcomingAppointmentCount > 1
            ? '/patient/appointments'
            : dashboard.appointment
              ? `/patient/appointments/${dashboard.appointment.id}`
              : '/patient/appointments',
        action:
          dashboard.upcomingAppointmentCount > 1
            ? 'View upcoming appointments'
            : dashboard.appointment?.startsSoon
              ? 'Open appointment details or join video call'
              : 'Open appointments',
      },
      {
        type: 'messages',
        label: 'Messages',
        detail: dashboard.unreadMessages
          ? `${dashboard.unreadMessages} unread message${dashboard.unreadMessages === 1 ? '' : 's'}`
          : 'No unread messages',
        badge: dashboard.unreadMessages || null,
        to: '/patient/messages',
        action: 'Open messages inbox',
      },
      {
        type: 'records',
        label: 'Results & refills',
        detail: dashboard.update || 'No new results or refill updates',
        to: '/patient/records',
        action: 'Open records',
      },
      {
        type: 'billing',
        label: 'Billing',
        detail: dashboard.outstandingBalance
          ? `$${Number(dashboard.outstandingBalance).toFixed(2)} outstanding balance`
          : 'No outstanding balance',
        to: '/patient/billing',
        action: 'Open billing',
      },
    ];

  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-5 sm:px-6 sm:py-7">
      <div className="mb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Your health at a glance</h1>
        <p className="mt-0.5 text-sm text-slate-600">Choose a task to continue.</p>
      </div>
      {error && (
        <p className="mb-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
          {error}
        </p>
      )}
      <section aria-label="Patient care summary" className="grid w-full min-w-0 gap-3 md:grid-cols-2">
        {cards
          ? cards.map((card) => <DashboardCard key={card.type} {...card} />)
          : Array.from({ length: 4 }, (_, index) => <CardSkeleton key={index} />)}
      </section>
    </main>
  );
}
