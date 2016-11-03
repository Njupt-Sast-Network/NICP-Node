const sequelize = require('./db');
const config = require('../config');
const CryptoJS = require('crypto-js');

function passwordHash(password) {
    return CryptoJS.SHA512(CryptoJS.SHA512(password)+"NICP_FE_SALT_VVxETKJy7bjDtLa83ECG").toString();
}

let db = {};
// init
const Team = require("./team");
const News = require("./news");
const Admin = require("./admin");
const File = require("./file");
const Judger = require("./judger");
const Judgement = require("./judgement");

Team.belongsToMany(Judger, {through: Judgement});
Judger.belongsToMany(Team, {through: Judgement});

db.Team = Team;
Team.sync({force: config.debug})
    .then(function () {
        db.Team.create({
            username: "wxy",
            password: passwordHash("123wxy"),
        });
    });


db.News = News;
News.sync({force: config.debug})
    .then(function () {
        db.News.create({
            title: "test123123",
            content: "testtesttest",
            author: "wxy",
            role: 1,
        });
    });


db.Admin = Admin;
Admin.sync({force: config.debug})
    .then(function (database) {
        database.create({
            username: "wxy",
            password: passwordHash("123wxy"),
        });
    });


db.File = File;
File.sync({force: config.debug});

db.Judger = Judger;
Judger.sync({force: config.debug})
    .then(function (database) {
        database.create({
            username: "wxy",
            password: passwordHash("123wxy"),
        });
    })
    .then(function () {
        Judgement.sync({force: config.debug});
    });

db.Judgement = Judgement;


module.exports = db;

