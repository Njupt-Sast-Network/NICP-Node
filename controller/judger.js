/**
 * Created by wxy on 16/9/30.
 */
let Roles = require("../router/auth").Roles;
let fs = require("fs-promise");
let path = require("path");
let Router = require('koa-router');

// Login
let login = new Router();
login.get('*/', async (ctx, next) => {
    await ctx.render('login', {
        title: ctx.cfg.siteName + "评委登陆",
        name: ctx.cfg.siteName + "评委登陆",
    });
});

login.post('*/', async (ctx, next) => {
    let username = ctx.request.fields.username.toString();
    let password = ctx.request.fields.password.toString();
    let rememberMe = (ctx.request.fields.remember_me && ctx.request.fields.remember_me.toString() === 'on');
    let userInfo = await ctx.db.Judger.findOne({
        where: {
            username: username,
            password: password,
        }
    });
    if (userInfo &&  "username" in userInfo && userInfo.username === username) {
        ctx.session.id = userInfo.id;
        ctx.session.name = userInfo.username;
        ctx.session.role = Roles.judger;
        if(rememberMe){
            ctx.session.cookie.maxage=7*24*60*60*1000;//一周
        }else{
            ctx.session.cookie.maxage=null;//关闭浏览器马上失效
        }
        ctx.body={status:"success"};
    } else {
        ctx.body={status:"error",data:"用户名或密码错误"};
    }
});

const judger = new Router();

judger.get('*/password/', async (ctx, next) => {
    await ctx.render('judger/password',{
        username:ctx.session.name,
    });
});

judger.post('*/password/', async (ctx, next) => {
    let oldPassword = ctx.request.fields.old_password.toString();
    let newPassword = ctx.request.fields.new_password.toString();
    if (newPassword !== ctx.request.fields.again_password.toString()) {
        ctx.body = {status: "error", data: "两次新密码不符"};
        return;
    }
    let userInfo = await ctx.db.Judger.findById(ctx.session.id);
    if (userInfo.password !== oldPassword) {
        ctx.body = {status: "error", data: "旧密码错误"};
        return;
    }

    userInfo.set('password', newPassword);
    userInfo.save();
    ctx.body = {status: "success", data: "修改成功"};
});

judger.get('*/news/', async (ctx, next) => {
    let newsList = await ctx.db.News.findAll({
        where: {
            role: Roles.judger,
        },
        order: [['id','ASC']],
    });
    await ctx.render('judger/news', {
        username:ctx.session.name,
        title: "通知公告",
        name: "通知公告",
        newsList: newsList
    });
    //TODO:阅读量增加可以一次 sql 请求就完成
    for (let news of newsList) {
        await news.increment('viewCount');
    }
});

judger.get('*/rate/', async (ctx, next) => {
    let teamList = await ctx.db.Team.findAll({
        include: [{
            model: ctx.db.Judger,
            required: true,
            where: {id: ctx.session.id},
            through: {
                attributes: ['rate','valid'],
                where:{
                    valid:true,
                }
            },
            order: [['id','DESC']]
        }]
    });
    // console.log(teamList);
    // if(teamList[0].judgers.length>0){
    //     console.log(teamList[0].judgers[0].judgement);
    // }
    await ctx.render('judger/rate', {
        username:ctx.session.name,
        teamList: teamList
    });
});

judger.get('*/rate/show_project/:id/',async (ctx, next) => {
    let projectInfo = await ctx.db.Team.findById(ctx.params.id);
    await ctx.render('judger/show_project', {
        username:ctx.session.name,
        jsonModel: ctx.jsonModel,
        projectData: projectInfo.project,
    });
});

judger.post('*/rate/save/:id/', async (ctx, next) => {
    let rate = Number.parseInt(ctx.request.fields.rate);
    let comment = String(ctx.request.fields.comment);

    if (Number.isInteger(rate) === false || rate < 1 || rate > 100 || comment.length ===0) {
        ctx.body = {status: "error", data: "评分必须是整数并且在1到100之间，点评必填"};
        return;
    }
    let teamInfo = await ctx.db.Team.findById(ctx.params.id);
    teamInfo.addJudgers(ctx.session.id, {rate: ctx.request.fields.rate,comment: ctx.request.fields.comment});
    ctx.body = {status: "success"};
});


judger.get('*/rate/download/:id/', async (ctx, next) => {

    let fileName = ctx.params.id + '_report_cutted.pdf';
    let fileInfo = await ctx.db.File.findOne({
        where: {
            fileName: fileName,
            uploaderRole: Roles.team,
            uploaderId: ctx.params.id,
        }
    });
    if (fileInfo === null) {
        await ctx.render('fail', {
            title: "未上传该文件",
            message: "相关文件未上传"
        });
        return;
    }


    try {
        let filePath = path.join(ctx.cfg.uploadPath, fileInfo.savePath);
        let fd = await fs.open(filePath, 'r');
        ctx.response.attachment(fileInfo.fileName);
        ctx.body = await fs.readFile(fd);
    } catch (err) {
        if (err.code === 'ENOENT') {
            await ctx.render('fail', {
                title: "未上传该文件",
                message: "相关文件未上传"
            });
        } else {
            console.error(err);
            await ctx.render('fail', {
                title: "未知错误",
                message: "请通知管理人员"
            });
        }
    }

});

// 接收未匹配的路由，务必放在最后
judger.all('*/', async (ctx, next) => {
    await ctx.redirect("./news/")
});

judger.login = login;
module.exports = judger;