/**
 * Created by wxy on 16/9/30.
 */
let Roles = require("../router/auth").Roles;
const fs = require('fs-promise');
const path = require('path');
const exec = require('child-process-promise').exec;
const spawn = require('child-process-promise').spawn;
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
team.get('*/news/', function *(next) {
    let newsList = yield this.db.News.findAll({
        where: {
            role: Roles.team,
        }
    });
    yield this.render('team/news', {
        title: "通知公告",
        name: "通知公告",
        newsList: newsList
    });
    //TODO:阅读量增加可以一次 sql 请求就完成
    for (let news of newsList) {
        yield news.increment('viewCount');
    }
});
team.get('*/info/', function *(next) {
    let infoData = yield this.db.Team.findById(this.session.id);
    yield this.render('team/info', {
        jsonModel: this.jsonModel,
        firstAuthorData: infoData.firstAuthor,
        otherAuthorData: infoData.otherAuthors,
        teacherData: infoData.teachers,
    });
});
team.post('*/info/first_author/', function *(next) {
    let infoData = yield this.db.Team.findById(this.session.id);
    let result = this.jsonModel.validate(this.request.fields, this.jsonModel.first_author);
    if (result === undefined) {
        infoData.set("firstAuthor", this.request.fields);
        infoData.set("firstAuthorId", this.request.fields.studentID);
        yield infoData.save();
        this.body = {status: "success"};
    } else {
        this.body = {status: "error", data: result};
    }

});
team.post('*/info/other_author/:id/', function *(next) {
    let infoData = yield this.db.Team.findById(this.session.id);
    let result = this.jsonModel.validate(this.request.fields, this.jsonModel.other_author);
    if (result === undefined) {
        let otherAuthorsData = infoData.otherAuthors;
        otherAuthorsData[this.params.id] = this.request.fields;
        infoData.set("otherAuthors", otherAuthorsData);
        yield infoData.save();
        this.body = {status: "success"};
    } else {
        this.body = {status: "error", data: result};
    }

});
team.post('*/info/teacher/:id/', function *(next) {
    let infoData = yield this.db.Team.findById(this.session.id);
    let result = this.jsonModel.validate(this.request.fields, this.jsonModel.teacher);
    if (result === undefined) {
        let teacherData = infoData.teachers;
        teacherData[this.params.id] = this.request.fields;
        infoData.set("teachers", teacherData);
        yield infoData.save();
        this.body = {status: "success"};
    } else {
        this.body = {status: "error", data: result};
    }

});
team.get('*/project/', function *(next) {
    let infoData = yield this.db.Team.findById(this.session.id);
    yield this.render('team/project', {
        jsonModel: this.jsonModel,
        projectData: infoData.project,
    });
});
team.post('*/project/', function *(next) {
    let infoData = yield this.db.Team.findById(this.session.id);
    let result = this.jsonModel.validate(this.request.fields, this.jsonModel.project);
    if (result === undefined) {
        infoData.set("project", this.request.fields);
        yield infoData.save();
        this.body = {status: "success"};
    } else {
        this.body = {status: "error", data: result};
    }

});

team.get('*/file/', function *(next) {
    yield this.render('team/file');
});

team.post('*/file/upload/report/', function *(next) {
    if ("file" in this.request.fields) {
        let fileName = this.session.id.toString() + "_report.pdf";
        let filePath = path.join("./team/", fileName);
        let absoluteFilePath = path.join(this.cfg.uploadPath, filePath);

        yield fs.copy(this.request.fields.file[0].path,
            absoluteFilePath,
            {clobber: true}
        );
        yield this.db.File.create({
            fileName: fileName,
            savePath: filePath,
            size: this.request.fields.file[0].size,
            uploaderRole: Roles.team,
            uploaderId: this.session.id,
            role:  Roles.team,
        });

        //第一页切掉
        let cuttedFileName = this.session.id.toString() + "_report_cutted.pdf";
        let cuttedFilePath = path.join("./team/", cuttedFileName);
        let absoluteCuttedFilePath = path.join(this.cfg.uploadPath, cuttedFilePath);
        let result = yield spawn(
            'pdftk',
            [absoluteFilePath, 'cat', '2-end', 'output', absoluteCuttedFilePath],
            {capture: ['stdout', 'stderr']}
        );
        let cuttedFileStat = yield fs.stat(absoluteCuttedFilePath);
        yield this.db.File.create({
            fileName: cuttedFileName,
            savePath: cuttedFilePath,
            size: cuttedFileStat.size,
            uploaderRole: Roles.team,
            uploaderId: this.session.id,
            role:  Roles.team,
        });
        this.body = {status: "success"};
    } else {
        this.body = {status: "error", data: "未发现文件"};
    }
});
team.post('*/file/upload/:name/', function *(next) {
    const fileNameList = ['brief', 'report', 'rfp'];
    if (fileNameList.indexOf(this.params.name) == -1) {
        yield this.render('fail', {
            title: "文件类型错误",
            message: "不存在该类文件"
        });
        return;
    }

    if ("file" in this.request.fields) {
        let fileName = this.session.id.toString() + "_" + this.params.name + ".pdf";
        let filePath = path.join("./team/", fileName);
        let absoluteFilePath = path.join(this.cfg.uploadPath, filePath);


        yield fs.copy(this.request.fields.file[0].path,
            absoluteFilePath,
            {clobber: true}
        );
        yield this.db.File.create({
            fileName: fileName,
            savePath: filePath,
            size: this.request.fields.file[0].size,
            uploaderRole: Roles.team,
            uploaderId: this.session.id,
            role:  Roles.team,
        });
        this.body = {status: "success"};
    } else {
        this.body = {status: "error", data: "未发现文件"};
    }
});

team.get('*/file/download/:name', function *(next) {
    const fileNameList = ['brief.pdf', 'report.pdf', 'rfp.pdf'];
    if (fileNameList.indexOf(this.params.name) == -1) {
        yield this.render('fail', {
            title: "文件类型错误",
            message: "不存在该类文件"
        });
        return;
    }

    let fileName = this.session.id.toString() + "_" + this.params.name;
    let fileInfo = yield this.db.File.findOne({
        where:{
            fileName:fileName,
            uploaderRole: Roles.team,
            uploaderId: this.session.id,
            role:  Roles.team,
        }
    });
    if(fileInfo === null){
        yield this.render('fail', {
            title: "未上传该文件",
            message: "相关文件未上传"
        });
        return;
    }

    try {
        let filePath = path.join(this.cfg.uploadPath,fileInfo.savePath);
        let fd = yield fs.open(filePath, 'r');
        this.body = yield fs.readFile(fd);
    } catch (err) {
        if (err.code == 'ENOENT') {
            yield this.render('fail', {
                title: "未上传该文件",
                message: "相关文件未上传"
            });
        } else {

            yield this.render('fail', {
                title: "未知错误",
                message: "请通知管理人员"
            });
        }
    }

});
team.login = login;
module.exports = team;