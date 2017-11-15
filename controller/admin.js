/**
 * Created by wxy on 16/9/30.
 */
let Roles = require("../router/auth").Roles;
// Login
let Router = require('koa-router');
let login = new Router();
const fs = require('fs-promise');
const path = require('path');
const xls = require('../util/xls/xls');
const moment = require('moment');

login.get('*/', async (ctx, next) => {
    await ctx.render('login', {
        title: ctx.cfg.siteName + "管理员登陆",
        name: ctx.cfg.siteName + "管理员登陆",
    });
});

login.post('*/', async (ctx, next) => {
    let username = ctx.request.fields.username.toString();
    let password = ctx.request.fields.password.toString();
    let rememberMe = (ctx.request.fields.remember_me && ctx.request.fields.remember_me.toString() === 'on');
    let userInfo = await ctx.db.Admin.findOne({
        where: {
            username: username,
            password: password,
        }
    });
    if (userInfo && "username" in userInfo && userInfo.username === username) {
        ctx.session.id = userInfo.id;
        ctx.session.name = userInfo.username;
        ctx.session.role = Roles.admin;
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

//Admin
let admin = new Router();

admin.get('*/password/', async (ctx, next) => {
    await ctx.render('admin/password',{
        username:ctx.session.name,
    });
});

admin.post('*/password/', async (ctx, next) => {
    let oldPassword = ctx.request.fields.old_password.toString();
    let newPassword = ctx.request.fields.new_password.toString();
    if (newPassword !== ctx.request.fields.again_password.toString()) {
        ctx.body = {status: "error", data: "两次新密码不符"};
        return;
    }
    let userInfo = await ctx.db.Admin.findById(ctx.session.id);
    if (userInfo.password !== oldPassword) {
        ctx.body = {status: "error", data: "旧密码错误"};
        return;
    }

    userInfo.set('password', newPassword);
    userInfo.save();
    ctx.body = {status: "success", data: "修改成功"};
});
admin.get('*/news/', async (ctx, next) => {
    let newsList = await ctx.db.News.findAll({
        order: [['id','ASC']],
    });
    await ctx.render('admin/news/index', {
        username:ctx.session.name,
        newsList: newsList,
        roles: Roles,
    });
});
admin.get('*/news/add/', async (ctx, next) => {
    await ctx.render('admin/news/add', {
        username:ctx.session.name,
        roles: Roles,
    });
});
admin.post('*/news/add/', async (ctx, next) => {
    await ctx.db.News.create(ctx.request.fields);
    ctx.redirect('../');
});

admin.get('*/news/edit/:id/', async (ctx, next) => {
    let news = await ctx.db.News.findById(ctx.params.id);
    await ctx.render('admin/news/edit', {
        username:ctx.session.name,
        news: news,
        roles: Roles,
    });
});

admin.post('*/news/edit/:id/', async (ctx, next) => {
    await ctx.db.News.update(ctx.request.fields, {
        where: {
            id: ctx.params.id,
        }
    });
    ctx.redirect('../../');
});

admin.get('*/news/del/:id/', async (ctx, next) => {
    let news = await ctx.db.News.findById(ctx.params.id);
    await ctx.render('admin/news/del', {
        username:ctx.session.name,
        news: news,
        roles: Roles,
    });
});
admin.post('*/news/del/:id/', async (ctx, next) => {
    await ctx.db.News.destroy({
        where: {
            id: ctx.params.id,
        }
    });
    ctx.redirect('../../');
});

//team
admin.get('*/team/', async (ctx, next) => {
    let teamList = await ctx.db.Team.findAll({
        order: [['id','ASC']],
    });
    let fileList = await ctx.db.File.findAll({
        order: [['id','ASC']],
    });
    let fileNameList=[];
    Array.from(fileList).forEach(function (file) {
        fileNameList.push(file.fileName)
    });
    await ctx.render('admin/team/index', {
        username:ctx.session.name,
        teamList: teamList,
        projectModel: ctx.jsonModel.project,
        fileNameList:fileNameList,
    });
});
admin.get('*/team/add/', async (ctx, next) => {
    await ctx.render('admin/team/add',{
        username:ctx.session.name,
    });
});
admin.post('*/team/add/', async (ctx, next) => {
    try{
        await ctx.db.Team.create(ctx.request.fields);
    }catch(e) {
        ctx.body={status:"error",data:e.errors};
        return ;
    }
    ctx.body={status:"success"};
});


admin.get('*/team/del/:id/', async (ctx, next) => {
    let team = await ctx.db.Team.findById(ctx.params.id);
    await ctx.render('admin/team/del', {
        username:ctx.session.name,
        team: team,
    });
});
admin.post('*/team/del/:id/', async (ctx, next) => {
    await ctx.db.Team.destroy({
        where: {
            id: ctx.params.id,
        }
    });
    ctx.redirect('../../');
});

admin.get('*/team/edit/:team_id/', async (ctx, next) => {
    let team = await ctx.db.Team.findById(ctx.params.team_id);
    await ctx.render('admin/team/edit', {
        secretId:team.secretId,
        username:ctx.session.name,
        jsonModel: ctx.jsonModel,
        firstAuthorData: team.firstAuthor,
        otherAuthorData: team.otherAuthors,
        teacherData: team.teachers,
        team: team,
    });
});

admin.post('*/team/edit/:team_id/first_author/', async (ctx, next) => {
    let infoData = await ctx.db.Team.findById(ctx.params.team_id);
    let result = ctx.jsonModel.validate(ctx.request.fields, ctx.jsonModel.first_author);
    if (result === undefined) {
        infoData.set("firstAuthor", ctx.request.fields);
        infoData.set("firstAuthorId", ctx.request.fields.studentID);
        await infoData.save();
        ctx.body = {status: "success"};
    } else {
        ctx.body = {status: "error", data: result};
    }

});
admin.post('*/team/edit/:team_id/other_author/:id/', async (ctx, next) => {
    let infoData = await ctx.db.Team.findById(ctx.params.team_id);
    let result = ctx.jsonModel.validate(ctx.request.fields, ctx.jsonModel.other_author);
    if (result === undefined) {
        let otherAuthorsData = infoData.otherAuthors;
        otherAuthorsData[ctx.params.id] = ctx.request.fields;
        infoData.set("otherAuthors", otherAuthorsData);
        await infoData.save();
        ctx.body = {status: "success"};
    } else {
        ctx.body = {status: "error", data: result};
    }

});
admin.post('*/team/edit/:team_id/teacher/:id/', async (ctx, next) => {
    let infoData = await ctx.db.Team.findById(ctx.params.team_id);
    let result = ctx.jsonModel.validate(ctx.request.fields, ctx.jsonModel.teacher);
    if (result === undefined) {
        let teacherData = infoData.teachers;
        teacherData[ctx.params.id] = ctx.request.fields;
        infoData.set("teachers", teacherData);
        await infoData.save();
        ctx.body = {status: "success"};
    } else {
        ctx.body = {status: "error", data: result};
    }

});

admin.post('*/team/edit/:team_id/secret_id/', async (ctx, next) => {
    let infoData = await ctx.db.Team.findById(ctx.params.team_id);
    infoData.set("secretId", ctx.request.fields.secret_id);
    await infoData.save();
    ctx.body = {status: "success"};
});

admin.get('*/team/edit_project/:id/', async (ctx, next) => {
    let infoData = await ctx.db.Team.findById(ctx.params.id);
    await ctx.render('admin/team/edit_project', {
        username:ctx.session.name,
        jsonModel: ctx.jsonModel,
        projectData: infoData.project,
    });
});
admin.post('*/team/edit_project/:id/', async (ctx, next) => {
    let infoData = await ctx.db.Team.findById(ctx.params.id);
    let result = ctx.jsonModel.validate(ctx.request.fields, ctx.jsonModel.project);
    if (result === undefined) {
        infoData.set("project", ctx.request.fields);
        await infoData.save();
        ctx.body = {status: "success"};
    } else {
        ctx.body = {status: "error", data: result};
    }

});

//file
admin.get('*/file/', async (ctx, next) => {
    let fileList = await ctx.db.File.findAll({
        order: [['id','ASC']],
    });
    await ctx.render('admin/file/index', {
        username:ctx.session.name,
        fileList: fileList,
    });
});
admin.get('*/file/add/', async (ctx, next) => {
    await ctx.render('admin/file/add', {
        username:ctx.session.name,
        roles: Roles
    });
});
admin.post('*/file/add/', async (ctx, next) => {
    if ("file" in ctx.request.fields) {
        let fileName = ctx.request.fields.fileName;
        let filePath = path.join("./", ctx.request.fields.savePath);
        let absoluteFilePath = path.join(ctx.cfg.uploadPath, filePath);

        await fs.copy(ctx.request.fields.file[0].path,
            absoluteFilePath,
            {clobber: true}
        );

        await ctx.db.File.create({
            fileName: fileName,
            savePath: filePath,
            size: ctx.request.fields.file[0].size,
            uploaderRole: Roles.admin,
            uploaderId: ctx.session.id,
            role: ctx.request.fields.role,
        });
        ctx.body = {status: "success"};
    } else {
        ctx.body = {status: "error", data: "未发现文件"};
    }
});

admin.get('*/file/del/:id/', async (ctx, next) => {
    let fileInfo = await ctx.db.File.findById(ctx.params.id);
    await ctx.render('admin/file/del', {
        username:ctx.session.name,
        file: fileInfo
    });
});
admin.post('*/file/del/:id/', async (ctx, next) => {
    let fileInfo = await ctx.db.File.findById(ctx.params.id);
    let filePath = path.resolve(ctx.cfg.uploadPath, fileInfo.savePath);
    let newFilePath = path.join(ctx.cfg.uploadPath, "/deleted/", fileInfo.fileName);
    await fs.rename(filePath, newFilePath);
    await ctx.db.File.destroy({
        where: {
            id: ctx.params.id,
        }
    });
    ctx.redirect('../../');
});

admin.get('*/file/download/:id/', async (ctx, next) => {
    let fileInfo = await ctx.db.File.findById(ctx.params.id);
    try {
        let filePath = path.resolve(ctx.cfg.uploadPath, fileInfo.savePath);
        let fd = await fs.open(filePath, 'r');
        ctx.response.attachment(fileInfo.fileName);
        ctx.body = await fs.readFile(fd);
    } catch (err) {
        if (err.code === 'ENOENT') {
            await ctx.render('fail', {
                title: "文件不存在",
                message: "该文件不存在"
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

//team
admin.get('*/judger/', async (ctx, next) => {
    let judgerList = await ctx.db.Judger.findAll({
        order: [['id','ASC']],
    });
    await ctx.render('admin/judger/index', {
        username:ctx.session.name,
        judgerList: judgerList,
    });
});
admin.get('*/judger/add/', async (ctx, next) => {

    await ctx.render('admin/judger/add',{
        username:ctx.session.name,
    });
});

admin.post('*/judger/add/', async (ctx, next) => {
    try{
        await ctx.db.Judger.create(ctx.request.fields);
    }catch(e) {
        ctx.body={status:"error",data:e.errors};
        return ;
    }
    ctx.body={status:"success"};
});


admin.get('*/judger/del/:id/', async (ctx, next) => {
    let judger = await ctx.db.Judger.findById(ctx.params.id);
    await ctx.render('admin/judger/del', {
        username:ctx.session.name,
        judger: judger,
    });
});
admin.post('*/judger/del/:id/', async (ctx, next) => {
    await ctx.db.Judger.destroy({
        where: {
            id: ctx.params.id,
        }
    });
    ctx.redirect('../../');
});

admin.get('*/judger/edit/:id/', async (ctx, next) => {
    let teamList = await ctx.db.Team.findAll({
        include: [{
            model: ctx.db.Judger,
            required: false,
            through: {
                attributes: ['valid'],
            },
            where:{
                id:ctx.params.id,
            },
            order: [['id','ASC']],
        }],
        order: [['id','ASC']],
    });
    let judger = await ctx.db.Judger.findById(ctx.params.id);
    await ctx.render('admin/judger/edit', {
        username:ctx.session.name,
        judger: judger,
        teamList:teamList,
        projectCategoryMap:ctx.jsonModel.project.project_category.inclusion.within,
    });
});
admin.post('*/judger/edit/:id/', async (ctx, next) => {
    //console.log(ctx.request.fields);
    await ctx.db.Judger.update(ctx.request.fields, {
        where: {
            id: ctx.params.id,
        }
    });
    let teamList = await ctx.db.Team.findAll({
        order: [['id','ASC']],
    });
    for(let team of teamList){
        if ("team_"+team.id.toString() in ctx.request.fields){
            team.addJudgers(ctx.params.id, {through:{valid:true}});
        }else{
            team.removeJudgers(ctx.params.id);
        }
    }

    ctx.body={status:"success"};
});

admin.get('*/export/', async (ctx, next) => {
    await ctx.render('admin/export/index',{
        username:ctx.session.name,
    });
});

admin.get('*/export/do_export/', async (ctx, next) => {
    let judgements = await ctx.db.Judgement.findAll();
    let teams = await ctx.db.Team.findAll({
        order: [['id','ASC']],
    });
    let judgers = await ctx.db.Judger.findAll({
        order: [['id','ASC']],
    });
    let result = [];
    let teamMap = {};

    let i = 1;
    for (let team of teams) {
        teamMap[team.id] = i;
        result.push({
            x: i,
            y: 0,
            value: team.username
        });
        i++;
    }

    let judgerMap = {};

    i = 1;
    for (let judger of judgers) {
        judgerMap[judger.id] = i;
        result.push({
            x: 0,
            y: i,
            value: judger.username
        });
        i++;
    }
    for (let judgement of judgements) {
        result.push({
            x: teamMap[judgement.teamId],
            y: judgerMap[judgement.judgerId],
            value: judgement.rate,
        });
    }
    let fileName = "export_" + Date.now().toString() + ".xls";
    let filePath = path.join("export", fileName);
    let absoluteFilePath = path.resolve(ctx.cfg.uploadPath, filePath);

    await xls.writeXLS(absoluteFilePath, result, true);
    let fileStat = await fs.stat(absoluteFilePath);

    let fileInfo = await ctx.db.File.create({
        fileName: fileName,
        savePath: filePath,
        uploaderId: ctx.session.id,
        uploaderRole: Roles.admin,
        role: Roles.admin,
        size: fileStat.size,
    });
    ctx.redirect("/admin/file/download/" + fileInfo.id.toString() + "/");
});

admin.login = login;
module.exports = admin;