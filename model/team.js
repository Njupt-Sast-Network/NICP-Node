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
        defaultValue: {}
    },
    otherAuthors: {
        type: Sequelize.JSONB,
        defaultValue: [{}, {}, {}],
    },
    project: {
        type: Sequelize.JSONB,
        defaultValue: {}
    },
    teachers: {
        type: Sequelize.JSONB,
        defaultValue: [{}, {}]
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['username']
        },
    ]
});
module.exports = Team;