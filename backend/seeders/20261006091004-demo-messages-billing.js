'use strict';

const IDS = require('../src/constants/seedIds');

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('message_threads', [
      {
        id: '12121212-1212-4121-8121-121212121211',
        patient_id: IDS.patient,
        provider_id: IDS.provider1,
        unread_by_patient: true,
        unread_by_provider: false,
        created_at: now,
        updated_at: now,
      },
      {
        id: '12121212-1212-4121-8121-121212121212',
        patient_id: IDS.patient,
        provider_id: IDS.provider2,
        unread_by_patient: false,
        unread_by_provider: false,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('messages', [
      {
        id: '13131313-1313-4131-8131-131313131311',
        thread_id: '12121212-1212-4121-8121-121212121211',
        sender_id: IDS.provider1,
        sender_role: 'provider',
        body: 'Your lab results are ready. Let me know if you have any questions.',
        attachment_name: null,
        attachment_type: null,
        created_at: new Date(now.getTime() - 20 * 60 * 1000),
        updated_at: now,
      },
      {
        id: '13131313-1313-4131-8131-131313131312',
        thread_id: '12121212-1212-4121-8121-121212121211',
        sender_id: IDS.patient,
        sender_role: 'patient',
        body: 'Thank you, I will take a look.',
        attachment_name: null,
        attachment_type: null,
        created_at: new Date(now.getTime() - 10 * 60 * 1000),
        updated_at: now,
      },
      {
        id: '13131313-1313-4131-8131-131313131313',
        thread_id: '12121212-1212-4121-8121-121212121212',
        sender_id: IDS.provider2,
        sender_role: 'provider',
        body: 'A reminder that your follow-up is scheduled for next week.',
        attachment_name: null,
        attachment_type: null,
        created_at: new Date('2026-09-02T14:15:00'),
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('billing_statements', [
      {
        id: '14141414-1414-4141-8141-141414141411',
        patient_id: IDS.patient,
        statement_date: '2026-09-04',
        visit_description: 'Primary care visit · Dr. Elena Rostova',
        amount_owed: 42.5,
        status: 'open',
        created_at: now,
        updated_at: now,
      },
      {
        id: '14141414-1414-4141-8141-141414141412',
        patient_id: IDS.patient,
        statement_date: '2026-08-14',
        visit_description: 'Annual checkup · Dr. Elena Rostova',
        amount_owed: 0,
        status: 'paid',
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('statement_lines', [
      {
        id: '15151515-1515-4151-8151-151515151511',
        statement_id: '14141414-1414-4141-8141-141414141411',
        service: 'Office visit',
        billed: 150,
        insurance: 107.5,
        owed: 42.5,
        created_at: now,
        updated_at: now,
      },
      {
        id: '15151515-1515-4151-8151-151515151512',
        statement_id: '14141414-1414-4141-8141-141414141412',
        service: 'Preventive checkup',
        billed: 180,
        insurance: 180,
        owed: 0,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('proxy_accesses', [
      {
        id: '16161616-1616-4161-8161-161616161611',
        patient_id: IDS.patient,
        proxy_name: 'Michael Connor',
        access_level: 'full',
        status: 'active',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('proxy_accesses', null, {});
    await queryInterface.bulkDelete('statement_lines', null, {});
    await queryInterface.bulkDelete('billing_statements', null, {});
    await queryInterface.bulkDelete('messages', null, {});
    await queryInterface.bulkDelete('message_threads', null, {});
  },
};
