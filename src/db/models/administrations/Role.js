const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;

const Role = sequelize.define('role', {
    ID_ROLE: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true,
    },

    DESCRIPTION: DataTypes.STRING,
    IS_DELETED: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0
    }
}, {
    tableName: 'role',
    timestamps: false,
})

module.exports = Role;