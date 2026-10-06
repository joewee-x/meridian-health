import React from 'react';
import { NavLink } from 'react-router-dom';

const items = [
  { label: 'Home', to: '/patient', icon: 'home', end: true },
  { label: 'Appointments', to: '/patient/appointments', icon: 'calendar' },
  { label: 'Messages', to: '/patient/messages', icon: 'messages' },
  { label: 'Records', to: '/patient/records', icon: 'records' },
  { label: 'Billing', to: '/patient/billing', icon: 'billing' },
  { label: 'Settings', to: '/patient/profile', icon: 'settings' },
];

function Icon({ name }) {
  const paths = {
    home: <path d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-9ZM9 21v-6h6v6" />,
    calendar: <path d="M7 3v3m10-3v3M4 9h16m-15 11h14a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1Z" />,
    messages: <path d="M20 11.5a7.5 7.5 0 0 1-8 7.48 8.5 8.5 0 0 1-3.48-.74L4 20l1.76-4.1A7.4 7.4 0 0 1 4 11.5a7.5 7.5 0 0 1 16 0Z" />,
    records: <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm6 0v5h5M9 13h6m-6 4h6" />,
    billing: <path d="M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Zm0 3h16M8 16h3" />,
    settings: <path d="M12 15.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Zm0-12.25v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.06 16.94l-1.42 1.42m12.72 0-1.42-1.42M7.06 7.06 5.64 5.64" />,
  };
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{paths[name]}</svg>;
}

export default function PatientNavigation() {
  return (
    <nav aria-label="Patient portal" className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-16 w-full max-w-lg min-w-0 items-stretch justify-around px-1 sm:max-w-3xl">
        {items.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-semibold transition-colors focus-visible:z-10 ${isActive ? 'text-teal-700' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {({ isActive }) => <><Icon name={item.icon} /><span className="truncate">{item.label}</span>{isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-teal-600" />}</>}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
