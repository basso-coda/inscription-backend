const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;
/**
 * model pour  les exigences
 * @author elam
 * @date 11/12/2024
 */
const Exigence = sequelize.define('exigences', {
    ID_EXIGENCE: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    DESCRIPTION: {
        type: DataTypes.TEXT,
        unique: true,
        allowNull: false,
    },
}, {
    timestamps: false,
    initialAutoIncrement: 1,
    tableName:'exigences'
})

module.exports = Exigence;