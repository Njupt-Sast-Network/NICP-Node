let router = require('koa-router')();
const session = require('koa-generic-session');
const views = require('koa-view');
const path = require('path');
const team = require('../controller/team');

const {Roles, verifyAuth ,logout} = require('./auth');

//模版
router.use(views(path.join(__dirname, '..', 'view'), {
    noCache: true,
    ext: "nunj",
}));

//session
router.use(session());

//路由
router.post("/logout",logout);
router.all("/team/login/*", team.login.routes(), team.login.allowedMethods());
router.all("/team/*", /*verifyAuth(Roles.team),*/ team.routes(), team.allowedMethods());


module.exports = router;

