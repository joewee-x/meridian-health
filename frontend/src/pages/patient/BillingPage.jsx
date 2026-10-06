import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBillingOverview, getBillingStatement, payBill } from '../../lib/api';

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

export function BillingPage() {
  const [balance, setBalance] = useState(0);
  const [statements, setStatements] = useState([]);
  const [plan, setPlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getBillingOverview()
      .then((data) => {
        setBalance(data.balance);
        setStatements(data.statements || []);
      })
      .catch((err) => setError(err.message || 'Unable to load billing'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-7">
      <h1 className="text-xl font-bold tracking-tight text-slate-900">Billing</h1>
      <p className="mt-0.5 text-sm text-slate-600">Clear, simple information about your care costs.</p>
      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p className="mt-6 text-sm text-slate-600">Loading billing…</p>
      ) : (
        <>
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Current balance</p>
            {balance > 0 ? (
              <>
                <p className="mt-2 text-3xl font-bold text-slate-900">{money(balance)}</p>
                <p className="mt-1 text-sm text-slate-600">Amount currently due</p>
                <Link
                  to="/patient/billing/pay"
                  className="mt-5 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                >
                  Pay now
                </Link>
                {!plan && (
                  <button
                    type="button"
                    onClick={() => setPlan(true)}
                    className="ml-3 rounded-xl px-3 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  >
                    Set up a payment plan
                  </button>
                )}
                {plan && (
                  <p className="mt-4 rounded-xl bg-teal-50 p-3 text-sm font-medium text-teal-800" role="status">
                    Payment plan set: 2 installments of {money(balance / 2)}.
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="mt-2 text-2xl font-bold text-emerald-700">You’re all paid up</p>
                <p className="mt-1 text-sm text-slate-600">There is no balance due right now.</p>
              </>
            )}
          </section>
          <section className="mt-7">
            <h2 className="text-base font-bold text-slate-900">Statements</h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              {statements.length ? (
                statements.map((statement) => (
                  <Link
                    key={statement.id}
                    to={`/patient/billing/statement/${statement.id}`}
                    className="flex min-w-0 items-center gap-3 border-b border-slate-100 p-4 last:border-0 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-900">{statement.date}</span>
                      <span className="mt-0.5 block truncate text-xs text-slate-600">{statement.visit}</span>
                    </span>
                    <span className="shrink-0 text-sm font-bold text-slate-800">{money(statement.amount)}</span>
                    <span className="text-teal-700" aria-hidden="true">
                      ›
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-5 text-sm text-slate-600">No statements yet.</div>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export function PayBillPage() {
  const [balance, setBalance] = useState(0);
  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getBillingOverview()
      .then((data) => setBalance(data.balance))
      .catch((err) => setError(err.message || 'Unable to load balance'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (card.replace(/\D/g, '').length < 12 || !expiry || cvv.replace(/\D/g, '').length < 3) {
      setError('Enter a valid card number, expiry date, and 3-digit security code.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await payBill({ cardNumber: card, expiry, cvv });
      setBalance(result.balance ?? 0);
      setPaid(true);
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (paid) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6">
        <section className="rounded-2xl border border-teal-200 bg-white p-6 text-center shadow-xs">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-xl text-emerald-700">
            ✓
          </span>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Payment received</h1>
          <p className="mt-2 text-sm text-slate-600">Your balance is now {money(balance)}.</p>
          <Link
            to="/patient/billing"
            className="mt-5 inline-flex rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Back to Billing
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-5 sm:px-6 sm:py-7">
      <Link to="/patient/billing" className="text-sm font-semibold text-teal-700">
        ← Billing
      </Link>
      <h1 className="mt-5 text-xl font-bold text-slate-900">Pay your bill</h1>
      <p className="mt-1 text-sm text-slate-600">
        Amount due today: <strong>{loading ? '…' : money(balance)}</strong>. This is a mock payment form.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        {error && (
          <p className="rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-800" role="alert">
            {error}
          </p>
        )}
        <label className="block text-sm font-semibold text-slate-800">
          Card number
          <input
            value={card}
            onChange={(event) => setCard(event.target.value)}
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="4242 4242 4242 4242"
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-semibold text-slate-800">
            Expiry date
            <input
              value={expiry}
              onChange={(event) => setExpiry(event.target.value)}
              placeholder="MM / YY"
              autoComplete="cc-exp"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Security code
            <input
              value={cvv}
              onChange={(event) => setCvv(event.target.value)}
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={submitting || loading}
          className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          {submitting ? 'Processing…' : `Pay ${money(balance)}`}
        </button>
      </form>
    </main>
  );
}

export function StatementPage() {
  const { statementId } = useParams();
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getBillingStatement(statementId)
      .then(setStatement)
      .catch((err) => setError(err.message || 'Statement not found'))
      .finally(() => setLoading(false));
  }, [statementId]);

  if (loading) {
    return (
      <main className="p-6 text-sm text-slate-600">Loading statement…</main>
    );
  }

  if (!statement) {
    return <main className="p-6 text-sm text-slate-600">{error || 'Statement not found.'}</main>;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <Link to="/patient/billing" className="text-sm font-semibold text-teal-700">
        ← Billing
      </Link>
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900">Statement details</h1>
        <p className="mt-1 text-sm text-slate-600">
          {statement.date} · {statement.visit}
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <caption className="sr-only">Itemized charges for {statement.date}</caption>
            <thead className="border-b border-slate-200 text-xs text-slate-500">
              <tr>
                <th scope="col" className="pb-2">
                  Service
                </th>
                <th scope="col" className="pb-2 text-right">
                  Billed
                </th>
                <th scope="col" className="pb-2 text-right">
                  Insurance
                </th>
                <th scope="col" className="pb-2 text-right">
                  You owe
                </th>
              </tr>
            </thead>
            <tbody>
              {(statement.lines || []).map((line) => (
                <tr key={line.service} className="border-b border-slate-100">
                  <th scope="row" className="py-3 font-semibold text-slate-800">
                    {line.service}
                  </th>
                  <td className="py-3 text-right text-slate-600">{money(line.billed)}</td>
                  <td className="py-3 text-right text-slate-600">−{money(line.insurance)}</td>
                  <td className="py-3 text-right font-semibold text-slate-900">{money(line.owed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-right text-sm font-bold text-slate-900">Patient owed: {money(statement.amount)}</p>
      </section>
    </main>
  );
}
