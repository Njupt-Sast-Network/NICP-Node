/**
 * Created by wxy on 2016/10/19.
 */
'use strict';
var Sequelize = require('sequelize');
var sequelize = require('./db');
var File = sequelize.define('file', {
    fileName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    savePath: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    size: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    uploaderRole: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    uploaderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    role: {
        type: Sequelize.INTEGER,
        allowNull: false,
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['fileName']
        },
    ]
});
module.exports = File;