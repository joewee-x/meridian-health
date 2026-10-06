import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Trust & Emergency Row */}
        <div className="bg-slate-800/80 rounded-2xl p-6 mb-12 border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-base">HIPAA-Aware Security & Protected Health Information</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
                All patient medical records, appointments, and secure messages are governed by strict role-based authorization, 256-bit encryption, and immutable audit logs.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2 bg-slate-900/90 px-4 py-2.5 rounded-xl border border-slate-700 text-xs text-slate-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            System Status: All Clinical Systems Operational
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800 text-sm">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Meridian <span className="text-teal-400">Health</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm max-w-sm">
              A modern healthcare platform engineered for patients, physicians, and administrative teams. Dedicated to calm, accessible, and transparent medical experiences.
            </p>
            <div className="pt-2 text-xs text-slate-400">
              <p className="font-semibold text-slate-300 mb-1">Clinical Helplines & Support:</p>
              <p>Appointments: (800) 555-0199 (Mon–Fri 7am–7pm PT)</p>
              <p>Nurse Advice Line: (800) 555-0198 (Available 24/7)</p>
            </div>
          </div>

          {/* Col 1: Patients */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">Patient Care</h4>
            <ul className="space-y-2.5 text-slate-400">
              <li>
                <Link to="/book" className="hover:text-teal-400 transition-colors">Book an Appointment</Link>
              </li>
              <li>
                <Link to="/directory" className="hover:text-teal-400 transition-colors">Provider Directory</Link>
              </li>
              <li>
                <a href="#specialties" className="hover:text-teal-400 transition-colors">Specialties & Care</a>
              </li>
              <li>
                <Link to="/login" className="hover:text-teal-400 transition-colors">Patient Portal Sign In</Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-teal-400 transition-colors">Telehealth Guide</a>
              </li>
            </ul>
          </div>

          {/* Col 2: Clinicians & Staff */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">Portals & Roles</h4>
            <ul className="space-y-2.5 text-slate-400">
              <li>
                <Link to="/login?role=patient" className="hover:text-teal-400 transition-colors">Patient Portal Demo</Link>
              </li>
              <li>
                <Link to="/login?role=provider" className="hover:text-teal-400 transition-colors">Provider Dashboard Demo</Link>
              </li>
              <li>
                <Link to="/login?role=admin" className="hover:text-teal-400 transition-colors">Admin Console Demo</Link>
              </li>
              <li>
                <a href="#security" className="hover:text-teal-400 transition-colors">Audit Trail Architecture</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Compliance & Trust */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">Trust & Compliance</h4>
            <ul className="space-y-2.5 text-slate-400">
              <li>
                <a href="#security" className="hover:text-teal-400 transition-colors">HIPAA Compliance</a>
              </li>
              <li>
                <span className="text-slate-400">SOC 2 Type II Certified (Mock)</span>
              </li>
              <li>
                <span className="text-slate-400">Patient Privacy Policy</span>
              </li>
              <li>
                <span className="text-slate-400">Terms of Care</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and disclaimers */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Meridian Health Platform. Built with React.js, Tailwind CSS, and Vanilla JavaScript.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">
              Emergency Notice: For medical emergencies, always dial 911 immediately.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
