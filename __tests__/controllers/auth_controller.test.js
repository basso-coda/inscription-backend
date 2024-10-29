const request = require('supertest');
const app = require('../../src/app');
const Profil = require('../../src/db/models/administrations/Profil_model');
const Utilisateur = require('../../src/db/models/administrations/Utilisateur_model');
const { sequelize } = require('../../src/db/models');
const bcrypt = require('bcrypt')

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
})

afterAll(async () => {
    await sequelize.close()
})

describe('Authentification', () => {

    it.only('ça doit pas connecter un utilisateur sans identifiants', async () => {
        const res = await request(app).post('/api/login');

        expect(res.statusCode).toEqual(422);
        expect(res.body.message).toBe('Erreur de validation des données')
        expect(res.body.errors).toBeDefined();
    })

    it.only('ça doit pas connecter un utilisateur avec identifiants incorrects', async () => {
        const body = {
            EMAIL: 'hafidati@example.org',
            MOT_DE_PASSE: 'wrong-password-12345'
        }
        const res = await request(app).post('/api/login').send(body);

        expect(res.statusCode).toEqual(422);
        expect(res.body.errors).toEqual(expect.objectContaining({ EMAIL: 'Identifiants incorrects' }))
    })

    it.only('ça doit connecter un utilisateur existant', async () => {

        const res = await request(app).post('/api/login').send({ EMAIL: 'gahebeye@bitwi-cncm.org', MOT_DE_PASSE: '12345678' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.token).toBeDefined();

    })
})