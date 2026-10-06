export const APPOINTMENT_PROVIDERS = [
  { id: 'prov-1', name: 'Dr. Elena Rostova, MD', specialty: 'Primary Care', initials: 'ER', supportsTelehealth: true },
  { id: 'prov-2', name: 'Dr. Marcus Vance, MD', specialty: 'Cardiology', initials: 'MV', supportsTelehealth: true },
  { id: 'prov-4', name: 'Dr. Sarah Jenkins, PsyD', specialty: 'Behavioral Health', initials: 'SJ', supportsTelehealth: true },
];

const SEED_APPOINTMENTS = [
  { id: 'apt-001', providerId: 'prov-1', provider: 'Dr. Elena Rostova, MD', specialty: 'Primary Care', date: 'Today', time: '10:30 AM', visitType: 'Telehealth', reason: 'Follow-up', startsSoon: true, status: 'upcoming' },
  { id: 'apt-002', providerId: 'prov-2', provider: 'Dr. Marcus Vance, MD', specialty: 'Cardiology', date: 'Sep 18, 2026', time: '2:15 PM', visitType: 'In person', reason: 'Annual checkup', startsSoon: false, status: 'upcoming' },
  { id: 'apt-101', providerId: 'prov-1', provider: 'Dr. Elena Rostova, MD', specialty: 'Primary Care', date: 'Aug 14, 2026', time: '9:00 AM', visitType: 'In person', reason: 'Annual checkup', status: 'past' },
  { id: 'apt-102', providerId: 'prov-4', provider: 'Dr. Sarah Jenkins, PsyD', specialty: 'Behavioral Health', date: 'Jul 29, 2026', time: '3:30 PM', visitType: 'Telehealth', reason: 'Follow-up', status: 'past' },
];

const STORAGE_KEY = 'meridian_healthcare_appointments_v1';

export function getAppointments() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_APPOINTMENTS));
  } catch {
    // The interface remains usable when storage is unavailable.
  }
  return SEED_APPOINTMENTS;
}

export function saveAppointments(appointments) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments)); } catch { /* mock state only */ }
}

export const AVAILABLE_SLOTS = [
  { date: 'Tue, Sep 8', times: ['8:30 AM', '10:00 AM', '1:15 PM'] },
  { date: 'Wed, Sep 9', times: ['9:45 AM', '11:30 AM', '3:00 PM'] },
  { date: 'Thu, Sep 10', times: ['8:00 AM', '12:45 PM', '4:15 PM'] },
];
