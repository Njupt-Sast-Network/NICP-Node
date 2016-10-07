/**
 * Created by wxy on 16/9/30.
 */
'use strict';
var Sequelize = require('sequelize');
module.exports = new Sequelize('nicp', 'nicp', 'sastnicp', {
    host: '127.0.0.1',
    dialect: 'postgres',
    pool: {
        max: 10,
        min: 0,
        idle: 10000
    },
});