const request = require('supertest');
const app = require('../../../src/app');
const Utilisateur = require('../../../src/db/models/administrations/Utilisateur_model');
const sequelize = require('../../../src/db/models').sequelize;
const bcrypt = require('bcrypt')
const Profil = require('../../../src/db/models/administrations/Profil_model');
const Role = require('../../../src/db/models/administrations/Role_model');

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

describe('Roles', () => {
    it.only("ça recupère tous les roles", async () => {
        const res = await request(app).get('/api/roles').set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.data.count).toEqual(0)
    })

    it.only("ça recupère un seul role", async () => {
        await Role.create({ DESC_ROLE: 'create_user' });

        const res = await request(app).get('/api/roles/1').set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.data).toEqual(expect.objectContaining({ "DESC_ROLE": "create_user" }))
    })

    it.only("ça retourne 404 pour un utilisateur non trouvé", async () => {
        const res = await request(app).get('/api/roles/999').set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
    })

    it.only("ça crée un nouveau role", async () => {

        const body = {
            DESC_ROLE: "create_user",
        }

        const res = await request(app).post('/api/roles')
            .set('Authorization', `Bearer ${token}`)
            .send(body);

        expect(res.status).toEqual(201);
        expect(res.body.data).toEqual(expect.objectContaining({ "DESC_ROLE": "create_user" }))
    })

    it.only("ça modifie un role", async () => {

        await Role.create({ DESC_ROLE: 'create_user' });

        const body = { DESC_ROLE: "view_users",}

        const res = await request(app).put('/api/roles/1')
            .set('Authorization', `Bearer ${token}`)
            .send(body);

        expect(res.status).toEqual(200);
        expect(res.body.data).toEqual(expect.objectContaining({ "DESC_ROLE": "view_users" }))

    })

    it.only("ça supprime un role", async () => {

        const res = await request(app).post('/api/roles/delete')
            .set('Authorization', `Bearer ${token}`)
            .send({ 'ID_ROLES': JSON.stringify([1]) })

        expect(res.status).toEqual(200);

        const deletedProfil = await Role.findOne({ where: { ID_ROLE: 1, IS_DELETED: 0 } });
        expect(deletedProfil).toBeNull();

    })
})