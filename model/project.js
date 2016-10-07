/**
 * Created by wxy on 16/9/30.
 */
'use strict';
var Sequelize = require('sequelize');
var sequelize=require('./db');
var User = sequelize.define('user', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
}, {
    indexes: [
        {
            unique: true,
            fields: ['username']
        }
    ],
    timestamps: true,
    createdAt: false,
    updatedAt: false,
    paranoid: true,
});
module.exports=User;