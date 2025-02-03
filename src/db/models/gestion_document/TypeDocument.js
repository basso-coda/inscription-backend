const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;
/**
 * model pour le type de document
 * @author elam
 * @date 11/12/2024
 */
const TypeDocument = sequelize.define('type_document', {
    ID_TYPE_DOCUMENT: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    DESCRIPTION: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
}, {
    timestamps: false,
    initialAutoIncrement: 1,
    tableName:'type_document'
})

module.exports = TypeDocument;