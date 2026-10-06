export const VISIT_SUMMARIES = [
  { id: 'visit-1', date: 'Aug 14, 2026', provider: 'Dr. Elena Rostova, MD', reason: 'Annual checkup', summary: 'We reviewed your overall health, blood pressure, and preventive care. Everything discussed is on track.', followUp: 'Continue your current routine and schedule your next checkup in one year.' },
  { id: 'visit-2', date: 'Jul 29, 2026', provider: 'Dr. Sarah Jenkins, PsyD', reason: 'Follow-up', summary: 'You discussed sleep and stress patterns and practiced a breathing exercise together.', followUp: 'Try the breathing exercise once daily and follow up in four weeks.' },
];
export const LAB_RESULTS = [
  { id: 'lab-1', name: 'Cholesterol', date: 'Sep 4, 2026', value: '182 mg/dL', status: 'normal', explanation: 'Your total cholesterol is in the healthy range for most adults.', range: 'Healthy range: under 200 mg/dL' },
  { id: 'lab-2', name: 'Vitamin D', date: 'Sep 4, 2026', value: '24 ng/mL', status: 'attention', explanation: 'This is a little below the usual target. Your care team may discuss nutrition or a supplement.', range: 'Typical target: 30–100 ng/mL', education: 'https://www.nhs.uk/conditions/vitamins-and-minerals/vitamin-d/' },
];
export const MEDICATIONS = [
  { id: 'med-1', name: 'Lisinopril', dosage: '10 mg once daily', provider: 'Dr. Elena Rostova, MD' },
  { id: 'med-2', name: 'Vitamin D3', dosage: '1,000 IU once daily', provider: 'Dr. Elena Rostova, MD' },
];
export const IMMUNIZATIONS = [
  { name: 'Influenza (seasonal)', date: 'Oct 12, 2025' },
  { name: 'COVID-19 booster', date: 'Sep 6, 2025' },
  { name: 'Tdap', date: 'Apr 18, 2022' },
];
const REFILL_KEY = 'meridian_healthcare_refills_v1';
export function getRefillStatuses() { try { return JSON.parse(localStorage.getItem(REFILL_KEY) || '{}'); } catch { return {}; } }
export function saveRefillStatuses(statuses) { try { localStorage.setItem(REFILL_KEY, JSON.stringify(statuses)); } catch { /* mock fallback */ } }
