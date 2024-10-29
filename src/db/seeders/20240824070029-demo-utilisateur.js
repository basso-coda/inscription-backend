'use strict';

const bcrypt = require('bcrypt')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    const salt = await bcrypt.genSalt(10)
    const PASSWORD = await bcrypt.hash('12345678', salt)

    await queryInterface.bulkInsert('utilisateurs', [{
      USERNAME: "agahebeye",
      EMAIL: "agahebeye@example.org",
      PASSWORD,
      NOM: "Gahebeye",
      PRENOM: "Aboubakar",
      TELEPHONE1: "68123456",
      ADRESSE: "Buterere I",
    }])
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete('utilisateurs', null, {});

  }
};
