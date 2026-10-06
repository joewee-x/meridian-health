import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const content = {
  appointments: { title: 'Appointments', message: 'Your appointment list will be available here in the next patient-portal milestone.' },
  messages: { title: 'Messages', message: 'Your secure message inbox will be available here in the next patient-portal milestone.' },
  records: { title: 'Records', message: 'Your records, results, and refill updates will be available here in the next patient-portal milestone.' },
  billing: { title: 'Billing', message: 'Your billing details and payment options will be available here in the next patient-portal milestone.' },
};

export default function PatientDestinationPlaceholder({ section, appointmentDetail = false }) {
  const { appointmentId } = useParams();
  const [joiningCall, setJoiningCall] = useState(false);
  const detail = appointmentDetail ? { title: 'Telehealth appointment', message: 'Today at 10:30 AM with Dr. Elena Rostova, MD.' } : content[section];
  return <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"><p className="text-xs font-bold uppercase tracking-wider text-teal-700">Patient portal</p><h1 className="mt-2 text-xl font-bold text-slate-900">{detail.title}</h1><p className="mt-2 text-sm leading-relaxed text-slate-600">{detail.message}</p>{appointmentDetail && <><p className="mt-4 text-xs font-medium text-emerald-700">This video visit starts soon.</p><button type="button" onClick={() => setJoiningCall(true)} className="mt-4 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">Join video call</button>{joiningCall && <p className="mt-3 text-sm font-medium text-teal-800" role="status">Connecting to your mock video visit for appointment {appointmentId}…</p>}</>}<Link to="/patient" className="mt-6 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">← Back to Home</Link></section></main>;
}
