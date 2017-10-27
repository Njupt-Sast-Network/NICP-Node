/**
 * Created by wxy on 16/9/30.
 */
let Roles = require("../router/auth").Roles;
const fs = require('fs-promise');
const path = require('path');
const exec = require('child-process-promise').exec;
const spawn = require('child-process-promise').spawn;
// Login
let Router = require('koa-router');
let login = new Router();

login.get('*/',async (ctx, next) => {
    await ctx.render('team/index/homePage');
});

login.post('*/', async (ctx, next) => {
    let username = ctx.request.fields.username.toString();
    let password = ctx.request.fields.password.toString();
    let rememberMe = (ctx.request.fields.remember_me && ctx.request.fields.remember_me.toString() === 'on');
    let userInfo = await ctx.db.Team.findOne({
        where: {
            username: username,
            password: password,
        }
    });
    if (userInfo && "username" in userInfo && userInfo.username === username) {
        ctx.session.id = userInfo.id;
        ctx.session.name = userInfo.username;
        ctx.session.role = Roles.team;
        if (rememberMe) {
            ctx.session.cookie.maxage = 7 * 24 * 60 * 60 * 1000;//一周
        } else {
            ctx.session.cookie.maxage = null;//关闭浏览器马上失效
        }
        ctx.body = {status: "success"};
    } else {
        ctx.body = {status: "error", data: "用户名或密码错误"};
    }
});

//Team
let team = new Router();
team.get('*/password/', async (ctx, next) => {
    await ctx.render('team/password', {
        username: ctx.session.name,
    });
});

team.post('*/password/', async (ctx, next) => {
    let oldPassword = ctx.request.fields.old_password.toString();
    let newPassword = ctx.request.fields.new_password.toString();
    if (newPassword !== ctx.request.fields.again_password.toString()) {
        ctx.body = {status: "error", data: "两次新密码不符"};
        return;
    }
    let userInfo = await ctx.db.Team.findById(ctx.session.id);
    if (userInfo.password !== oldPassword) {
        ctx.body = {status: "error", data: "旧密码错误"};
        return;
    }

    userInfo.set('password', newPassword);
    userInfo.save();
    ctx.body = {status: "success", data: "修改成功"};
});
team.get('*/news/', async (ctx, next) => {
    let newsList = await ctx.db.News.findAll({
        where: {
            role: Roles.team,
        },
        order: [['id','ASC']],
    });
    await ctx.render('team/news', {
        username: ctx.session.name,
        title: "通知公告",
        name: "通知公告",
        newsList: newsList
    });
    //TODO:阅读量增加可以一次 sql 请求就完成
    for (let news of newsList) {
        await news.increment('viewCount');
    }
});
team.get('*/info/', async (ctx, next) => {
    let infoData = await ctx.db.Team.findById(ctx.session.id);
    await ctx.render('team/info', {
        username: ctx.session.name,
        jsonModel: ctx.jsonModel,
        firstAuthorData: infoData.firstAuthor,
        otherAuthorData: infoData.otherAuthors,
        teacherData: infoData.teachers,
    });
});
team.post('*/info/first_author/', async (ctx, next) => {
    let infoData = await ctx.db.Team.findById(ctx.session.id);
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
team.post('*/info/other_author/:id/', async (ctx, next) => {
    let infoData = await ctx.db.Team.findById(ctx.session.id);
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
team.post('*/info/teacher/:id/', async (ctx, next) => {
    let infoData = await ctx.db.Team.findById(ctx.session.id);
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
team.get('*/project/', async (ctx, next) => {
    let infoData = await ctx.db.Team.findById(ctx.session.id);
    await ctx.render('team/project', {
        username: ctx.session.name,
        jsonModel: ctx.jsonModel,
        projectData: infoData.project,
    });
});
team.post('*/project/', async (ctx, next) => {
    let infoData = await ctx.db.Team.findById(ctx.session.id);
    let result = ctx.jsonModel.validate(ctx.request.fields, ctx.jsonModel.project);
    if (result === undefined) {
        infoData.set("project", ctx.request.fields);
        await infoData.save();
        ctx.body = {status: "success"};
    } else {
        ctx.body = {status: "error", data: result};
    }

});

team.get('*/file/', async (ctx, next) => {
    await ctx.render('team/file', {
        username: ctx.session.name,
    });
});

team.post('*/file/upload/report/', async (ctx, next) => {
    let file = ctx.request.fields.file;
    if (file &&
        file[0] &&
        'name' in file[0] &&
        path.extname(file[0].name) === '.pdf'
    ) {
        let fileName = ctx.session.id.toString() + "_report.pdf";
        let filePath = path.join("./team/", fileName);
        let absoluteFilePath = path.join(ctx.cfg.uploadPath, filePath);

        await fs.copy(file[0].path,
            absoluteFilePath,
            {clobber: true}
        );
        await ctx.db.File.upsert({
            fileName: fileName,
            savePath: filePath,
            size: file[0].size,
            uploaderRole: Roles.team,
            uploaderId: ctx.session.id,
            role: Roles.team,
        });

        //第一页切掉
        let cuttedFileName = ctx.session.id.toString() + "_report_cutted.pdf";
        let cuttedFilePath = path.join("./team/", cuttedFileName);
        let absoluteCuttedFilePath = path.join(ctx.cfg.uploadPath, cuttedFilePath);
        let result = await spawn(
            'pdftk',
            [absoluteFilePath, 'cat', '2-end', 'output', absoluteCuttedFilePath],
            {capture: ['stdout', 'stderr']}
        );
        let cuttedFileStat = await fs.stat(absoluteCuttedFilePath);
        await ctx.db.File.upsert({
            fileName: cuttedFileName,
            savePath: cuttedFilePath,
            size: cuttedFileStat.size,
            uploaderRole: Roles.team,
            uploaderId: ctx.session.id,
            role: Roles.team,
        });
        ctx.body = {status: "success"};
    } else {
        ctx.body = {status: "error", data: "请上传有效的 pdf"};
    }
});
team.post('*/file/upload/:name/', async (ctx, next) => {
    const fileNameList = ['brief', 'report', 'rfp'];
    if (fileNameList.indexOf(ctx.params.name) === -1) {
        ctx.body = {status: "error", data: "不存在该类文件"};
        return;
    }

    let file = ctx.request.fields.file;
    if (file &&
        file[0] &&
        'name' in file[0] &&
        path.extname(file[0].name) === '.pdf'
    ) {
        let fileName = ctx.session.id.toString() + "_" + ctx.params.name + ".pdf";
        let filePath = path.join("./team/", fileName);
        let absoluteFilePath = path.join(ctx.cfg.uploadPath, filePath);


        await fs.copy(ctx.request.fields.file[0].path,
            absoluteFilePath,
            {clobber: true}
        );
        await ctx.db.File.upsert({
            fileName: fileName,
            savePath: filePath,
            size: ctx.request.fields.file[0].size,
            uploaderRole: Roles.team,
            uploaderId: ctx.session.id,
            role: Roles.team,
        });
        ctx.body = {status: "success"};
    } else {
        ctx.body = {status: "error", data: "请上传有效的 pdf"};
    }
});

team.get('*/file/download/:name', async (ctx, next) => {
    const fileNameList = ['brief.pdf', 'report.pdf', 'rfp.pdf'];
    if (fileNameList.indexOf(ctx.params.name) === -1) {
        await ctx.render('fail', {
            title: "文件类型错误",
            message: "不存在该类文件"
        });
        return;
    }

    let fileName = ctx.session.id.toString() + "_" + ctx.params.name;
    let fileInfo = await ctx.db.File.findOne({
        where: {
            fileName: fileName,
            uploaderRole: Roles.team,
            uploaderId: ctx.session.id,
            role: Roles.team,
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

            await ctx.render('fail', {
                title: "未知错误",
                message: "请通知管理人员"
            });
        }
    }

});

// 接收未匹配的路由，务必放在最后
team.all('*/', async (ctx, next) => {
    await ctx.redirect("./news/")
});

team.login = login;
module.exports = team;