const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;
const Candidature = require('./Candidature')
/**
 * model pour  l'etudiant
 * @author elam
 * @date 18/12/2024
 */
const Etudiant = sequelize.define('etudiant', {
    ID_ETUDIANT: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    CANDIDATURE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    NUMERO_MATRICULE: {
        type: DataTypes.STRING,
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
    tableName:'etudiant'
})

Etudiant.belongsTo(Candidature, { as: 'candidature', foreignKey: 'CANDIDATURE_ID' })

module.exports = Etudiant;