const { DataTypes } = require('sequelize');
const TypeDocument = require('./TypeDocument');
const Candidature = require('../gestion_etudiant/Candidature')
const sequelize = require('../index').sequelize;

/**
 * model pour le document
 * @author elam
 * @date 11/12/2024
 */
const Document = sequelize.define('document', {
    ID_DOCUMENT: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    TYPE_DOCUMENT_ID: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
    },
    PATH_DOCUMENT: {
        type: DataTypes.STRING,
        allowNull: false
    },
    CANDIDATURE_ID: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
    },
}, {
    timestamps: false,
    initialAutoIncrement: 1,
    tableName:'document'
})

Document.belongsTo(TypeDocument, { as: 'type_document', foreignKey: "TYPE_DOCUMENT_ID" })
Document.belongsTo(Candidature, { as: 'candidature', foreignKey: "CANDIDATURE_ID" })

module.exports = Document;