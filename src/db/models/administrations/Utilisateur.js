const { DataTypes } = require('sequelize');
const Profil = require('./Profil');
const Sexe = require('../sexe/Sexe_model')
const sequelize = require('../index').sequelize;

const Utilisateur = sequelize.define('utilisateur', {
    ID_UTILISATEUR: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    NOM: DataTypes.STRING,
    PRENOM: DataTypes.STRING,

    USERNAME: {
        type: DataTypes.STRING(80),
        unique: true,
        allowNull: false,
    },

    EMAIL: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },

    IMAGE: {
        type: DataTypes.STRING,
        allowNull: true
    },


    MOT_DE_PASSE: {
        type: DataTypes.STRING,
        allowNull: false
    },

    PROFIL_ID: DataTypes.SMALLINT,
    SEXE_ID: DataTypes.TINYINT,

    IS_ACTIVE: {
        type: DataTypes.TINYINT(1),
        defaultValue: 1
    },

    TELEPHONE: DataTypes.STRING,

    DATE_INSERTION: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
    }
}, {
    tableName: 'utilisateur',
    timestamps: false,
})

Utilisateur.belongsTo(Profil, { foreignKey: 'PROFIL_ID', as: 'profil' })
Profil.hasMany(Utilisateur, { foreignKey: 'PROFIL_ID', as: 'utilisateurs' })
Utilisateur.belongsTo(Sexe, { foreignKey: 'SEXE_ID', as: 'sexe' })

module.exports = Utilisateur;