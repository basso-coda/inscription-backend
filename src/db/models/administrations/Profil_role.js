const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;
const Profil = require('./Profil');
const Role = require('./Role');

const ProfilRole = sequelize.define('profil_role', {
    ID_PROFIL_ROLE: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    PROFIL_ID: {
        type: DataTypes.SMALLINT,
        references: {
            model: Profil,
            key: 'PROFIL_ID',
        },
    },

    ROLE_ID: {
        type: DataTypes.SMALLINT,
        references: {
            model: Role,
            key: 'ROLE_ID',
        },
    },
}, {
    tableName: 'profil_role',
    timestamps: false,
});

module.exports = ProfilRole;