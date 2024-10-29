/**
 * test de historique contrat
 * Amani mamba
 * amani.mamba#mediabox.bi
 * 22/10/2024 
 */
const {
    getAllHistoriqueContrats,
    getHistoriqueContratById,
    createHistoriqueContrat,
    deleteHistoriqueContrat,
    updateHistoriqueContrat
} = require('../../../src/controllers/Contrat/HistoriqueContratController');

const HistoriqueContrat = require('../../../src/db/models/Contrat/HistoriqueContrat');
const Uploader = require("../../../src/utils/Upload");


jest.mock('../../../src/utils/Upload', () => ({
    save: jest.fn(),
}))

jest.mock('../../../src/db/models/Contrat/HistoriqueContrat', () => ({
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
    update: jest.fn()
}));

describe('HistoriqueContrat Controller', () => {
    // Test pour la fonction getAllHistoriqueContrats
    it('getAllHistoriqueContrats', async () => {
        const mockHistoriqueContrats = [{ id: 1, nom: 'Contrat 1' }];
        HistoriqueContrat.findAll.mockResolvedValue(mockHistoriqueContrats);

        const req = {};
        const res = {
            json: jest.fn()
        };

        await getAllHistoriqueContrats(req, res);

        expect(res.json).toHaveBeenCalledWith({
            message: 'Historique de contrat recupérés avec succès',
            data: mockHistoriqueContrats
        });
    });

    // Test pour la fonction getHistoriqueContratById
    it('getHistoriqueContratById', async () => {
        const mockHistoriqueContrat = { id: 1, nom: 'Contrat 1' };
        HistoriqueContrat.findByPk.mockResolvedValue(mockHistoriqueContrat);

        const req = { params: { id: 1 } };
        const res = {
            json: jest.fn()
        };

        await getHistoriqueContratById(req, res);

        expect(res.json).toHaveBeenCalledWith({
            message: 'Historique de contrat recupérés avec succès',
            data: mockHistoriqueContrat
        });

        // Vérifier le nombre d'appels à res.json
        expect(res.json).toHaveBeenCalledTimes(1);
    });


    it('createHistoriqueContrat', async () => {
        const req = {
            body: {
                ID_EMPLOYE: 1,
                DATE_INSERTION: '2024-10-17',
                COMMENTAIRE: 'Nouveau contrat',
                USER_ID: 1,
                PATH_CONTRAT: 'path/contrat',
                TYPE_CONTRAT: 'CDI',
                DATE_DEBUT: '2024-10-17',
                DATE_FIN: '2025-10-17'
            },
            protocol: 'http',
            get: jest.fn().mockReturnValue('localhost')
        };
    
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
    
        const mockUploadedFile = {
            fileInfo: {
                fileName: 'uploaded_file.pdf'
            }
        };
    
        const mockNewHistoriqueContrat = {
            ID_EMPLOYE: 1,
            DATE_INSERTION: '2024-10-17',
            COMMENTAIRE: 'Nouveau contrat',
            USER_ID: 1,
            PATH_CONTRAT: 'http://localhost/uploaded_file.pdf', // Correction du chemin du contrat
            TYPE_CONTRAT: 'CDI',
            DATE_DEBUT: '2024-10-17',
            DATE_FIN: '2025-10-17'
        };
    
        Uploader.save.mockResolvedValue(mockUploadedFile);
        HistoriqueContrat.create.mockResolvedValue(mockNewHistoriqueContrat);
    
        await createHistoriqueContrat(req, res);
    
        expect(Uploader.save).toHaveBeenCalledWith('path/contrat', 'uploaded_file.pdf');
        expect(HistoriqueContrat.create).toHaveBeenCalledWith(mockNewHistoriqueContrat);
    
        expect(res.json).toHaveBeenCalledWith({
            message: 'Historique de contrat créé avec succès',
            data: mockNewHistoriqueContrat
        });
    });
    

});