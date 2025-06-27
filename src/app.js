const express = require('express');
const app = express();
const cors = require("cors");

const dotenv = require('dotenv');
const fileUpload = require("express-fileupload");

const routesProvider = require('./routes/routesProvider');
const paiementRouter = require('./routes/gestion_paiement/paiement_routes');

dotenv.config()

app.use(cors({
  origin: "*"
}));

app.use(express.static(__dirname + "/../public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.use('/', paiementRouter)
app.use('/api', routesProvider);

app.all('*', async (_, res) => res.status(404).json({
  message: "Ce lien n'existe pas dans le système",
  httpStatus: 404,
  data: null
}))

module.exports = app;