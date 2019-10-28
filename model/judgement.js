/**
 * Created by wxy on 2016/10/27.
 */
'use strict';
var Sequelize = require('sequelize');
var sequelize = require('./db');
var Judgement = sequelize.define('judgement', {
    rate: {
        type: Sequelize.INTEGER,
    },
    comment: {
        type:Sequelize.TEXT,
    },
    valid:{
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
});
module.exports = Judgement;