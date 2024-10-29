const dotenv = require('dotenv')

dotenv.config()

module.exports = {
  "development": {
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.BD_HOST,
    "port": process.env.DB_PORT ? process.env.DB_PORT : 3306,
    "dialect": 'mysql'
  },
  "test": {
    "dialect": "sqlite",
    "storage": ":memory:",
    "logging": false,
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "cncm_bitwi",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
