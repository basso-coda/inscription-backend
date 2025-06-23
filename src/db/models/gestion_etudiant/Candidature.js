const { DataTypes } = require('sequelize');
const EtatCivil = require('../etat_civil/Etat_civil_model');
const Sexe = require('../sexe/Sexe_model');
const Province = require('../provinces/Province_model');
const Commune = require('../communes/Commune_model');
// const Zone = require('../zones/Zone_model');
// const Colline = require('../collines/Colline_model');
const Utilisateur = require('../administrations/Utilisateur')
const Classe = require('../gestion_facultes/Classe')
const Nationalite = require('../nationalite/Nationalite');
const Document = require('../gestion_document/Document');
const PersonneContact = require('./PersonneContact');
const MotifRejet = require('../gestion_motif/MotifRejet');
const sequelize = require('../index').sequelize;

const Candidature = sequelize.define('candidature', {
    ID_CANDIDATURE: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    CANDIDAT_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    ANNEE_ACADEMIQUE: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    CLASSE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    NOM: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

    PRENOM: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },

    DATE_NAISSANCE: {
        type: DataTypes.DATE,
        allowNull: false,
    },

    NATIONALITE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    NUM_CARTE_IDENTITE: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    COMMUNE_DELIVRANCE: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    DATE_DELIVRANCE: {
        type: DataTypes.DATE,
        allowNull: false
    },

    SEXE_ID: {
        type: DataTypes.TINYINT,
        allowNull: false
    },

    ETAT_CIVIL_ID: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    EMAIL_PRIVE:{
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    NUMERO_TELEPHONE_PRIVE: {
        type: DataTypes.STRING,
        allowNull: false
    },
    ADRESSE_RESIDENCE: {
        type: DataTypes.STRING,
        allowNull: false
    },
    NOM_DERNIERE_ECOLE_FREQUENTEE: {
        type: DataTypes.STRING,
        allowNull: false
    },
    NOTE_DERNIERE_ECOLE_SECONDAIRE_FREQUENTEE: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    NOTE_EXAMEN_D_ETAT: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    STATUT_CANDIDATURE: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    SECRETAIRE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    DATE_INSERTION: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
    },
    TERMS_ACCEPTED: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },


    CANDIDAT_ID: DataTypes.INTEGER,
    ANNEE_ACADEMIQUE: DataTypes.STRING,
    CLASSE_ID: DataTypes.INTEGER,
    NOM: DataTypes.STRING,
    PRENOM: DataTypes.STRING,
    DATE_NAISSANCE: DataTypes.DATE,
    NATIONALITE_ID: DataTypes.INTEGER,
    NUM_CARTE_IDENTITE: DataTypes.STRING,
    COMMUNE_DELIVRANCE: DataTypes.STRING,
    DATE_DELIVRANCE: DataTypes.DATE,
    SEXE_ID: DataTypes.TINYINT,
    ETAT_CIVIL_ID: DataTypes.TINYINT,
    EMAIL_PRIVE: DataTypes.STRING,
    NUMERO_TELEPHONE_PRIVE: DataTypes.STRING,
    ADRESSE_RESIDENCE: DataTypes.STRING,
    NOM_DERNIERE_ECOLE_FREQUENTEE: DataTypes.STRING,
    NOTE_DERNIERE_ECOLE_SECONDAIRE_FREQUENTEE: DataTypes.FLOAT,
    NOTE_EXAMEN_D_ETAT: DataTypes.FLOAT,
    STATUT_CANDIDATURE: DataTypes.TINYINT,
    SECRETAIRE_ID: DataTypes.INTEGER,
    TERMS_ACCEPTED: DataTypes.BOOLEAN


}, {
    timestamps: false,
    initialAutoIncrement: 1,
    tableName:'candidature'
})

Candidature.belongsTo(Sexe, {as: 'sexe', foreignKey:"SEXE_ID"})
Candidature.belongsTo(EtatCivil, {as: 'etat_civil', foreignKey:"ETAT_CIVIL_ID"})
Candidature.belongsTo(Utilisateur, {as: 'secretaire', foreignKey:"SECRETAIRE_ID"})
Candidature.belongsTo(Utilisateur, {as: 'candidat', foreignKey: "CANDIDAT_ID"})
Candidature.belongsTo(Classe, { as: 'classe', foreignKey: "CLASSE_ID" })
Candidature.belongsTo(Nationalite, { as: 'nationalite', foreignKey: "NATIONALITE_ID" })

Candidature.hasMany(Document, {
    foreignKey: 'CANDIDATURE_ID',
    as: 'documents'
});
Candidature.hasMany(PersonneContact, {
    foreignKey: 'CANDIDATURE_ID',
    as: 'personnes_contact'
})
Candidature.hasMany(MotifRejet, {
    foreignKey: 'CANDIDATURE_ID',
    as: 'motif_rejets'
})

module.exports = Candidature;