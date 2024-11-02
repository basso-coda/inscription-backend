const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;

const Utilisateur = require('./Utilisateur');
const Profil = require('./Profil');

const UtilisateurHistorique = sequelize.define('utilisateur_historique', {
    ID_UTILISATEUR_HISTORIQUE: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    UTILISATEUR_ID: DataTypes.INTEGER,
    USER_ID: DataTypes.INTEGER, // celui qui désactive
    PROFIL_ID: DataTypes.SMALLINT,

    STATUT_ID: DataTypes.TINYINT(1),

    COMMENTAIRE: DataTypes.STRING,

    DATE_INSERTION: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
    }
}, {
    tableName: 'utilisateur_historique',
    timestamps: false,
})

UtilisateurHistorique.belongsTo(Profil, { foreignKey: 'PROFIL_ID', as: 'profil' })
UtilisateurHistorique.belongsTo(Utilisateur, { foreignKey: 'UTILISATEUR_ID', as: 'utilisateur' })
UtilisateurHistorique.belongsTo(Utilisateur, { foreignKey: 'USER_ID', as: 'titulaire' })

module.exports = UtilisateurHistorique;
