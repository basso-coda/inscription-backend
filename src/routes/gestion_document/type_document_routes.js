const typeDocumentRouter = require('express').Router();
const TypeDocumentController = require('../../controllers/gestion_document/TypeDocument_controller');
const verifToken = require('../../middlewares/verifyToken');

typeDocumentRouter.use(verifToken);

typeDocumentRouter.get('/type_documents', TypeDocumentController.getTypeDocuments);
typeDocumentRouter.post('/type_documents', TypeDocumentController.createTypeDocument);
typeDocumentRouter.get('/type_documents/:ID_TYPE_DOCUMENT', TypeDocumentController.getTypeDocument);
typeDocumentRouter.put('/type_documents/:ID_TYPE_DOCUMENT', TypeDocumentController.updateTypeDocument);
typeDocumentRouter.post('/type_documents/delete', TypeDocumentController.deleteTypeDocument);

module.exports = typeDocumentRouter
