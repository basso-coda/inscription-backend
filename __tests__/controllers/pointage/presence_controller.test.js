const request = require('supertest');
const app = require('../../../src/app');
const Utilisateur = require('../../../src/db/models/administrations/Utilisateur_model');
const sequelize = require('../../../src/db/models').sequelize;
const bcrypt = require('bcrypt')
const fs = require('fs/promises');
const Profil = require('../../../src/db/models/administrations/Profil_model');
const Absence = require('../../../src/db/models/pointage/Absence_model');

let token = '';

beforeAll(async () => {
    await sequelize.sync({ force: true })

    // const salt = await bcrypt.genSalt()
    // const MOT_DE_PASSE = await bcrypt.hash('12345678', salt)

    // const body = {
    //     NOM: 'Franssen',
    //     PRENOM: 'Ngoie',
    //     USERNAME: 'franssen',
    //     EMAIL: 'franssen@bitwi-cncm.org',
    //     MOT_DE_PASSE,
    //     ADRESSE_COMPLET: 'Kajaga',
    //     NUMERO_TELEPHONE: '12345678',
    //     LIEU_NAISSANCE: 'Lubumbashi',
    //     DATE_NAISSANCE: '1999-01-01',
    //     DUREE_PERIODE: '3ans',
    //     NUMERO_COMPTE: '1234567',
    //     DATE_ENTREE: '1999-01-01',
    //     DATE_SORTIE: '1999-01-01',
    //     NUMERO_INSS: '123456',
    //     PROFIL_ID: '1',
    //     SEXE_ID: '1',
    //     ETAT_CIVIL_ID: '1',
    //     NATIONALITE_ID: '1',
    //     ID_BANQUE: '1',
    //     IMAGE: '/usr/bin/document.pdf',
    //     PATH_PHOTO_PASSEPORT: '/usr/bin/document.pdf',
    //     PATH_CV: '/usr/bin/document.pdf',
    //     PATH_DIPLOME: '/usr/bin/document.pdf',
    //     PATH_EXTRAIT_CASIER_JUDICIARE: '/usr/bin/document.pdf',
    //     PATH_LETTRE_DEMANDE: '/usr/bin/document.pdf',
    //     PATH_SIGNATURE: '/usr/bin/document.pdf',
    // }

    // await Utilisateur.create(body);
    // await Profil.create({ DESCRIPTION: 'Profil 1' });
    const salt = await bcrypt.genSalt()
    const MOT_DE_PASSE = await bcrypt.hash('12345678', salt)

    const body = {
        USERNAME: "agahebeye",
        EMAIL: "agahebeye@example.org",
        NOM: "Gahebeye",
        PRENOM: "Aboubakar",
        MOT_DE_PASSE
    }
    try {

        await Utilisateur.create(body);
    } catch (error) {
        console.log(error.message);

    }

    const res = await request(app).post('/api/login').send({ EMAIL: 'admin@bitwi-cncm.com', MOT_DE_PASSE: '12345678' });
    console.log(res.body)
    token = res.body?.data?.token
})

describe('Presences', () => {
    it.only("ça recupère tous les presences", async () => {
        const res = await request(app).get('/api/presences').set('Authorization', `Bearer ${token}`);
        expect(res.status).toEqual(200);
        expect(res.body.data.count).toEqual(0)
    })

    it.only("ça recupère une seule absence", async () => {
        await Absence.create({
            EMPLOYE_ID: 1,
            MOTIF_ABSENCE: 'motif',
            TYPE_ABSENCE: 1,
            DATE_DEBUT: '2000-01-01',
            DATE_FIN: '2000-01-01',
            HEURE_DEBUT: '17:00',
            HEURE_FIN: '17:00',
        })

        const res = await request(app).get('/api/presences/1').set('Authorization', `Bearer ${token}`);
        expect(res.status).toEqual(200);
        expect(res.body.data).toEqual(
            expect.objectContaining({ "MOTIF_ABSENCE": "motif", "EMPLOYE_ID": 1 })
        )
    })

    it.only("ça retourne 404 pour une absence non trouvée", async () => {
        const res = await request(app).get('/api/presences/999').set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
    })

    it.only("ça crée une nouvelle absence", async () => {
        const filePath = `${__dirname}/../../files/presence.jpg`;

        try {
            await fs.access(filePath);
        } catch (error) {
            throw new Error("Le fichier n'existe pas");
        }

        const res = await request(app).post('/api/presences')
            .set('Authorization', `Bearer ${token}`)
            .field('EMPLOYE_ID', 1)
            .field('MOTIF_ABSENCE', 'motif')
            .field('TYPE_ABSENCE', 1)
            .field('DATE_DEBUT', '2000-01-01')
            .field('DATE_FIN', '2000-01-01')
            .field('HEURE_DEBUT', '17:00')
            .field('HEURE_FIN', '17:00')
            .attach('PATH_JUSTIFICATION', filePath)

        expect(res.status).toEqual(201);
        expect(res.body.data).toEqual(
            expect.objectContaining({ "MOTIF_ABSENCE": "motif", "EMPLOYE_ID": 1 })
        )
    })

    it.only("ça modifie une absence", async () => {
        const absence = await Absence.create({
            EMPLOYE_ID: 1,
            MOTIF_ABSENCE: 'motif',
            TYPE_ABSENCE: 1,
            DATE_DEBUT: '2000-01-01',
            DATE_FIN: '2000-01-01',
            HEURE_DEBUT: '17:00',
            HEURE_FIN: '17:00',
        })

        expect(absence.dataValues.MOTIF_ABSENCE).toEqual('motif')

        const res = await request(app).put('/api/presences/1')
            .set('Authorization', `Bearer ${token}`)
            .send({
                EMPLOYE_ID: 1,
                MOTIF_ABSENCE: 'motif 2',
                TYPE_ABSENCE: 2,
                DATE_DEBUT: '2000-01-01',
                DATE_FIN: '2000-01-01',
                HEURE_DEBUT: '17:00',
                HEURE_FIN: '17:00',
            });

        expect(res.status).toEqual(200);
        expect(res.body.data).toEqual(
            expect.objectContaining({ "MOTIF_ABSENCE": "motif 2", "TYPE_ABSENCE": 2 })
        )
    })

    it.only("ça supprime une absence", async () => {

        const res = await request(app).post('/api/presences/delete')
            .set('Authorization', `Bearer ${token}`)
            .send({ 'ABSENCE_IDS': JSON.stringify([1]), 'COMMENTAIRE': 'validation', 'USER_ID': 1 })

        expect(res.status).toEqual(200);

        // const deletedAbsence = await Absence.findOne({ where: { ID_ABSENCE: 1, IS_ACTIVE: 1 } });
        // expect(deletedAbsence).toBeNull();

        // const newHistorique = await UtilisateurHistorique.findOne({ where: { UTILISATEUR_ID: 1, USER_ID: 1 } })
        // expect(newHistorique).not.toBeNull();

    })
})