const sequelize = require('./db');


let db = {};

const Team =  require("./team");
db.Team=Team;
Team.sync({force:true})
    .then(function () {
        db.Team.create({
            username:"wxy",
            password:"wxy"
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
            role:0,
        });
    });
// init


module.exports=db;

