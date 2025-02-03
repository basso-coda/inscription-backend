const { DataTypes } = require('sequelize');
const Faculte = require('./Faculte');
const sequelize = require('../index').sequelize;

const Departement = sequelize.define('departement', {
    ID_DEPARTEMENT : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    FACULTE_ID : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    DESCRIPTION: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },

    FACULTE_ID : DataTypes.INTEGER,
    DESCRIPTION: DataTypes.STRING,
    
}, {
    timestamps: false,
    initialAutoIncrement: 1,
    tableName:'departement'
})

Departement.belongsTo(Faculte, { as: 'faculte', foreignKey: 'FACULTE_ID' })

module.exports = Departement;
