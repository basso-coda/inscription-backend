const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;
/**
 * model pour  le type de paiement
 * @author elam
 * @date 18/12/2024
 */
const TypePaiement = sequelize.define('type_paiement', {
    ID_TYPE_PAIEMENT: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    DESCRIPTION: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    MONTANT: {
        type: DataTypes.FLOAT,
        unique: true,
        allowNull: false,
    },
}, {
    timestamps: false,
    initialAutoIncrement: 1,
    tableName:'type_paiement'
})

module.exports = TypePaiement;