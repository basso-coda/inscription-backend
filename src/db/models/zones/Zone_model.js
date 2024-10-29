const { DataTypes } = require('sequelize');
const Commune = require('../communes/Commune_model');
const sequelize = require('../index').sequelize;
/**
 * model pour  les zones
 * @author elam <elam.igirubuntu@mediabox.bi>
 * @date 08/10/2024
 */
const Zone = sequelize.define('zones', {
    ZONE_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        defaultValue: null
    },
    ZONE_NAME: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
    },
    COMMUNE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    LATITUDE: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    LONGITUDE: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    ZONE_NAME: DataTypes.STRING(100),
    COMMUNE_ID: DataTypes.INTEGER,
    LATITUDE: DataTypes.FLOAT,
    LONGITUDE: DataTypes.FLOAT,
}, {
    timestamps: false,
    initialAutoIncrement: 1,
    tableName:'zones'
})

Zone.belongsTo(Commune, {as: 'communes', foreignKey: "COMMUNE_ID"})

module.exports = Zone;