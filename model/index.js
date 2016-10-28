const sequelize = require('./db');
const config = require('../config');

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
            password: "123wxy"
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
            password: "123wxy"
        });
    });


db.File = File;
File.sync({force: config.debug});

db.Judger = Judger;
Judger.sync({force: config.debug})
    .then(function (database) {
        database.create({
            username: "wxy",
            password: "123wxy"
        });
    })
    .then(function () {
        Judgement.sync({force: config.debug});
    });

db.Judgement = Judgement;


module.exports = db;

