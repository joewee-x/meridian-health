import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, role, logout, getPortalPath } = useAuth();

  const navLinks = [
    { name: 'Specialties', href: '/#specialties' },
    { name: 'Our Doctors', href: '/directory' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Security & Privacy', href: '/#security' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      {/* Top emergency notice bar */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs text-center flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" aria-hidden="true"></span>
        <span>
          Experiencing a medical emergency? Please call <strong className="text-white underline">911</strong> or go to the nearest emergency room immediately.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[72px]">
          {/* Logo & Brand */}
          <Link 
            to="/" 
            className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-lg p-1"
            aria-label="Meridian Health Home"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/20">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                Meridian <span className="text-teal-700 font-semibold">Health</span>
              </span>
              <span className="block text-[11px] text-slate-500 font-medium tracking-wide">
                Human-Centered Care
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 rounded px-1 py-0.5"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="block text-xs font-bold text-slate-900 leading-tight">
                    {user?.name}
                  </span>
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                    {role}
                  </span>
                </div>
                <Link
                  to={getPortalPath(role)}
                  className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors"
                >
                  Go to {role === 'patient' ? 'Portal' : role === 'provider' ? 'Dashboard' : 'Console'}
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                  title="Sign out of your session"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600"
                >
                  Sign In
                </Link>
                <Link
                  to="/book"
                  className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 active:bg-teal-900 rounded-xl shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                >
                  Book an appointment
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated ? (
              <Link
                to={getPortalPath(role)}
                className="text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 px-3 py-1.5 rounded-lg shadow-sm"
              >
                Portal
              </Link>
            ) : (
              <Link
                to="/book"
                className="text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 px-3 py-1.5 rounded-lg shadow-sm"
              >
                Book
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-700 rounded-lg"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-bold text-slate-900">{user?.name}</span>
                    <span className="text-xs text-teal-700 font-medium capitalize">{role} Account</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs font-semibold text-rose-700 hover:text-rose-900"
                  >
                    Sign Out
                  </button>
                </div>
                <Link
                  to={getPortalPath(role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-sm"
                >
                  Enter {role === 'patient' ? 'Patient Portal' : role === 'provider' ? 'Provider Dashboard' : 'Admin Console'}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200"
                >
                  Sign In to Patient Portal
                </Link>
                <Link
                  to="/book"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-sm"
                >
                  Book an appointment
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
