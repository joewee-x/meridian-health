// Seeded user accounts and simulated asynchronous Auth API for Meridian Health

export const INITIAL_USERS = [
  {
    id: 'user-patient-1',
    email: 'patient@meridian.health',
    password: 'password123',
    role: 'patient',
    name: 'Sarah Connor',
    dateOfBirth: '1988-04-12',
    phone: '(555) 342-8901',
    avatarInitials: 'SC',
    primaryDoctorId: 'prov-1',
    portalUrl: '/patient',
  },
  {
    id: 'user-provider-1',
    email: 'provider@meridian.health',
    password: 'password123',
    role: 'provider',
    name: 'Dr. Elena Rostova, MD',
    specialty: 'Primary Care & Internal Medicine',
    npi: '1982736450',
    phone: '(555) 782-9900',
    avatarInitials: 'ER',
    portalUrl: '/provider',
  },
  {
    id: 'user-admin-1',
    email: 'admin@meridian.health',
    password: 'password123',
    role: 'admin',
    name: 'Marcus Vance',
    title: 'Clinical Operations Director',
    phone: '(555) 901-4422',
    avatarInitials: 'MV',
    portalUrl: '/admin',
  },
];

const STORAGE_USERS_KEY = 'meridian_healthcare_users_v1';

// Helper to get all users including newly registered patients
export function getRegisteredUsers() {
  try {
    const local = localStorage.getItem(STORAGE_USERS_KEY);
    if (!local) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(local);
  } catch {
    return INITIAL_USERS;
  }
}

// Helper to save updated users
export function saveRegisteredUsers(users) {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error writing to localStorage:', err);
  }
}

// Simulated network latency
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// 1. Step 1: Validate Credentials
export async function mockLoginApi({ email, password }) {
  await delay(450);
  const users = getRegisteredUsers();
  const normalizedEmail = (email || '').trim().toLowerCase();
  
  const foundUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  
  if (!foundUser) {
    const error = new Error("We couldn't find an account associated with that email.");
    error.code = 'EMAIL_NOT_FOUND';
    throw error;
  }

  if (foundUser.password !== password) {
    const error = new Error('Incorrect password. Please verify your password and try again.');
    error.code = 'INVALID_PASSWORD';
    throw error;
  }

  // Credentials are valid; return pending MFA challenge
  return {
    requiresMfa: true,
    maskedPhone: foundUser.phone 
      ? foundUser.phone.replace(/(\(\d{3}\))\s(\d{3})-(\d{4})/, '$1 •••-$3') 
      : '(555) •••-8901',
    pendingUser: {
      id: foundUser.id,
      email: foundUser.email,
      role: foundUser.role,
      name: foundUser.name,
      avatarInitials: foundUser.avatarInitials,
      portalUrl: foundUser.portalUrl,
    },
  };
}

// 2. Step 2: Verify 6-digit MFA Code
export async function mockVerifyMfaApi({ pendingUserId, code }) {
  await delay(400);
  const users = getRegisteredUsers();
  const user = users.find((u) => u.id === pendingUserId);

  if (!user) {
    const err = new Error('Authentication session expired. Please sign in again.');
    err.code = 'SESSION_EXPIRED';
    throw err;
  }

  // Accepts standard demo code 123456, or any realistic 6-digit code
  const cleanCode = (code || '').trim();
  if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
    const err = new Error('Please enter a valid 6-digit verification code.');
    err.code = 'INVALID_MFA_FORMAT';
    throw err;
  }

  // Mock token generation
  const mockToken = `mock-token-${user.role}-${Date.now()}`;

  return {
    success: true,
    token: mockToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatarInitials: user.avatarInitials,
      portalUrl: user.portalUrl,
      dateOfBirth: user.dateOfBirth,
      specialty: user.specialty,
      title: user.title,
    },
  };
}

// 3. Register New Patient
export async function mockRegisterPatientApi({ name, email, password, dateOfBirth }) {
  await delay(500);
  const users = getRegisteredUsers();
  const normalizedEmail = (email || '').trim().toLowerCase();

  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    const err = new Error('An account with this email address already exists.');
    err.code = 'EMAIL_ALREADY_EXISTS';
    throw err;
  }

  const nameParts = (name || '').trim().split(' ');
  const initials = nameParts.length >= 2 
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : (name || 'PT').slice(0, 2).toUpperCase();

  const newPatient = {
    id: `user-patient-${Date.now()}`,
    email: normalizedEmail,
    password,
    role: 'patient',
    name: name.trim(),
    dateOfBirth,
    phone: '(555) 234-5678',
    avatarInitials: initials,
    portalUrl: '/patient',
  };

  users.push(newPatient);
  saveRegisteredUsers(users);

  return {
    requiresMfa: true,
    maskedPhone: '(555) •••-5678',
    pendingUser: {
      id: newPatient.id,
      email: newPatient.email,
      role: newPatient.role,
      name: newPatient.name,
      avatarInitials: newPatient.avatarInitials,
      portalUrl: newPatient.portalUrl,
    },
  };
}
