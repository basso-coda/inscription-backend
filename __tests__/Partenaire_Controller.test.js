const request = require('supertest');
const app = require('../src/app');

const Partenaire = require('../src/db/models/front_partenaire/Partenaire_model');

const sequelize = require('../src/db/models').sequelize;
const bcrypt = require('bcrypt')

let token = '';

beforeAll(async () => {
    await sequelize.sync({ force: true })

    const salt = await bcrypt.genSalt()
        const PASSWORD = await bcrypt.hash('12345678', salt)

    const body = {
        NOM_PARTENAIRE: "Amani",
        PRENOM_PARTENAIRE: "mamba",
        SEXE_ID: "1",
        ETAT_CIVIL_ID: "2",
        EMAIL_PARTENAIRE: "amani@gmail.com",
        TELEPHONE: "12345678",
        ADRESSE_COMPLET: "",
        DATE_NAISSANCE: "",
        TYPE_PARTENAIRE_ID: "",
        MOT_DE_PASSE: "",
        LATITUDE: "",
        LONGITUDE: "",
        ETAT_CIVIL_ID: ""
    }

    await Partenaire.create(body);

    // const res = await request(app).post('/api/login').send({ EMAIL: body.EMAIL, PASSWORD: '12345678' });
    // token = res.body.data.token
})

describe('Partenaires', () => {
    it.only("ça recupère tous les Partenaires", async () => {
        const res = await request(app).get('/api/Partenaires').set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.data.count).toEqual(1)
        expect(res.body.data.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ "NOM_PARTENAIRE": "amani", "PRENOM_PARTENAIRE": "mamba" })
            ])
        )
    })

    it.only("ça recupère un seul Partenaire", async () => {
        const res = await request(app).get('/api/Partenaires/1').set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.data).toEqual(
            expect.objectContaining({ "NOM_PARTENAIRE": "agahebeye", "PRENOM_PARTENAIRE": "agahebeye@example.org" })
        )
    })

    it.only("ça retourne 404 pour un Partenaire non trouvé", async () => {
        const res = await request(app).get('/api/Partenaires/999').set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
    })

    it.only("ça crée un nouveau Partenaire", async () => {
        const body = {
            NOM_PARTENAIRE: "Amani",
        PRENOM_PARTENAIRE: "mamba",
        SEXE_ID: "1",
        ETAT_CIVIL_ID: "2",
        EMAIL_PARTENAIRE: "amani@gmail.com",
        TELEPHONE: "12345678",
        ADRESSE_COMPLET: "",
        DATE_NAISSANCE: "",
        TYPE_PARTENAIRE_ID: "",
        MOT_DE_PASSE: "",
        LATITUDE: "",
        LONGITUDE: "",
        ETAT_CIVIL_ID: ""
        }

        const res = await request(app).post('/api/Partenaires')
            .set('Authorization', `Bearer ${token}`)
            .send(body);

        expect(res.status).toEqual(201);
        expect(res.body.data).toEqual(
            expect.objectContaining({ "NOM_PARTENAIRE": "Bertine", "EMAIL_PARTENAIRE": "franssen@example.org" })
        )
    })

    it.only("ça modifie un Partenaire", async () => {
        const body = {
            NOM_PARTENAIRE: "ramses",
            EMAIL_PARTENAIRE: "ramses@example.org",
        }

        const res = await request(app).put('/api/Partenaires/1')
            .set('Authorization', `Bearer ${token}`)
            .send(body);

        expect(res.status).toEqual(200);
        // expect(res.body.data).toEqual(
        //     expect.objectContaining({ "USERNAME": "ramses", "EMAIL": "ramses@example.org" })
        // )
    })

    it.only("ça supprime un Partenaire", async () => {

        const res = await request(app).post('/api/Partenaires/delete')
            .set('Authorization', `Bearer ${token}`)
            .send({'USER_IDS': JSON.stringify([1])})

        expect(res.status).toEqual(200);

        const deletedPartenaire = await Partenaire.findByPk(1);
        expect(deletedPartenaire).toBeNull();
    })
})