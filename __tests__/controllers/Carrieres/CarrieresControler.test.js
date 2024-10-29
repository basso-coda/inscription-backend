/**
 * test de  Carrieres
 * Amani mamba
 * amani.mamba#mediabox.bi
 * 22/10/2024 
 */

const { createCarrieres, 
    getAllCarrieress, 
    deleteCarrieres, 
    updateCarrieres } = require('../../../src/controllers/Carrieres/CarriereController');

const yup = require('yup');
// Mocking the dependencies
jest.mock("yup", () => ({
    object: () => ({
        shape: () => ({
            required: () => ({
                validate: jest.fn()
            })
        })
    })
}));

jest.mock('bcrypt', () => ({
    // Mock the bcrypt functions you are using
}));

jest.mock('../../../src/db/models/Carrieres/Carriere_model', () => ({
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    destroy: jest.fn(),
    update: jest.fn()
}));

describe('Carrieres Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('createCarrieres should create a new Carrieres', async () => {
        const req = { body: { DESCRIPTION: 'Some description', NOTE: 'Some note' } };
        const res = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        };

        await createCarrieres(req, res);

        expect(res.json).toHaveBeenCalledWith({
            message: 'Carrieres créé avec succès',
            data: expect.any(Object)
        });
    });

    test('getAllCarrieress should retrieve all Carrieress', async () => {
        const req = { query: {} };
        const res = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        };

        await getAllCarrieress(req, res);

        expect(res.json).toHaveBeenCalledWith({
            httpStatus: 200,
            message: 'Carrieress recupérés avec succès',
            data: expect.any(Object)
        });
    });

    test('deleteCarrieres should delete a Carrieres', async () => {
        const req = { body: { ID_CARRIER: 1 } };
        const res = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        };

        await deleteCarrieres(req, res);

        expect(res.json).toHaveBeenCalledWith({ message: 'Carrieres supprimé avec succès' });
    });

    test('updateCarrieres should update a Carrieres', async () => {
        const req = { body: { ID_CARRIER: 1 } };
        const res = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        };

        await updateCarrieres(req, res);

        expect(res.json).toHaveBeenCalledWith({ message: 'Carrieres mis à jour avec succès' });
    });
});