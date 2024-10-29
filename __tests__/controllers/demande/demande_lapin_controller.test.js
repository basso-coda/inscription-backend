const request = require('supertest');
const app = require('../../../src/app');
const bcrypt = require('bcrypt');
const Utilisateur = require('../../../src/db/models/administrations/Utilisateur_model');
const Profil = require('../../../src/db/models/administrations/Profil_model');
const { sequelize } = require('../../../src/db/models');
const Partenaire = require('../../../src/db/models/partenaires/Partenaire_model');

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

    await Partenaire.create({})

    const res = await request(app).post('/api/login').send({ EMAIL: 'gahebeye@bitwi-cncm.org', MOT_DE_PASSE: '12345678' });
    token = res.body.data.token
})

afterAll(async () => {
    await sequelize.close()
})

describe('Demande lapin', () => {

    it.only('ça doit recupérer tous les demandes de lapin', async () => {
        const res = await request(app).get('/api/demande_lapin').set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('DemandeLapins recupérés avec succès')
        expect(res.body.data.count).toBe(0);
    })

    it.only('ça doit créer une demande de lapin', async () => {
        const res = await request(app)
            .post('/api/demande_lapin')
            .set('Authorization', `Bearer ${token}`)
            .send({
                ID_PARTENAIRE: 1,
                NB_SOUHAITE: 20,
                UTILISATION_PREVUE: 1,
                ID_TYPE_PAIEMENT: 1
            })
            ;
        console.log(res.body)

        // expect(res.statusCode).toEqual(200);
        // expect(res.body.message).toBe('DemandeLapins recupérés avec succès')
        // expect(res.body.data.count).toBe(0);
    })
})