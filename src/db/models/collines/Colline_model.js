const { DataTypes } = require('sequelize');
const Zone = require('../zones/Zone_model');
const sequelize = require('../index').sequelize;
/**
 * model pour  les collines
 * @author elam <elam.igirubuntu@mediabox.bi>
 * @date 09/10/2024
 */
const Colline = sequelize.define('collines', {
    COLLINE_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        defaultValue: null
    },
    COLLINE_NAME: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
    },
    // ZONE_ID: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    // },
    LATITUDE: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    LONGITUDE: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    COLLINE_NAME: DataTypes.STRING(100),
    ZONE_ID: DataTypes.INTEGER,
    LATITUDE: DataTypes.FLOAT,
    LONGITUDE: DataTypes.FLOAT,
}, {
    timestamps: false,
    initialAutoIncrement: 1,
    tableName: 'collines'
})

Colline.belongsTo(Zone, { as: 'zones', foreignKey: "ZONE_ID" })
Zone.hasMany(Colline, { as: 'collines', foreignKey: 'ZONE_ID' })

module.exports = Colline;