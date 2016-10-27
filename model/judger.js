/**
 * Created by wxy on 2016/10/27.
 */
'use strict';
var Sequelize = require('sequelize');
var sequelize = require('./db');
var Judger = sequelize.define('judger', {
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
module.exports = Judger;