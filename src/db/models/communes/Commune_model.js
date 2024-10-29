const { DataTypes } = require('sequelize');
const Province = require('../provinces/Province_model');
const sequelize = require('../index').sequelize;
/**
 * model pour  les communes
 * @author elam <elam.igirubuntu@mediabox.bi>
 * @date 08/10/2024
 */
const Commune = sequelize.define('communes', {
    COMMUNE_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        defaultValue: null
    },
    COMMUNE_NAME: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
    },
    PROVINCE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    COMMUNE_LATITUDE: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    COMMUNE_LONGITUDE: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    COMMUNE_NAME: DataTypes.STRING(100),
    PROVINCE_ID: DataTypes.INTEGER,
    COMMUNE_LATITUDE: DataTypes.FLOAT,
    COMMUNE_LONGITUDE: DataTypes.FLOAT,
}, {
    timestamps: false,
    initialAutoIncrement: 1,
    tableName:'communes'
})

Commune.belongsTo(Province, {as: 'provinces', foreignKey: "PROVINCE_ID"})

module.exports = Commune;