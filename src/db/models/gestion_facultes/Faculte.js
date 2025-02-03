const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;
/**
 * model pour  les facultés
 * @author elam
 * @date 11/12/2024
 */
const Faculte = sequelize.define('faculte', {
    ID_FACULTE: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    DESCRIPTION: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
    },
}, {
    timestamps: false,
    initialAutoIncrement: 1,
    tableName:'faculte'
})

module.exports = Faculte;