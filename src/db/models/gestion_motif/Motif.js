const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;
/**
 * model pour  les motifs
 * @author elam
 * @date 11/12/2024
 */
const Motif = sequelize.define('motif', {
    ID_MOTIF: {
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
    tableName:'motif'
})

module.exports = Motif;