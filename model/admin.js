/**
 * Created by wxy on 2016/10/8.
 */
'use strict';
var Sequelize = require('sequelize');
var sequelize = require('./db');
var Admin = sequelize.define('admin', {
    username: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
}, {
    indexes: [
        {
            unique: true,
            fields: ['username']
        },
    ]
});
module.exports = Admin;