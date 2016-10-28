let router = require('koa-router')();
const session = require('koa-generic-session');
const views = require('koa-view');
const path = require('path');
const team = require('../controller/team');
const admin = require('../controller/admin');
const judger = require('../controller/judger');
const {Roles, verifyAuth, logout} = require('./auth');

//模版
router.use(views(path.join(__dirname, '..', 'view'), {
    noCache: true,
    ext: "nunj",
}));

//session
router.use(session());

//路由
router.post("/logout", logout);

router.all("/team/login/*", team.login.routes(), team.login.allowedMethods());
router.all("/team/*", /*verifyAuth(Roles.team),*/ team.routes(), team.allowedMethods());

router.all("/admin/login/*", admin.login.routes(), admin.login.allowedMethods());
router.all("/admin/*", /*verifyAuth(Roles.admin),*/ admin.routes(), admin.allowedMethods());

router.all("/judger/login/*", judger.login.routes(), judger.login.allowedMethods());
router.all("/judger/*", /*verifyAuth(Roles.judger),*/ judger.routes(), judger.allowedMethods());

module.exports = router;

