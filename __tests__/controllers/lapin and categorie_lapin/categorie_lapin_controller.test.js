const request = require('supertest');
const app = require('../../../src/app');
const CategorieLapin = require('../../../src/db/models/gest_alimentation/categorie_lapins/CategorieLapin');
const sequelize = require('../../../src/db/models').sequelize;
const bcrypt = require('bcrypt');
const Utilisateur = require('../../../src/db/models/administrations/Utilisateur_model');
const Profil = require('../../../src/db/models/administrations/Profil_model');
const { describe } = require('../../../src/db/models/front_partenaire/TypePartenaire');

let token = '';

beforeAll(async () => {
    // Reinitialise la base de données
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

describe('CategorieLapin', () => {
    it.only("ça recupère tous les categorie lapins", async () => {
        const res = await request(app).get('/api/categorie_lapins').set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.data.count).toEqual(1)
        expect(res.body.data.rows[0]).toEqual(
            expect.objectContaining({ "DESCRIPTION": "izivyibushe" })
        )
    })
})
