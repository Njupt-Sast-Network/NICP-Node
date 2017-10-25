const sequelize = require('./model/db');
const config = require('./config');
const {passwordHash} = require('./util/crypto');
let db = {};
// init
const Team = require("./model/team");
const News = require("./model/news");
const Admin = require("./model/admin");
const File = require("./model/file");
const Judger = require("./model/judger");
const Judgement = require("./model/judgement");



db._sequelize = sequelize;
db.Team = Team;
db.News = News;
db.Admin = Admin;
db.File = File;
db.Judger = Judger;
db.Judgement = Judgement;
module.exports = db;

async function db_init() {
    Team.belongsToMany(Judger, {through: Judgement});
    Judger.belongsToMany(Team, {through: Judgement});
    await Team.sync({force: true})
        .then(function () {
            db.Team.create({
                username: "wxy",
                password: passwordHash("123wxy"),
            });
        });
    await News.sync({force:true})
        .then(function () {
            return db.News.create({
                title: "test123123",
                content: "testtesttest",
                author: "wxy",
                role: 1,
            });
        })
        .then(function () {
            return db.News.create({
                title: "test123123",
                content: "testtesttest",
                author: "wxy",
                role: 2,
            });
        });
    await Admin.sync({force: true})
        .then(function (database) {
            database.create({
                username: config.rootUserName,
                password: passwordHash(config.rootUserPassword),
            });
        });
    await File.sync({force: true});
    await Judger.sync({force: true})
        .then(function (database) {
            return database.create({
                username: "wxy",
                password: passwordHash("123wxy"),
            });
        });

    await Judgement.sync({force: true});

    let teamList = await Team.findAll({
        order: [['id','ASC']],
    });
    let judgers = await Judger.findAll();

    //console.log(judgers[0].id);
    //console.log(teamList[0].addJudgers);
    await teamList[0].addJudger(judgers[0], { through: { valid:true}});
    sequelize.close();
}
db_init().then(function () {

},function (err) {
    console.log(err);
});