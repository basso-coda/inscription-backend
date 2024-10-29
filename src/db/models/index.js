'use strict';

const Sequelize = require('sequelize');
const process = require('process');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/database.js')[env];
const db = {};

/**@type {Sequelize.Sequelize} */
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

if (process.env.NODE_ENV !== 'test') {
  sequelize.authenticate().then(() => {
    console.log('Connection base de données établie avec succès.');
  }).catch((error) => {
    console.error("Impossible d'établir la connection base de données", error);
  });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
