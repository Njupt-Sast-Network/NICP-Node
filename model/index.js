const sequelize = require('./db');
const config = require('../config');
const {passwordHash} = require('../util/crypto');
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

db._sequelize = sequelize;
db.Team = Team;
db.News = News;
db.Admin = Admin;
db.File = File;
db.Judger = Judger;
db.Judgement = Judgement;
module.exports = db;

