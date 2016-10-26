const sequelize = require('./db');


let db = {};
// init
const Team =  require("./team");
db.Team=Team;
Team.sync({force:true})
    .then(function () {
        db.Team.create({
            username:"wxy",
            password:"123wxy"
        });
    });

const News =  require("./news");
db.News=News;
News.sync({force:true})
    .then(function () {
        db.News.create({
            title:"test123123",
            content:"testtesttest",
            author:"wxy",
            role:1,
        });
    });

const Admin =  require("./admin");
db.Admin=Admin;
Admin.sync({force:true})
    .then(function (database) {
        database.create({
            username:"wxy",
            password:"123wxy"
        });
    });

const File =  require("./file");
db.File = File;
File.sync({force:true});

module.exports=db;

