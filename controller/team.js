/**
 * Created by wxy on 16/9/30.
 */
let Roles = require("../router/auth").Roles;
// Login
let login = require('koa-router')();
login.get('*/', function *(next) {
    yield this.render('login', {
        title: this.cfg.siteName + "队伍登陆",
        name: this.cfg.siteName + "队伍登陆",
    });
});

login.post('*/', function *(next) {
    let username = this.request.fields.username.toString();
    let password = this.request.fields.password.toString();
    console.log(username, password);
    let userInfo = yield this.db.Team.findOne({
        where: {
            username: username,
            password: password,
        }
    });
    if (userInfo.username === username) {
        this.session.id = userInfo.id;
        this.session.name = userInfo.username;
        this.session.role = Roles.team;
    }
});

//Team
let team = require('koa-router')();
// team.get('*/', function *(next) {
//     yield this.render('team/news');
// });
team.get('*/news', function *(next) {
    let newsList = yield this.db.News.findAll();
    console.log(newsList);
    yield this.render('team/news',{
        title: "通知公告",
        name: "通知公告",
        newsList:newsList
    });
    for (let news of newsList) {
        yield news.increment('viewCount');
    }
});

team.login = login;
module.exports = team;