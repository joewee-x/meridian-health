'use strict';

function initialsFromName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return (name || 'MH').slice(0, 2).toUpperCase();
}

function portalUrlForRole(role) {
  if (role === 'provider') return '/provider';
  if (role === 'admin') return '/admin';
  return '/patient';
}

function maskPhone(phone) {
  if (!phone) return '(555) •••-0000';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 4) {
    return `(${digits.slice(0, 3) || '555'}) •••-${digits.slice(-4)}`;
  }
  return phone.replace(/\d(?=\d{4})/g, '•');
}

function formatAppointmentDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatAppointmentTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function startsSoon(startAt) {
  const ms = new Date(startAt).getTime() - Date.now();
  return ms >= 0 && ms <= 2 * 60 * 60 * 1000;
}

function serializeUser(user) {
  const plain = user.toJSON ? user.toJSON() : user;
  const profile = plain.PatientProfile || plain.ProviderProfile || null;
  const name =
    plain.firstName && plain.lastName
      ? `${plain.firstName} ${plain.lastName}`.trim()
      : plain.firstName || plain.email;

  return {
    id: plain.id,
    email: plain.email,
    role: plain.role,
    firstName: plain.firstName,
    lastName: plain.lastName,
    name,
    phone: plain.phone,
    avatarInitials: initialsFromName(name),
    portalUrl: portalUrlForRole(plain.role),
    dateOfBirth: profile?.dateOfBirth || null,
    specialty: profile?.specialty || null,
    title: plain.role === 'admin' ? profile?.title || plain.title || null : null,
    profile: profile
      ? {
          ...profile,
        }
      : null,
  };
}

function serializeAppointment(appointment) {
  const plain = appointment.toJSON ? appointment.toJSON() : appointment;
  const providerUser = plain.Provider || plain.provider;
  const providerProfile = providerUser?.ProviderProfile;
  const providerName = providerUser
    ? `Dr. ${providerUser.firstName} ${providerUser.lastName}${providerProfile?.credentials ? `, ${providerProfile.credentials}` : ''}`.replace(/,\s*$/, '')
    : plain.providerNameSnapshot || 'Provider';

  const status = ['cancelled', 'completed', 'no_show'].includes(plain.status)
    ? plain.status === 'completed'
      ? 'past'
      : plain.status
    : new Date(plain.endAt) < new Date()
      ? 'past'
      : 'upcoming';

  const patientUser = plain.Patient || plain.patient;
  const patientName = patientUser
    ? `${patientUser.firstName} ${patientUser.lastName}`.trim()
    : plain.patientNameSnapshot || 'Patient';

  return {
    id: plain.id,
    providerId: plain.providerId,
    patientId: plain.patientId,
    patient: patientUser
      ? {
          id: patientUser.id,
          name: patientName,
          email: patientUser.email,
          phone: patientUser.phone,
        }
      : { id: plain.patientId, name: patientName },
    provider: providerName,
    specialty: providerProfile?.specialty || plain.specialtySnapshot || '',
    date: formatAppointmentDate(plain.startAt),
    time: formatAppointmentTime(plain.startAt),
    startAt: plain.startAt,
    endAt: plain.endAt,
    visitType: plain.visitType === 'telehealth' ? 'Telehealth' : 'In person',
    reason: plain.reason,
    notes: plain.notes,
    startsSoon: status === 'upcoming' && startsSoon(plain.startAt),
    status: status === 'past' || status === 'upcoming' ? status : plain.status,
    rawStatus: plain.status,
  };
}

module.exports = {
  initialsFromName,
  portalUrlForRole,
  maskPhone,
  formatAppointmentDate,
  formatAppointmentTime,
  startsSoon,
  serializeUser,
  serializeAppointment,
};
