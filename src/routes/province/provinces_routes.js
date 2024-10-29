const provinceRouter = require('express').Router();
const ProvinceController = require('../../controllers/provinces/Province_controller');
const verifToken = require('../../middlewares/verifyToken');

provinceRouter.use(verifToken);

provinceRouter.get('/provinces', ProvinceController.getProvinces);

module.exports = provinceRouter
