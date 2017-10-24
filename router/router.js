let Router = require('koa-router');
let router = new Router();
const convert = require('koa-convert');

const session = require('koa-generic-session');
const views = require('koa-view');
const path = require('path');
const team = require('../controller/team');
const admin = require('../controller/admin');
const judger = require('../controller/judger');
const everyone = require('../controller/everyone');
const {Roles, verifyAuth, logout} = require('./auth');
const config = require('../config');


//模版
router.use(convert(views(path.join(__dirname, '..', 'view'), {
    noCache: config.debug,
    ext: "nunj",
})));


//session
router.use(convert(session()));

//路由
router.get('/',async (ctx, next) =>  {
    ctx.redirect('/team/login/');
});
router.post("/logout/:role/", logout);

if(!config.disableTeam){
    router.all("/team/login/*", team.login.routes(), team.login.allowedMethods());
    router.all("/team/*", verifyAuth(Roles.team), team.routes(), team.allowedMethods());
}


router.all("/admin/login/*", admin.login.routes(), admin.login.allowedMethods());
router.all("/admin/*", verifyAuth(Roles.admin), admin.routes(), admin.allowedMethods());

router.all("/judger/login/*", judger.login.routes(), judger.login.allowedMethods());
router.all("/judger/*", verifyAuth(Roles.judger), judger.routes(), judger.allowedMethods());

router.all("/everyone/*",everyone.routes(),everyone.allowedMethods());


module.exports = router;

