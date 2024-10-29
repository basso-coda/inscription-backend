const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;
/**
 * model pour  les nationalites
 * @author elam <elam.igirubuntu@mediabox.bi>
 * @date 08/10/2024
 */
const Nationalite = sequelize.define('nationalite', {
    NATIONALITE_ID: {
        type: DataTypes.SMALLINT(6),
        primaryKey: true,
        autoIncrement: true,
        defaultValue: null
    },
    NOM_NATIONALITE: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    CODE_NATIONALITE: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: false,
    initialAutoIncrement: 1,
    tableName:'nationalite'
})

module.exports = Nationalite;