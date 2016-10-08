/**
 * Created by wxy on 2016/10/8.
 */
'use strict';
var Sequelize = require('sequelize');
var sequelize = require('./db');
var News = sequelize.define('new', {
    content: {
        type: Sequelize.STRING(5000),
        allowNull: false,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    author: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    viewCount: {
        type: Sequelize.INTEGER,
        defaultValue:0,
        allowNull: false,
    },
    role:{
        type: Sequelize.INTEGER,
        allowNull: false,
    }
});
module.exports = News;