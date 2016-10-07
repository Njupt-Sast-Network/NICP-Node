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
// init


module.exports=db;

