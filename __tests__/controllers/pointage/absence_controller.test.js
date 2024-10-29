const request = require('supertest');
const app = require('../../../src/app');
const Utilisateur = require('../../../src/db/models/administrations/Utilisateur_model');
const sequelize = require('../../../src/db/models').sequelize;
const bcrypt = require('bcrypt')
const fs = require('fs/promises');
const Profil = require('../../../src/db/models/administrations/Profil_model');
const Absence = require('../../../src/db/models/pointage/Absence_model');
const TypeAbsence = require('../../../src/db/models/pointage/TypeAbsence_model ');
const AbsenceHistorique = require('../../../src/db/models/pointage/Absence_historique_model');

let token = '';

beforeAll(async () => {
    await sequelize.sync({ force: true })

    const salt = await bcrypt.genSalt()
    const MOT_DE_PASSE = await bcrypt.hash('12345678', salt)

    await Utilisateur.create({
        NOM: 'gahebeye',
        PRENOM: 'aboubakar',
        USERNAME: 'agahebeye',
        EMAIL: 'gahebeye@bitwi-cncm.org',
        MOT_DE_PASSE,

        profil: {
            DESCRIPTION: 'Admin',
        }
    }, { include: { model: Profil, as: 'profil' } })

    const res = await request(app).post('/api/login').send({ EMAIL: 'gahebeye@bitwi-cncm.org', MOT_DE_PASSE: '12345678' });
    token = res.body.data.token
})

describe('Absences', () => {
    it.only("ça recupère tous les absences", async () => {
        const res = await request(app).get('/api/absences').set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.data.count).toEqual(0)
    })

    it.only("ça recupère une seule absence", async () => {

        await TypeAbsence.create({ DESCR_TYPE: 'Congé' });

        await Absence.create({
            EMPLOYE_ID: 1,
            MOTIF_ABSENCE: 'motif',
            TYPE_ABSENCE: 1,
            DATE_DEBUT: '2000-01-01',
            DATE_FIN: '2000-01-01',
            HEURE_DEBUT: '17:00',
            HEURE_FIN: '17:00',
        })

        const res = await request(app).get('/api/absences/1').set('Authorization', `Bearer ${token}`);
        expect(res.status).toEqual(200);
        expect(res.body.data).toEqual(
            expect.objectContaining({ "MOTIF_ABSENCE": "motif", "EMPLOYE_ID": 1 })
        )
    })

    it.only("ça retourne 404 pour une absence non trouvée", async () => {
        const res = await request(app).get('/api/absences/999').set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
    })

    it.only("ça crée une nouvelle absence", async () => {

        await TypeAbsence.create({ DESCR_TYPE: 'Congé' });

        const filePath = `${__dirname}/../../files/presence.jpg`;

        try {
            await fs.access(filePath);
        } catch (error) {
            throw new Error("Le fichier n'existe pas");
        }

        const res = await request(app).post('/api/absences')
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
        await TypeAbsence.create({ DESCR_TYPE: 'Congé' });

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

        const res = await request(app).put('/api/absences/1')
            .set('Authorization', `Bearer ${token}`)
            .send({
                EMPLOYE_ID: 1,
                MOTIF_ABSENCE: 'motif 2',
                TYPE_ABSENCE: 1,
                DATE_DEBUT: '2000-01-01',
                DATE_FIN: '2000-01-01',
                HEURE_DEBUT: '17:00',
                HEURE_FIN: '17:00',
            });

        expect(res.status).toEqual(200);
        expect(res.body.data).toEqual(
            expect.objectContaining({ "MOTIF_ABSENCE": "motif 2", "TYPE_ABSENCE": 1 })
        )
    })

    it.only("ça supprime une absence", async () => {

        const res = await request(app).post('/api/absences/delete')
            .set('Authorization', `Bearer ${token}`)
            .send({ 'ABSENCE_IDS': JSON.stringify([1]), 'COMMENTAIRE': 'validation', 'USER_ID': 1 })

        expect(res.status).toEqual(200);

    })

    it.only("ça active ou désactive une absence", async () => {
        await TypeAbsence.create({ DESCR_TYPE: 'Congé' });

        await Absence.create({
            EMPLOYE_ID: 1,
            MOTIF_ABSENCE: 'motif',
            TYPE_ABSENCE: 1,
            DATE_DEBUT: '2000-01-01',
            DATE_FIN: '2000-01-01',
            HEURE_DEBUT: '17:00',
            HEURE_FIN: '17:00',
        })

        const res = await request(app).post('/api/absences/activate/1')
            .set('Authorization', `Bearer ${token}`)
            .send({ 'IS_VALIDE': 1, 'COMMENTAIRE': 'validation', 'USER_ID': 1 })

        expect(res.status).toEqual(200);
        expect(res.body.message).toBe('Absence validée avec succès')

        const absenceHistorique = await AbsenceHistorique.findOne({ where: { ID_ABSENCE: 1, STATUT: 1 } })
        expect(absenceHistorique).not.toBeNull() // ça veut ça a été créé
    })
})