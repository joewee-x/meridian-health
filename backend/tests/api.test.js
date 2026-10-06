'use strict';

const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, ProviderProfile, PatientProfile } = require('../models');
const { hashPassword } = require('../src/utils/hashPassword');

const DEMO_MFA = process.env.DEMO_MFA_CODE || '123456';

async function createUser({ email, role, firstName, lastName }) {
  const passwordHash = await hashPassword('password123');
  const user = await User.create({
    email,
    passwordHash,
    role,
    firstName,
    lastName,
    phone: '(555) 000-0000',
    isActive: true,
  });

  if (role === 'patient') {
    await PatientProfile.create({
      userId: user.id,
      dateOfBirth: '1990-01-01',
      status: 'active',
      outstandingBalance: 0,
    });
  }

  if (role === 'provider') {
    await ProviderProfile.create({
      userId: user.id,
      specialty: 'Primary Care',
      specialtySlug: 'primary-care',
      credentials: 'MD',
      status: 'active',
      acceptingNew: true,
      telehealth: true,
      inPerson: true,
      experienceYears: 5,
      rating: 4.5,
      reviewsCount: 10,
      languages: ['English'],
      location: 'Test Clinic',
      bio: 'Test provider',
      avatarColor: 'bg-teal-100 text-teal-800 border-teal-200',
    });
  }

  return user;
}

async function loginAs(email) {
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: 'password123' })
    .expect(200);

  const { pendingToken } = loginRes.body.data;
  const mfaRes = await request(app)
    .post('/api/v1/auth/verify-mfa')
    .send({ pendingToken, code: DEMO_MFA })
    .expect(200);

  return mfaRes.body.data.token;
}

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await sequelize.authenticate();
  // Schema is managed by migrations — assume test DB has been migrated.
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth', () => {
  let patient;

  beforeAll(async () => {
    patient = await createUser({
      email: `patient-auth-${Date.now()}@test.health`,
      role: 'patient',
      firstName: 'Test',
      lastName: 'Patient',
    });
  });

  test('login + MFA issues access token and me works', async () => {
    const token = await loginAs(patient.email);
    expect(token).toBeTruthy();

    const me = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(me.body.data.email).toBe(patient.email);
    expect(me.body.data.role).toBe('patient');
    expect(me.body.data.passwordHash).toBeUndefined();
  });

  test('rejects bad credentials without enumeration detail', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@test.health', password: 'wrongpassword' })
      .expect(401);

    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('Role authorization', () => {
  let patientToken;
  let provider;
  let providerToken;

  beforeAll(async () => {
    const patient = await createUser({
      email: `patient-rbac-${Date.now()}@test.health`,
      role: 'patient',
      firstName: 'Rbac',
      lastName: 'Patient',
    });
    provider = await createUser({
      email: `provider-rbac-${Date.now()}@test.health`,
      role: 'provider',
      firstName: 'Rbac',
      lastName: 'Provider',
    });
    patientToken = await loginAs(patient.email);
    providerToken = await loginAs(provider.email);
  });

  test('patient cannot access admin dashboard', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/admin')
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(403);

    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('provider can list their appointments scope', async () => {
    const res = await request(app)
      .get('/api/v1/appointments')
      .set('Authorization', `Bearer ${providerToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('Appointment booking', () => {
  let patientToken;
  let provider;

  beforeAll(async () => {
    const patient = await createUser({
      email: `patient-appt-${Date.now()}@test.health`,
      role: 'patient',
      firstName: 'Appt',
      lastName: 'Patient',
    });
    provider = await createUser({
      email: `provider-appt-${Date.now()}@test.health`,
      role: 'provider',
      firstName: 'Appt',
      lastName: 'Provider',
    });
    patientToken = await loginAs(patient.email);
  });

  test('patient can book an available slot', async () => {
    const startAt = new Date();
    startAt.setDate(startAt.getDate() + 2);
    startAt.setHours(10, 0, 0, 0);
    const endAt = new Date(startAt.getTime() + 30 * 60 * 1000);

    const res = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        providerId: provider.id,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        visitType: 'telehealth',
        reason: 'Follow-up',
      })
      .expect(201);

    expect(res.body.data.providerId).toBe(provider.id);
    expect(res.body.data.rawStatus || res.body.data.status).toBeTruthy();
  });

  test('overlapping booking for same provider is rejected', async () => {
    const startAt = new Date();
    startAt.setDate(startAt.getDate() + 3);
    startAt.setHours(14, 0, 0, 0);
    const endAt = new Date(startAt.getTime() + 30 * 60 * 1000);

    await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        providerId: provider.id,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        visitType: 'in_person',
        reason: 'Annual checkup',
      })
      .expect(201);

    const conflict = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        providerId: provider.id,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        visitType: 'telehealth',
        reason: 'New concern',
      })
      .expect(409);

    expect(conflict.body.error.code).toBe('SCHEDULING_CONFLICT');
  });
});
