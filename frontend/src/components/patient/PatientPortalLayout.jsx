import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PatientNavigation from './PatientNavigation';

export default function PatientPortalLayout() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 pb-[calc(4rem+env(safe-area-inset-bottom))]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-3xl items-center gap-2 px-3 sm:px-6">
          <Link to="/" aria-label="Meridian Health landing page" className="flex min-w-0 items-center gap-2 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 sm:gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-600/20" aria-hidden="true">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-slate-900">Meridian <span className="text-teal-700">Health</span></p>
              <p className="truncate text-[11px] font-medium text-slate-500">Patient portal</p>
            </div>
          </Link>
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <p className="hidden text-sm font-medium text-slate-600 sm:block">Hi, {firstName}</p>
            <Link to="/patient/appointments/book" className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"><span className="sm:hidden">Book</span><span className="hidden sm:inline">Book appointment</span></Link>
            <Link to="/" className="rounded-lg px-2 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600" aria-label="Back to Meridian Health landing page"><span className="sm:hidden">Back</span><span className="hidden sm:inline">Back to website</span></Link>
          </div>
        </div>
      </header>
      <Outlet />
      <PatientNavigation />
    </div>
  );
}
