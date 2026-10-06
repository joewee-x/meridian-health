export const MESSAGE_PROVIDERS = [
  { id: 'prov-1', name: 'Dr. Elena Rostova, MD', specialty: 'Primary Care', initials: 'ER' },
  { id: 'prov-2', name: 'Dr. Marcus Vance, MD', specialty: 'Cardiology', initials: 'MV' },
  { id: 'prov-4', name: 'Dr. Sarah Jenkins, PsyD', specialty: 'Behavioral Health', initials: 'SJ' },
];

const SEED_THREADS = [
  { id: 'thread-1', providerId: 'prov-1', messages: [{ id: 'm-1', sender: 'provider', text: 'Your lab results are ready. Let me know if you have any questions.', timestamp: 'Today, 8:42 AM' }, { id: 'm-2', sender: 'patient', text: 'Thank you, I will take a look.', timestamp: 'Today, 8:56 AM' }], unread: true },
  { id: 'thread-2', providerId: 'prov-2', messages: [{ id: 'm-3', sender: 'provider', text: 'A reminder that your follow-up is scheduled for next week.', timestamp: 'Sep 2, 2:15 PM' }], unread: false },
];
// Versioned so the demo can reliably start with an unread thread after this update.
const KEY = 'meridian_healthcare_messages_v2';
export function getThreads() { try { const saved = localStorage.getItem(KEY); if (saved) return JSON.parse(saved); localStorage.setItem(KEY, JSON.stringify(SEED_THREADS)); } catch { /* mock fallback */ } return SEED_THREADS; }
export function saveThreads(threads) { try { localStorage.setItem(KEY, JSON.stringify(threads)); } catch { /* mock fallback */ } }
