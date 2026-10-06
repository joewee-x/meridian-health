import { getAppointments } from './appointments';
import { getThreads } from './messages';

const SARAH_DASHBOARD = {
  appointment: {
    id: 'apt-001',
    provider: 'Dr. Elena Rostova, MD',
    dateTime: 'Today at 10:30 AM',
    visitType: 'Telehealth',
    startsSoon: true,
  },
  unreadMessages: 2,
  update: '1 new lab result',
  outstandingBalance: 42.5,
};

const EMPTY_DASHBOARD = {
  appointment: null,
  unreadMessages: 0,
  update: null,
  outstandingBalance: 0,
};

// Keeps the new-patient experience predictable while providing a useful seeded demo.
export function getPatientDashboard(patientId) {
  const appointments = getAppointments().filter((appointment) => appointment.status === 'upcoming');
  const unreadMessages = getThreads().filter((thread) => thread.unread).length;
  const nextAppointment = appointments[0];
  const base = patientId === 'user-patient-1' ? SARAH_DASHBOARD : EMPTY_DASHBOARD;

  return {
    ...base,
    appointment: nextAppointment ? {
      id: nextAppointment.id,
      provider: nextAppointment.provider,
      dateTime: `${nextAppointment.date} at ${nextAppointment.time}`,
      visitType: nextAppointment.visitType,
      startsSoon: nextAppointment.startsSoon,
    } : null,
    upcomingAppointmentCount: appointments.length,
    unreadMessages,
  };
}
