
const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;
/**
 * model pour  les etat civils
 * @author elam <elam.igirubuntu@mediabox.bi>
 * @date 03/10/2024
 */
const EtatCivil = sequelize.define('etat_civil', {
    ID_ETAT_CIVIL: {
        type: DataTypes.TINYINT,
        primaryKey: true,
        autoIncrement: true,
        defaultValue: null
    },
    DESCRIPTION: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
    },
}, {
    timestamps: false,
    initialAutoIncrement: 1,
    tableName:'etat_civil'
})

module.exports = EtatCivil;