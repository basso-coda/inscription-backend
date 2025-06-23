const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;
const TypePaiement = require('./TypePaiement');
const Candidature = require('../gestion_etudiant/Candidature')
/**
 * model pour  le paiement
 * @author elam
 * @date 18/12/2024
 */
const Paiement = sequelize.define('paiement', {
    ID_PAIEMENT: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    DESCRIPTION: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    MONTANT: {
        type: DataTypes.FLOAT,
        unique: true,
        allowNull: false,
    },
    TYPE_PAIEMENT_ID: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
    },
    DATE_PAIEMENT: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
    },
    CANDIDATURE_ID: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
    },
    DATE_INSERTION: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
    },
}, {
    timestamps: false,
    initialAutoIncrement: 1,
    tableName:'paiement'
})

Paiement.belongsTo(TypePaiement, { as: 'type_paiement', foreignKey: 'TYPE_PAIEMENT_ID' })
Paiement.belongsTo(Candidature, { as: 'candidature', foreignKey: "CANDIDATURE_ID" })

module.exports = Paiement;