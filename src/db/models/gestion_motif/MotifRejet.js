const { DataTypes } = require('sequelize');
const Motif = require('./Motif');
const Candidature = require('../gestion_etudiant/Candidature')
const sequelize = require('../index').sequelize;

const MotifRejet = sequelize.define('motif_rejet', {
    ID_MOTIF_REJET : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    MOTIF_ID : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    CANDIDATURE_ID : {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    MOTIF_ID : DataTypes.INTEGER,
    CANDIDATURE_ID: DataTypes.INTEGER,
    
}, {
    timestamps: false,
    initialAutoIncrement: 1,
    tableName:'motif_rejet'
})

MotifRejet.belongsTo(Motif, { as: 'motif', foreignKey: 'MOTIF_ID' })
MotifRejet.belongsTo(Candidature, { as: 'candidature', foreignKey: 'CANDIDATURE_ID' })

module.exports = MotifRejet;
