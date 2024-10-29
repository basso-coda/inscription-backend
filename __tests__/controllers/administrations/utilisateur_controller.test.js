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

describe('Utilisateurs', () => {
    it.only("ça recupère tous les utilisateurs", async () => {
        const res = await request(app).get('/api/utilisateurs').set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.data.count).toEqual(1)
        expect(res.body.data.rows[0].EMAIL).toEqual("gahebeye@bitwi-cncm.org")
    })

    it.only("ça recupère un seul utilisateur", async () => {
        const res = await request(app).get('/api/utilisateurs/1').set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(200);
        expect(res.body.data).toEqual(
            expect.objectContaining({ "USERNAME": "agahebeye", "EMAIL": "gahebeye@bitwi-cncm.org" })
        )
    })

    it.only("ça retourne 404 pour un utilisateur non trouvé", async () => {
        const res = await request(app).get('/api/utilisateurs/999').set('Authorization', `Bearer ${token}`);

        expect(res.status).toEqual(404);
    })

    it.only("ça crée un nouveau utilisateur", async () => {
        const filePath = `${__dirname}/../../files/presence.jpg`;

        try {
            await fs.access(filePath);
        } catch (error) {
            console.log(error)
            throw new Error("Le fichier n'existe pas");
        }

        await Sexe.create({SEXE_DESCRIPTION: 'Homme'})
        await EtatCivil.create({DESCRIPTION: 'Marié'})
        await Nationalite.create({NOM_NATIONALITE: 'Burundi', CODE_NATIONALITE: 'Bi'})
        await Banque.create({NOM_BANQUE: 'BHB'})

        const res = await request(app).post('/api/utilisateurs')
            .set('Authorization', `Bearer ${token}`)
            .field('NOM', 'Franssen')
            .field('PRENOM', 'Ngoie')
            .field('USERNAME', 'franssen')
            .field('EMAIL', 'franssen@bitwi-cncm.org')
            .field('MOT_DE_PASSE', '12345678')
            .field('CONFIRM_MOT_DE_PASSE', '12345678')
            .field('ADRESSE_COMPLET', 'Kajaga')
            .field('NUMERO_TELEPHONE', '12345678')
            .field('LIEU_NAISSANCE', 'Lubumbashi')
            .field('DATE_NAISSANCE', '1999-01-01')
            .field('DUREE_PERIODE', '3ans')
            .field('NUMERO_COMPTE', '1234567')
            .field('DATE_ENTREE', '1999-01-01')
            .field('DATE_SORTIE', '1999-01-01')
            .field('NUMERO_INSS', '123456')
            .field('PROFIL_ID', '1')
            .field('SEXE_ID', '1')
            .field('ETAT_CIVIL_ID', '1')
            .field('NATIONALITE_ID', '1')
            .field('ID_BANQUE', '1')
            .attach('IMAGE', filePath)
            .attach('PATH_PHOTO_PASSEPORT', filePath)
            .attach('PATH_CV', filePath)
            .attach('PATH_DIPLOME', filePath)
            .attach('PATH_EXTRAIT_CASIER_JUDICIARE', filePath)
            .attach('PATH_LETTRE_DEMANDE', filePath)
            .attach('PATH_SIGNATURE', filePath)

        expect(res.status).toEqual(201);
        expect(res.body.data).toEqual(
            expect.objectContaining({ "USERNAME": "franssen", "EMAIL": "franssen@bitwi-cncm.org" })
        )
    })

    it.only("ça modifie un utilisateur", async () => {
        const body = {
            USERNAME: "ramses",
            EMAIL: "ramses@example.org",
        }

        const res = await request(app).put('/api/utilisateurs/1')
            .set('Authorization', `Bearer ${token}`)
            .send(body);

        expect(res.status).toEqual(200);
        expect(res.body.data).toEqual(
            expect.objectContaining({ "USERNAME": "ramses", "EMAIL": "ramses@example.org" })
        )
    })

    it.only("ça supprime un utilisateur", async () => {

        const res = await request(app).post('/api/utilisateurs/delete')
            .set('Authorization', `Bearer ${token}`)
            .send({ 'UTILISATEUR_IDS': JSON.stringify([1]), 'COMMENTAIRE': 'suppression', 'USER_ID': 1 })

        expect(res.status).toEqual(200);

        const deletedUtilisateur = await Utilisateur.findOne({ where: { ID_UTILISATEUR: 1, IS_ACTIVE: 1 } });
        expect(deletedUtilisateur).toBeNull();

        const newHistorique = await UtilisateurHistorique.findOne({ where: { UTILISATEUR_ID: 1, USER_ID: 1 } })
        expect(newHistorique).not.toBeNull();

    })
})