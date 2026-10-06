import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { SPECIALTIES } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { listProviders, getProvider } from '../../lib/api';

function ProviderAvatar({ provider }) {
  const initials =
    provider.initials ||
    provider.name
      .split(' ')
      .filter(Boolean)
      .slice(-2)
      .map((part) => part[0])
      .join('');
  return (
    <div
      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border text-lg font-bold ${
        provider.avatarColor || 'border-teal-200 bg-teal-100 text-teal-800'
      }`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

export function DirectoryPage() {
  const [searchParams] = useSearchParams();
  const initialSpecialty = searchParams.get('specialty') || 'all';
  const initialCareType = searchParams.get('careType') || 'all';
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [careType, setCareType] = useState(initialCareType);
  const [allProviders, setAllProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sp = searchParams.get('specialty');
    const ct = searchParams.get('careType');
    if (sp) setSpecialty(sp);
    if (ct) setCareType(ct);
  }, [searchParams]);

  useEffect(() => {
    listProviders({ limit: 100 })
      .then(setAllProviders)
      .catch((err) => setError(err.message || 'Unable to load providers'))
      .finally(() => setLoading(false));
  }, []);

  const providers = useMemo(
    () =>
      allProviders.filter((provider) => {
        const matchesName =
          provider.name.toLowerCase().includes(query.toLowerCase()) ||
          (provider.role || '').toLowerCase().includes(query.toLowerCase());
        const matchesSpecialty = specialty === 'all' || provider.specialtyId === specialty;
        const matchesCareType =
          careType === 'all' ||
          (careType === 'telehealth' ? provider.telehealth : careType === 'inPerson' ? provider.inPerson : true);
        return matchesName && matchesSpecialty && matchesCareType;
      }),
    [allProviders, query, specialty, careType]
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Link to="/" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
            ← Meridian Health
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">Find a doctor</h1>
          <p className="mt-2 max-w-xl text-base text-slate-600">
            Browse our board-certified care team and find the right fit for your next visit.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <label className="flex-1">
              <span className="sr-only">Search providers</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by provider or specialty"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              />
            </label>
            <label>
              <span className="sr-only">Filter by specialty</span>
              <select
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 sm:min-w-56"
              >
                <option value="all">All specialties</option>
                {SPECIALTIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Filter by visit type</span>
              <select
                value={careType}
                onChange={(event) => setCareType(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 sm:min-w-44"
              >
                <option value="all">All visit types</option>
                <option value="inPerson">In-Person Clinic</option>
                <option value="telehealth">Telehealth Video</option>
              </select>
            </label>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {error && (
          <p className="mb-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
            {error}
          </p>
        )}
        {loading ? (
          <p className="text-sm text-slate-600">Loading providers…</p>
        ) : providers.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <article
                key={provider.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                <div className="flex gap-3">
                  <ProviderAvatar provider={provider} />
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-slate-900">{provider.name}</h2>
                    <p className="mt-0.5 text-xs font-semibold text-teal-700">{provider.role}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {provider.experienceYears} years experience · ★ {provider.rating}
                    </p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-600">{provider.bio}</p>
                <div className="mt-auto flex gap-2 pt-5">
                  <Link
                    to={`/directory/${provider.id}`}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  >
                    View profile
                  </Link>
                  <BookButton providerId={provider.id} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="font-semibold text-slate-900">No providers match</p>
            <p className="mt-1 text-sm text-slate-600">Try a different specialty or search term.</p>
          </div>
        )}
      </section>
    </main>
  );
}

function BookButton({ providerId }) {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const go = () => {
    const destination = `/patient/appointments/book?provider=${providerId}`;
    if (isAuthenticated && role === 'patient') navigate(destination);
    else
      navigate('/login', {
        state: { from: { pathname: '/patient/appointments/book', search: `?provider=${providerId}` } },
      });
  };
  return (
    <button
      type="button"
      onClick={go}
      className="flex-1 rounded-xl bg-teal-700 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
    >
      Book appointment
    </button>
  );
}

export function ProviderProfilePage() {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProvider(providerId)
      .then(setProvider)
      .catch((err) => setError(err.message || 'Provider not found'))
      .finally(() => setLoading(false));
  }, [providerId]);

  if (loading) {
    return (
      <main className="p-6">
        <p className="text-sm text-slate-600">Loading provider…</p>
      </main>
    );
  }

  if (!provider) {
    return (
      <main className="p-6">
        <Link to="/directory" className="text-sm font-semibold text-teal-700">
          ← Directory
        </Link>
        <p className="mt-5 text-sm text-slate-600">{error || 'Provider not found.'}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link to="/directory" className="text-sm font-semibold text-teal-700">
          ← Back to doctors
        </Link>
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <ProviderAvatar provider={provider} />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{provider.name}</h1>
              <p className="mt-1 text-sm font-semibold text-teal-700">{provider.role}</p>
              <p className="mt-2 text-sm text-slate-600">
                {provider.experienceYears} years experience · ★ {provider.rating} ({provider.reviewsCount}{' '}
                reviews)
              </p>
            </div>
          </div>
          <div className="mt-7 grid gap-6 border-t border-slate-100 pt-6 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">About</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{provider.bio}</p>
              <p className="mt-3 text-xs text-slate-500">{provider.education}</p>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Care details</h2>
              <p className="mt-2 text-sm text-slate-600">
                Languages: {(provider.languages || []).join(', ')}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {provider.telehealth ? 'Telehealth available' : 'In-person visits available'}
              </p>
              <p className="mt-2 text-sm text-slate-600">{provider.location}</p>
            </div>
          </div>
          <div className="mt-7 border-t border-slate-100 pt-6">
            <BookButton providerId={provider.id} />
          </div>
        </section>
      </div>
    </main>
  );
}
