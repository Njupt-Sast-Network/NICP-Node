/**
 * Created by wxy on 16/9/30.
 */
'use strict';
var Sequelize = require('sequelize');
var sequelize = require('./db');
var Team = sequelize.define('team', {
    username: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    firstAuthorId: {
        type: Sequelize.STRING,
    },
    firstAuthor: {
        type: Sequelize.JSONB,
    },
    otherAuthors: {
        type: Sequelize.JSONB,
    },
    project: {
        type: Sequelize.JSONB,
    },
    teachers: {
        type: Sequelize.JSONB,
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['username']
        },
        {
            unique: true,
            fields: ['firstAuthorId']
        },
    ]
});
module.exports = Team;