const { DataTypes } = require('sequelize');
const Departement = require('./Departement');
const sequelize = require('../index').sequelize;

const Classe = sequelize.define('classe', {
    ID_CLASSE : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    DEPARTEMENT_ID : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    DESCRIPTION: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },

    DEPARTEMENT_ID : DataTypes.INTEGER,
    DESCRIPTION: DataTypes.STRING,
    
}, {
    timestamps: false,
    initialAutoIncrement: 1,
    tableName:'classe'
})

Classe.belongsTo(Departement, { as: 'departement', foreignKey: 'DEPARTEMENT_ID' })

module.exports = Classe;
