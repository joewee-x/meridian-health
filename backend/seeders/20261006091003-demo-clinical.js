'use strict';

const IDS = require('../src/constants/seedIds');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const today = new Date();
    today.setHours(10, 30, 0, 0);
    const todayEnd = new Date(today.getTime() + 30 * 60 * 1000);

    const future = new Date();
    future.setDate(future.getDate() + 12);
    future.setHours(14, 15, 0, 0);
    const futureEnd = new Date(future.getTime() + 30 * 60 * 1000);

    const past1 = new Date('2026-08-14T09:00:00');
    const past1End = new Date(past1.getTime() + 30 * 60 * 1000);
    const past2 = new Date('2026-07-29T15:30:00');
    const past2End = new Date(past2.getTime() + 45 * 60 * 1000);

    await queryInterface.bulkInsert('appointments', [
      {
        id: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
        patient_id: IDS.patient,
        provider_id: IDS.provider1,
        start_at: today,
        end_at: todayEnd,
        status: 'scheduled',
        visit_type: 'telehealth',
        reason: 'Follow-up',
        notes: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc2',
        patient_id: IDS.patient,
        provider_id: IDS.provider2,
        start_at: future,
        end_at: futureEnd,
        status: 'scheduled',
        visit_type: 'in_person',
        reason: 'Annual checkup',
        notes: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc3',
        patient_id: IDS.patient,
        provider_id: IDS.provider1,
        start_at: past1,
        end_at: past1End,
        status: 'completed',
        visit_type: 'in_person',
        reason: 'Annual checkup',
        notes: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc4',
        patient_id: IDS.patient,
        provider_id: IDS.provider4,
        start_at: past2,
        end_at: past2End,
        status: 'completed',
        visit_type: 'telehealth',
        reason: 'Follow-up',
        notes: null,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('visit_summaries', [
      {
        id: 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1',
        patient_id: IDS.patient,
        provider_id: IDS.provider1,
        appointment_id: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc3',
        visit_date: '2026-08-14',
        reason: 'Annual checkup',
        summary:
          'We reviewed your overall health, blood pressure, and preventive care. Everything discussed is on track.',
        follow_up: 'Continue your current routine and schedule your next checkup in one year.',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'dddddddd-dddd-4ddd-8ddd-ddddddddddd2',
        patient_id: IDS.patient,
        provider_id: IDS.provider4,
        appointment_id: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc4',
        visit_date: '2026-07-29',
        reason: 'Follow-up',
        summary:
          'You discussed sleep and stress patterns and practiced a breathing exercise together.',
        follow_up: 'Try the breathing exercise once daily and follow up in four weeks.',
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('lab_results', [
      {
        id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1',
        patient_id: IDS.patient,
        ordered_by_id: IDS.provider1,
        name: 'Cholesterol',
        result_date: '2026-09-04',
        value: '182 mg/dL',
        status: 'normal',
        explanation: 'Your total cholesterol is in the healthy range for most adults.',
        range_text: 'Healthy range: under 200 mg/dL',
        education_url: null,
        is_new: false,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2',
        patient_id: IDS.patient,
        ordered_by_id: IDS.provider1,
        name: 'Vitamin D',
        result_date: '2026-09-04',
        value: '24 ng/mL',
        status: 'attention',
        explanation:
          'This is a little below the usual target. Your care team may discuss nutrition or a supplement.',
        range_text: 'Typical target: 30–100 ng/mL',
        education_url: 'https://www.nhs.uk/conditions/vitamins-and-minerals/vitamin-d/',
        is_new: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('medications', [
      {
        id: 'ffffffff-ffff-4fff-8fff-fffffffffff1',
        patient_id: IDS.patient,
        prescribed_by_id: IDS.provider1,
        name: 'Lisinopril',
        dosage: '10 mg once daily',
        refill_status: 'none',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'ffffffff-ffff-4fff-8fff-fffffffffff2',
        patient_id: IDS.patient,
        prescribed_by_id: IDS.provider1,
        name: 'Vitamin D3',
        dosage: '1,000 IU once daily',
        refill_status: 'none',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('immunizations', [
      {
        id: '99999999-9999-4999-8999-999999999991',
        patient_id: IDS.patient,
        name: 'Influenza (seasonal)',
        administered_on: '2025-10-12',
        created_at: now,
        updated_at: now,
      },
      {
        id: '99999999-9999-4999-8999-999999999992',
        patient_id: IDS.patient,
        name: 'COVID-19 booster',
        administered_on: '2025-09-06',
        created_at: now,
        updated_at: now,
      },
      {
        id: '99999999-9999-4999-8999-999999999993',
        patient_id: IDS.patient,
        name: 'Tdap',
        administered_on: '2022-04-18',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('immunizations', null, {});
    await queryInterface.bulkDelete('medications', null, {});
    await queryInterface.bulkDelete('lab_results', null, {});
    await queryInterface.bulkDelete('visit_summaries', null, {});
    await queryInterface.bulkDelete('appointments', null, {});
  },
};
