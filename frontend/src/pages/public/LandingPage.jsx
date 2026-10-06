import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  SPECIALTIES, 
  FEATURED_PROVIDERS, 
  TRUST_POINTS, 
  HOW_IT_WORKS_STEPS, 
  PATIENT_TESTIMONIALS, 
  FAQ_ITEMS 
} from '../../data/mockData';

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedCareType, setSelectedCareType] = useState('all');
  const [activeFaq, setActiveFaq] = useState(null);
  const [heroSpecialty, setHeroSpecialty] = useState('all');
  const [heroCareFormat, setHeroCareFormat] = useState('all');

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleHeroSearch = (e) => {
    e?.preventDefault?.();
    const params = new URLSearchParams();
    if (heroSpecialty !== 'all') {
      params.set('specialty', heroSpecialty);
    }
    if (heroCareFormat !== 'all') {
      params.set('careType', heroCareFormat);
    }
    const queryString = params.toString();
    navigate(queryString ? `/directory?${queryString}` : '/directory');
  };

  const filteredProviders = selectedCareType === 'telehealth'
    ? FEATURED_PROVIDERS.filter((p) => p.telehealth)
    : selectedCareType === 'inPerson'
    ? FEATURED_PROVIDERS.filter((p) => p.inPerson)
    : FEATURED_PROVIDERS;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      
      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section 
        className="relative overflow-hidden border-b border-slate-200/80 bg-white"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 15% 30%, rgba(240, 253, 250, 0.95) 0%, rgba(255, 255, 255, 0.96) 55%, rgba(255, 255, 255, 0.88) 100%),
            linear-gradient(to right, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 50%, rgba(255, 255, 255, 0.72) 100%),
            url('/images/hero-bg.jpg')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Soft atmospheric ambient glow */}
        <div className="absolute top-0 right-1/4 -z-10 w-[500px] h-[500px] bg-teal-100/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -z-10 w-[450px] h-[450px] bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />
        
        {/* Subtle high-precision clinical dot grid */}
        <div 
          className="absolute inset-0 -z-10 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#0d9488 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 lg:pt-14 lg:pb-16 xl:pt-16 xl:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Core Value Proposition, Trust, & Action */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12] mb-5 lg:mb-6">
                Healthcare centered around{' '}
                <span className="text-teal-700 underline decoration-teal-300 decoration-wavy decoration-2">
                  your life
                </span>, not paperwork.
              </h1>

              {/* Calm, plain-language description */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mb-6 lg:mb-7">
                Connect with board-certified physicians for compassionate in-person and virtual care. Review plain-language lab results, message your care team 24/7, and book trusted appointments in under 90 seconds.
              </p>

              {/* Interactive Quick Care Search Bar */}
              {/* <form 
                onSubmit={handleHeroSearch}
                className="w-full bg-white/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-lg shadow-teal-950/5 mb-8"
              >
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Quick Provider & Care Finder
                  </span>
                  <span className="text-[11px] font-normal text-slate-400 hidden sm:inline">No waiting on hold</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="relative">
                    <label htmlFor="hero-specialty-select" className="sr-only">Specialty</label>
                    <select
                      id="hero-specialty-select"
                      value={heroSpecialty}
                      onChange={(e) => setHeroSpecialty(e.target.value)}
                      className="w-full h-11 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 bg-slate-50/90 hover:bg-slate-100/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="all">Any Specialty (All)</option>
                      {SPECIALTIES.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <label htmlFor="hero-format-select" className="sr-only">Visit Format</label>
                    <select
                      id="hero-format-select"
                      value={heroCareFormat}
                      onChange={(e) => setHeroCareFormat(e.target.value)}
                      className="w-full h-11 px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 bg-slate-50/90 hover:bg-slate-100/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="all">In-Person or Video</option>
                      <option value="inPerson">In-Person Clinic</option>
                      <option value="telehealth">Telehealth Video</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 active:bg-teal-900 rounded-xl shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  >
                    <span>Find Available Slot</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </form> */}

              {/* Primary Call to Action & Directory Link */}
              {/* <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 mb-8">
                <Link
                  to="/book"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-teal-700 hover:bg-teal-800 active:bg-teal-900 rounded-xl shadow-md shadow-teal-700/20 hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 group"
                >
                  <span>Book an appointment</span>
                  <svg 
                    className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>

                <Link
                  to="/directory"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-slate-700 hover:text-teal-800 hover:bg-white/90 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-xs transition-colors focus-visible:ring-2 focus-visible:ring-teal-600"
                >
                  Browse our doctors
                </Link>
              </div> */}

              {/* Trust Indicators */}
              <div className="pt-5 lg:pt-6 border-t border-slate-200/80 w-full flex flex-wrap items-center gap-5 sm:gap-6 lg:gap-7 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-semibold text-slate-800">100% Board-Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-semibold text-slate-800">HIPAA-Aware Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-semibold text-slate-800">Transparent Pricing</span>
                </div>
              </div>

            </div>

            {/* Right Column: Clean Doctor Image & Interactive Status Badges */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Ambient glow behind image */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-teal-500/20 via-emerald-400/15 to-sky-400/20 rounded-3xl blur-2xl -z-10" />

                {/* Main Clean Image Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 group">
                  <img
                    src="/images/hero-doctor.jpg"
                    alt="Dr. Sarah Jenkins, board-certified physician at Meridian Health"
                    fetchPriority="high"
                    loading="eager"
                    decoding="async"
                    className="w-full h-[340px] sm:h-[460px] lg:h-[clamp(400px,58vh,560px)] object-cover object-center group-hover:scale-[1.03] transition-transform duration-700"
                  />
                  
                  {/* Subtle gradient vignette at the bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-transparent to-transparent pointer-events-none" />

                  {/* Doctor Info Bar on the image bottom */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold tracking-tight drop-shadow-sm">Dr. Sarah Jenkins, MD</p>
                        <p className="text-xs text-teal-200 font-medium drop-shadow-sm">Family & Preventative Medicine</p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 text-[11px] font-semibold text-white backdrop-blur-xs shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Active Today
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* TRUST SIGNALS & SECURITY ARCHITECTURE */}
      {/* ========================================================================= */}
      <section id="security" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
              Security, Privacy & Standards
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Built on strict clinical integrity and trust
            </h3>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              We separate clinical records from administrative operations and enforce patient privacy at every architectural layer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_POINTS.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5">
                    {item.iconType === 'shield' && (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    )}
                    {item.iconType === 'certificate' && (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {item.iconType === 'calendar' && (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    {item.iconType === 'file' && (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-teal-700">
                  <span>Verified Standard</span>
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SPECIALTIES AT A GLANCE */}
      {/* ========================================================================= */}
      <section id="specialties" className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
                Clinical Specialties
              </h2>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Care tailored to what you are experiencing
              </h3>
              <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-xl">
                Every department is led by dedicated medical specialists equipped for same-day evaluation.
              </p>
            </div>

            <Link
              to="/book"
              className="inline-flex items-center text-sm font-semibold text-teal-700 hover:text-teal-800 group"
            >
              <span>View all 12 clinical specialties</span>
              <svg className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPECIALTIES.map((specialty) => (
              <div 
                key={specialty.id}
                className="bg-white border border-slate-200/90 hover:border-teal-400 rounded-2xl p-6 transition-all shadow-xs flex flex-col justify-between group"
              >
                <div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-teal-800 transition-colors mb-2">
                    {specialty.name}
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {specialty.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {specialty.availability}
                  </span>
                  <Link
                    to={`/book?specialty=${specialty.id}`}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Book visit</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* FEATURED DOCTORS SPOTLIGHT */}
      {/* ========================================================================= */}
      <section id="providers" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
                Our Medical Team
              </h2>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Meet our board-certified physicians
              </h3>
              <p className="text-slate-600 text-sm sm:text-base mt-2">
                Experienced clinicians who spend time listening and explaining your treatment options in plain terms.
              </p>
            </div>

            {/* Subtle visit type filter */}
            <div className="inline-flex p-1 bg-slate-200/80 rounded-xl text-xs font-semibold self-start md:self-auto">
              <button
                type="button"
                onClick={() => setSelectedCareType('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedCareType === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Care ({FEATURED_PROVIDERS.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCareType('inPerson')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedCareType === 'inPerson'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In-Person Clinic
              </button>
              <button
                type="button"
                onClick={() => setSelectedCareType('telehealth')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedCareType === 'telehealth'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Telehealth Video
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProviders.map((doc) => (
              <div 
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-400 transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Doctor Avatar + Basic Info */}
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border shrink-0 ${doc.avatarColor}`}>
                      {doc.name.split(' ')[1]?.[0] || 'D'}{doc.name.split(' ')[2]?.[0] || 'R'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{doc.name}</h4>
                      <p className="text-xs text-teal-700 font-medium truncate mt-0.5">{doc.role.split('&')[0].trim()}</p>
                    </div>
                  </div>

                  {/* Rating & Background */}
                  <div className="flex items-center justify-between text-xs text-slate-500 py-2 border-y border-slate-100 mb-3">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <span className="text-amber-500">★</span> {doc.rating}
                    </span>
                    <span className="truncate">{doc.experienceYears} yrs exp</span>
                  </div>

                  {/* Next opening */}
                  <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
                    <span>Next: {doc.availability}</span>
                  </p>
                </div>

                <div className="mt-5 pt-3">
                  <Link
                    to={`/book?provider=${doc.id}`}
                    className="w-full block text-center py-2 px-3 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-700 hover:text-white rounded-xl transition-colors"
                  >
                    Book with {doc.name.split(' ')[1]}
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* HOW IT WORKS: TASK-ORIENTED 3-STEP FLOW */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
              Simple & Transparent
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              How Meridian Health works for you
            </h3>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Designed so you always know what to do next without facing complicated forms or hold music.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {HOW_IT_WORKS_STEPS.map((step, idx) => (
              <div 
                key={step.step}
                className="bg-slate-50 rounded-2xl p-7 border border-slate-200/90 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-black text-teal-600/70 font-mono tracking-tighter">
                      {step.step}
                    </span>
                    <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 mb-3 leading-snug">
                    {step.title}
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/70">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {step.tip}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Action prompt under steps */}
          <div className="mt-12 text-center">
            <Link
              to="/book"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors"
            >
              Experience the booking flow
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* PATIENT TESTIMONIALS */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
              Patient Experiences
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Clear care without the anxiety
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PATIENT_TESTIMONIALS.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex text-amber-500 mb-4" aria-hidden="true">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed italic mb-6">
                    "{item.quote}"
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{item.patient}</span>
                    <span className="text-slate-500">{item.city}</span>
                  </div>
                  <span className="text-teal-700 font-medium bg-teal-50 px-2 py-1 rounded">
                    {item.visitType}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* FREQUENTLY ASKED QUESTIONS */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
              Common Questions
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Clear answers to help you get started
            </h3>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, index) => (
              <div 
                key={index}
                className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-slate-900 hover:text-teal-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  aria-expanded={activeFaq === index}
                >
                  <span className="text-sm sm:text-base">{faq.question}</span>
                  <svg 
                    className={`w-5 h-5 text-slate-500 transition-transform ${activeFaq === index ? 'rotate-180 text-teal-700' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeFaq === index && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* FINAL FOCUSED CALL-TO-ACTION */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-teal-800 to-teal-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className="inline-block px-3 py-1 rounded-full bg-teal-700/80 text-teal-200 text-xs font-semibold tracking-wide border border-teal-600">
            Same-day care available
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white max-w-2xl mx-auto leading-tight">
            Ready to take care of your health today?
          </h2>
          <p className="text-teal-100/90 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Schedule an appointment with a board-certified doctor in under 90 seconds. No waiting on hold, no surprises.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/book"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-teal-900 bg-white hover:bg-teal-50 active:bg-slate-100 rounded-xl shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>Book an appointment now</span>
              <svg className="w-5 h-5 text-teal-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 text-base font-semibold text-white hover:bg-teal-700/60 rounded-xl border border-teal-600 transition-colors"
            >
              Sign In to Patient Portal
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
