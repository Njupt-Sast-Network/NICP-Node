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
        this.session.role = Roles.admin;
    }
});

//Team
let admin = require('koa-router')();
// admin.get('*/', function *(next) {
//     yield this.render('team/news');
// });
admin.get('*/news/', function *(next) {
    let newsList = yield this.db.News.findAll();
    yield this.render('admin/news', {
        newsList: newsList,
        roles:Roles,
    });
});
admin.get('*/news/add/', function *(next) {
    yield this.render('admin/news_add',{
        roles: Roles,
    });
});
admin.post('*/news/add/', function *(next) {
    yield this.db.News.create(this.request.fields);
    this.redirect('../');
});

admin.get('*/news/edit/:id/', function *(next) {
    let news = yield this.db.News.findById(this.params.id);
    yield this.render('admin/news_edit', {
        news: news,
        roles: Roles,
    });
});
admin.post('*/news/edit/:id/', function *(next) {
    yield this.db.News.update(this.request.fields, {
        where: {
            id: this.params.id,
        }
    });
    this.redirect('../../');
});

admin.get('*/news/del/:id/', function *(next) {
    let news = yield this.db.News.findById(this.params.id);
    yield this.render('admin/news_del', {
        news: news,
        roles: Roles,
    });
});
admin.post('*/news/del/:id/', function *(next) {
    yield this.db.News.destroy({
        where: {
            id: this.params.id,
        }
    });
    this.redirect('../../');
});
admin.login = login;
module.exports = admin;