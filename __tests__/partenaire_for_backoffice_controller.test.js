const request = require('supertest');
const app = require('../src/app');
const bcrypt = require('bcrypt');
const Partenaires = require("../src/db/models/partenaires/Partenaire_model")

jest.mock("../src/db/models/partenaires/Partenaire_model"); // mock du modèle pour eviter d'acceder à la vraie base de donnée 

describe('Test de création de partenaire', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Nettoyer les mocks avant chaque test
    });

    it('devrait retourner une erreur si les données de validation sont incorrectes', async () => {
        const res = await request(app)
            .post('/partenaires')
            .send({
                NOM_PARTENAIRE: '',
                PRENOM_PARTENAIRE: '',
                EMAIL_PARTENAIRE: 'invalid email',
                MOT_DE_PASSE: 'short',
                CONFIRM_PASSWORD: 'does not match',
                SEXE_ID: 'invalid',
                ETAT_CIVIL_ID: '',
                DATE_NAISSANCE: '',
                TELEPHONE: '',
                ADRESSE_COMPLET: '',
                TYPE_PARTENAIRE_ID: '',
                LATITUDE: '',
                LONGITUDE: ''
            });

        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe('Erreur de validation des données');
        expect(res.body.errors).toHaveProperty('NOM_PARTENAIRE');
        expect(res.body.errors).toHaveProperty('EMAIL_PARTENAIRE');
        expect(res.body.errors).toHaveProperty('MOT_DE_PASSE');
        expect(res.body.errors).toHaveProperty('CONFIRM_PASSWORD');
    });

    it('devrait créer un partenaire avec des données valides', async () => {
        const mockPartenaire = {
            NOM_PARTENAIRE: 'Igirubuntu',
            PRENOM_PARTENAIRE: 'Elam',
            EMAIL_PARTENAIRE: 'elam@example.com',
            MOT_DE_PASSE: 'password123',
            SEXE_ID: 1,
            ETAT_CIVIL_ID: 1,
            DATE_NAISSANCE: '1998-01-01',
            TELEPHONE: '12345678',
            ADRESSE_COMPLET: 'Ngobe address',
            TYPE_PARTENAIRE_ID: 1,
            LATITUDE: '123456',
            LONGITUDE: '789123'
        };

        Partenaires.create.mockResolvedValue({
            ...mockPartenaire,
            ID_PARTENAIRE: 1,
            PASSWORD: await bcrypt.hash(mockPartenaire.MOT_DE_PASSE, 10),
        });

        const res = await request(app)
            .post('/partenaires')
            .send({
                ...mockPartenaire,
                CONFIRM_PASSWORD: mockPartenaire.MOT_DE_PASSE
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Partenaire crée avec succès');
        expect(res.body.data).toHaveProperty('ID_PARTENAIRE');
        expect(res.body.data).not.toHaveProperty('MOT_DE_PASSE'); // Vérifie que le mot de passe est supprimé
    });
});