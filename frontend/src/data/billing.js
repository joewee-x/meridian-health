export const STATEMENTS = [
  { id: 'statement-1', date: 'Sep 4, 2026', visit: 'Primary care visit · Dr. Elena Rostova', amount: 42.5, lines: [{ service: 'Office visit', billed: 150, insurance: 107.5, owed: 42.5 }] },
  { id: 'statement-2', date: 'Aug 14, 2026', visit: 'Annual checkup · Dr. Elena Rostova', amount: 0, lines: [{ service: 'Preventive checkup', billed: 180, insurance: 180, owed: 0 }] },
];
const BALANCE_KEY = 'meridian_healthcare_balance_v1';
export function getBalance() { try { const value = localStorage.getItem(BALANCE_KEY); return value === null ? 42.5 : Number(value); } catch { return 42.5; } }
export function saveBalance(value) { try { localStorage.setItem(BALANCE_KEY, String(value)); } catch { /* mock fallback */ } }
