
const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;
/**
 * model pour  les sexes
 * @author elam <elam.igirubuntu@mediabox.bi>
 * @date 03/10/2024
 */
const Sexe = sequelize.define('sexe', {
    SEXE_ID: {
        type: DataTypes.TINYINT,
        primaryKey: true,
        autoIncrement: true,
        defaultValue: null
    },
    SEXE_DESCRIPTION: {
        type: DataTypes.STRING(30),
        unique: true,
        allowNull: false,
    },
}, {
    timestamps: false,
    initialAutoIncrement: 1,
    tableName:'sexe'
})

module.exports = Sexe;