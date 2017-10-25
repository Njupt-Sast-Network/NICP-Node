/**
 * Created by wxy on 16/9/30.
 */
'use strict';
var Sequelize = require('sequelize');
const config = require('../config');
module.exports = new Sequelize(config.db.name, config.db.user, config.db.password, {
    host: config.db.host,
    port: config.db.port,
    dialect: 'postgres',
    logging: config.debug ? console.log:false,
    pool: {
        max: 10,
        min: 0,
        idle: 10000
    },
});