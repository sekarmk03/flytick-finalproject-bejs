'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   await queryInterface.bulkInsert('Transactions', [
    {
      transaction_time: new Date(),
      invoice_number: 'DUMMY-001-01',
      user_id: 1,
      paid_time: new Date(),
      paid_status: true,
      adult: 2,
      child: 1,
      round_trip: true,
      total_cost: 11200000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      transaction_time: new Date(),
      invoice_number: 'DUMMY-001-02',
      user_id: 3,
      paid_time: new Date(),
      paid_status: true,
      adult: 2,
      child: 1,
      round_trip: true,
      total_cost: 15400000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      transaction_time: new Date(),
      invoice_number: 'DUMMY-002-01',
      user_id: 2,
      paid_time: new Date(),
      paid_status: true,
      adult: 2,
      child: 0,
      round_trip: false,
      total_cost: 12000000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // Transaction Charles start from here
    {
      transaction_time: new Date(),
      invoice_number: 'DUMMY-003-01',
      user_id: 2,
      paid_time: new Date(),
      paid_status: true,
      adult: 2,
      child: 0,
      round_trip: false,
      total_cost: 12000000,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    ,
    {
      transaction_time: new Date(),
      invoice_number: 'DUMMY-004-01',
      user_id: 2,
      paid_time: new Date(),
      paid_status: true,
      adult: 1,
      child: 0,
      round_trip: false,
      total_cost: 12000000,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    ,
    {
      transaction_time: new Date(),
      invoice_number: 'DUMMY-005-01',
      user_id: 2,
      paid_time: new Date(),
      paid_status: true,
      adult: 2,
      child: 0,
      round_trip: true,
      total_cost: 1200000,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    ,
    {
      transaction_time: new Date(),
      invoice_number: 'DUMMY-005-02',
      user_id: 2,
      paid_time: new Date(),
      paid_status: true,
      adult: 2,
      child: 0,
      round_trip: true,
      total_cost: 1200000,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    ,
    {
      transaction_time: new Date(),
      invoice_number: 'DUMMY-006-01',
      user_id: 3,
      paid_time: new Date(),
      paid_status: true,
      adult: 2,
      child: 0,
      round_trip: false,
      total_cost: 12000000,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    ,
    {
      transaction_time: new Date(),
      invoice_number: 'DUMMY-007-01',
      user_id: 3,
      paid_time: new Date(),
      paid_status: true,
      adult: 1,
      child: 0,
      round_trip: false,
      total_cost: 12000000,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    ,
    {
      transaction_time: new Date(),
      invoice_number: 'DUMMY-008-01',
      user_id: 3,
      paid_time: new Date(),
      paid_status: true,
      adult: 1,
      child: 0,
      round_trip: false,
      total_cost: 12000000,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    ,
    {
      transaction_time: new Date(),
      invoice_number: 'DUMMY-008-02',
      user_id: 3,
      paid_time: new Date(),
      paid_status: true,
      adult: 1,
      child: 0,
      round_trip: false,
      total_cost: 12000000,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
   ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Transactions', null, {});
  }
};