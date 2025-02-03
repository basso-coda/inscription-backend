const { DataTypes } = require('sequelize');
const Faculte = require('./Faculte');
const Exigence = require('./Exigence')
const sequelize = require('../index').sequelize;

const ExigenceFaculte = sequelize.define('exigence_faculte', {
    ID_EXIGENCE_FACULTE  : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    EXIGENCE_ID  : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    FACULTE_ID : {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    EXIGENCE_ID : DataTypes.INTEGER,
    FACULTE_ID: DataTypes.INTEGER,
    
}, {
    timestamps: false,
    initialAutoIncrement: 1,
    tableName:'exigence_faculte'
})

ExigenceFaculte.belongsTo(Faculte, { as: 'faculte', foreignKey: 'FACULTE_ID' })
ExigenceFaculte.belongsTo(Exigence, { as: 'exigence', foreignKey: 'EXIGENCE_ID' })

module.exports = ExigenceFaculte;
