const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;
const Candidature = require('./Candidature')
/**
 * model pour  les personnes de contacts
 * @author elam
 * @date 18/12/2024
 */
const PersonneContact = sequelize.define('personne_contact', {
    ID_PERSONNE_CONTACT: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    LIEN_PARENTE: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    NOM: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    PRENOM: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    EMAIL: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    NUMERO_TELEPHONE: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    ADRESSE_RESIDENCE: {
        type: DataTypes.STRING,
        allowNull: false
    },
    CANDIDATURE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, {
    timestamps: false,
    initialAutoIncrement: 1,
    tableName:'personne_contact'
})

PersonneContact.belongsTo(Candidature, { as: 'candidature', foreignKey: 'CANDIDATURE_ID' })

module.exports = PersonneContact;