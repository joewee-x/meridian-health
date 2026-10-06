const PATIENTS = [
  { id: 'user-patient-1', name: 'Sarah Connor', email: 'patient@meridian.health', phone: '(555) 342-8901', registered: 'Apr 12, 2025', status: 'active', billing: 'balance owed', balance: 42.5, insurance: 'Meridian Choice Health · MC-4820193', appointments: [{ date: 'Today, 10:30 AM', provider: 'Dr. Elena Rostova', status: 'Scheduled' }, { date: 'Aug 14, 2026', provider: 'Dr. Elena Rostova', status: 'Completed' }] },
  { id: 'patient-2', name: 'Jordan Lee', email: 'jordan.lee@example.com', phone: '(555) 918-2234', registered: 'Nov 8, 2025', status: 'active', billing: 'paid up', balance: 0, insurance: 'Northwest Care · NW-883120', appointments: [{ date: 'Sep 10, 2:00 PM', provider: 'Dr. Marcus Vance', status: 'Scheduled' }] },
  { id: 'patient-3', name: 'Amelia Brooks', email: 'amelia.brooks@example.com', phone: '(555) 770-4401', registered: 'Jun 20, 2024', status: 'inactive', billing: 'paid up', balance: 0, insurance: 'Self-pay', appointments: [{ date: 'Jul 29, 2026', provider: 'Dr. Sarah Jenkins', status: 'Completed' }] },
];
const KEY = 'meridian_healthcare_admin_patients_v1';
export function getAdminPatients() { try { const saved = localStorage.getItem(KEY); if (saved) return JSON.parse(saved); localStorage.setItem(KEY, JSON.stringify(PATIENTS)); } catch { /* mock fallback */ } return PATIENTS; }
export function saveAdminPatients(value) { try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { /* mock fallback */ } }
