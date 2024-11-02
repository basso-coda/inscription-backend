const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;
// const Role = require('./Role_model');
// const ProfilRole = require('./Profil_role_model');

const Profil = sequelize.define('profil', {
    ID_PROFIL: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true,
    },

    DESCRIPTION: DataTypes.STRING,
    IS_DELETED: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0
    }
}, {
    tableName: 'profil',
    timestamps: false,
})

// Profil.belongsToMany(Role, { through: ProfilRole, foreignKey: 'PROFIL_ID', as: 'ROLES' })
// Role.belongsToMany(Profil, { through: ProfilRole, foreignKey: 'ROLE_ID', as: 'ROLES' })

module.exports = Profil;