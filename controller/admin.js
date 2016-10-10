/**
 * Created by wxy on 16/9/30.
 */
let Roles = require("../router/auth").Roles;
// Login
let login = require('koa-router')();
login.get('*/', function *(next) {
    yield this.render('login', {
        title: this.cfg.siteName + "管理员登陆",
        name: this.cfg.siteName + "管理员登陆",
    });
});

login.post('*/', function *(next) {
    let username = this.request.fields.username.toString();
    let password = this.request.fields.password.toString();
    console.log(username, password);
    let userInfo = yield this.db.Admin.findOne({
        where: {
            username: username,
            password: password,
        }
    });
    if (userInfo.username === username) {
        this.session.id = userInfo.id;
        this.session.name = userInfo.username;
        this.session.role = Roles.Admin;
    }
});

//Team
let admin = require('koa-router')();
// admin.get('*/', function *(next) {
//     yield this.render('team/news');
// });
admin.get('*/news', function *(next) {
    let newsList = yield this.db.News.findAll();
    yield this.render('admin/news',{
        title: "通知公告",
        name: "通知公告",
        newsList:newsList
    });
});

admin.login = login;
module.exports = admin;