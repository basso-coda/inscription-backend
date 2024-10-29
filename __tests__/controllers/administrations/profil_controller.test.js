const request = require('supertest');
const app = require('../../../src/app');
const Utilisateur = require('../../../src/db/models/administrations/Utilisateur_model');
const sequelize = require('../../../src/db/models').sequelize;
const bcrypt = require('bcrypt')
const fs = require('fs/promises');
const Profil = require('../../../src/db/models/administrations/Profil_model');
const UtilisateurHistorique = require('../../../src/db/models/administrations/Utilisateur_historique_model');
const Sexe = require('../../../src/db/models/sexe/Sexe_model');
const EtatCivil = require('../../../src/db/models/etat_civil/Etat_civil_model');
const Nationalite = require('../../../src/db/models/nationalite/Nationalite');
const Banque = require('../../../src/db/models/administrations/Banque_model');

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
            DESCRIPTION: 'Admin'
        }
    }, { include: { model: Profil, as: 'profil' } })

    const res = await request(app).post('/api/login').send({ EMAIL: 'gahebeye@bitwi-cncm.org', MOT_DE_PASSE: '12345678' });
    token = res.body.data.token
})

describe('Profils', () => {
    it.only("ça recupère tous les profils", async () => {
        const res = await request(app).get('/api/profils').set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.data.count).toEqual(1)
        expect(res.body.data.rows[0]).toEqual(
            expect.objectContaining({ "DESCRIPTION": "Admin" })
        )
    })

    it.only("ça recupère un seul profil", async () => {
        const res = await request(app).get('/api/profils/1').set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.data).toEqual(expect.objectContaining({ "DESCRIPTION": "Admin" }))
    })

    it.only("ça retourne 404 pour un utilisateur non trouvé", async () => {
        const res = await request(app).get('/api/profils/999').set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
    })

    it.only("ça crée un nouveau profil", async () => {

        const body = {
            DESCRIPTION: "Secrétaire",
        }

        const res = await request(app).post('/api/profils')
            .set('Authorization', `Bearer ${token}`)
            .send(body);

        expect(res.status).toEqual(201);
        expect(res.body.data).toEqual(expect.objectContaining({ "DESCRIPTION": "Secrétaire" }))
    })

    it.only("ça modifie un profil", async () => {
        const body = {
            DESCRIPTION: "Secrétaire",
        }

        const res = await request(app).put('/api/profils/1')
            .set('Authorization', `Bearer ${token}`)
            .send(body);

        expect(res.status).toEqual(200);
        expect(res.body.data).toEqual(expect.objectContaining({ "DESCRIPTION": "Secrétaire" }))

    })

    it.only("ça supprime un profil", async () => {

        const res = await request(app).post('/api/profils/delete')
            .set('Authorization', `Bearer ${token}`)
            .send({ 'ID_PROFILS': JSON.stringify([1]) })

        expect(res.status).toEqual(200);

        const deletedProfil = await Profil.findOne({ where: { ID_PROFIL: 1, IS_DELETED: 0 } });
        expect(deletedProfil).toBeNull();

    })
})