const zoneRouter = require('express').Router();
const ZoneController = require('../../controllers/zones/Zone_controller');
const verifToken = require('../../middlewares/verifyToken');

zoneRouter.use(verifToken);

zoneRouter.get('/zones', ZoneController.getZones);

module.exports = zoneRouter
