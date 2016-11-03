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
    yield this.render('team/index/homePage');
});

login.post('*/', function *(next) {
    let username = this.request.fields.username.toString();
    let password = this.request.fields.password.toString();
    let rememberMe = (this.request.fields.remember_me && this.request.fields.remember_me.toString() === 'on');
    let userInfo = yield this.db.Team.findOne({
        where: {
            username: username,
            password: password,
        }
    });
    if (userInfo && "username" in userInfo && userInfo.username === username) {
        this.session.id = userInfo.id;
        this.session.name = userInfo.username;
        this.session.role = Roles.team;
        if (rememberMe) {
            this.session.cookie.maxage = 7 * 24 * 60 * 60 * 1000;//一周
        } else {
            this.session.cookie.maxage = null;//关闭浏览器马上失效
        }
        this.body = {status: "success"};
    } else {
        this.body = {status: "error", data: "用户名或密码错误"};
    }
});

//Team
let team = require('koa-router')();
// team.get('*/', function *(next) {
//     yield this.render('team/news');
// });
team.get('*/password/', function *(next) {
    yield this.render('team/password', {
        username: this.session.name,
    });
});

team.post('*/password/', function *(next) {
    let oldPassword = this.request.fields.old_password.toString();
    let newPassword = this.request.fields.new_password.toString();
    if (newPassword != this.request.fields.again_password.toString()) {
        this.body = {status: "error", data: "两次新密码不符"};
        return;
    }
    let userInfo = yield this.db.Team.findById(this.session.id);
    if (userInfo.password != oldPassword) {
        this.body = {status: "error", data: "旧密码错误"};
        return;
    }

    userInfo.set('password', newPassword);
    userInfo.save();
    this.body = {status: "success", data: "修改成功"};
});
team.get('*/news/', function *(next) {
    let newsList = yield this.db.News.findAll({
        where: {
            role: Roles.team,
        }
    });
    yield this.render('team/news', {
        username: this.session.name,
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
        username: this.session.name,
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
        username: this.session.name,
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
    yield this.render('team/file', {
        username: this.session.name,
    });
});

team.post('*/file/upload/report/', function *(next) {
    let file = this.request.fields.file;
    console.log(path.extname(file[0].name));
    if (file &&
        file[0] &&
        'name' in file[0] &&
        path.extname(file[0].name) === '.pdf'
    ) {
        let fileName = this.session.id.toString() + "_report.pdf";
        let filePath = path.join("./team/", fileName);
        let absoluteFilePath = path.join(this.cfg.uploadPath, filePath);

        yield fs.copy(file[0].path,
            absoluteFilePath,
            {clobber: true}
        );
        yield this.db.File.upsert({
            fileName: fileName,
            savePath: filePath,
            size: file[0].size,
            uploaderRole: Roles.team,
            uploaderId: this.session.id,
            role: Roles.team,
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
        yield this.db.File.upsert({
            fileName: cuttedFileName,
            savePath: cuttedFilePath,
            size: cuttedFileStat.size,
            uploaderRole: Roles.team,
            uploaderId: this.session.id,
            role: Roles.team,
        });
        this.body = {status: "success"};
    } else {
        this.body = {status: "error", data: "请上传有效的 pdf"};
    }
});
team.post('*/file/upload/:name/', function *(next) {
    const fileNameList = ['brief', 'report', 'rfp'];
    if (fileNameList.indexOf(this.params.name) == -1) {
        this.body = {status: "error", data: "不存在该类文件"};
        return;
    }

    let file = this.request.fields.file;
    if (file &&
        file[0] &&
        'name' in file[0] &&
        path.extname(file[0].name) === '.pdf'
    ) {
        let fileName = this.session.id.toString() + "_" + this.params.name + ".pdf";
        let filePath = path.join("./team/", fileName);
        let absoluteFilePath = path.join(this.cfg.uploadPath, filePath);


        yield fs.copy(this.request.fields.file[0].path,
            absoluteFilePath,
            {clobber: true}
        );
        yield this.db.File.upsert({
            fileName: fileName,
            savePath: filePath,
            size: this.request.fields.file[0].size,
            uploaderRole: Roles.team,
            uploaderId: this.session.id,
            role: Roles.team,
        });
        this.body = {status: "success"};
    } else {
        this.body = {status: "error", data: "请上传有效的 pdf"};
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
        where: {
            fileName: fileName,
            uploaderRole: Roles.team,
            uploaderId: this.session.id,
            role: Roles.team,
        }
    });
    if (fileInfo === null) {
        yield this.render('fail', {
            title: "未上传该文件",
            message: "相关文件未上传"
        });
        return;
    }

    try {
        let filePath = path.join(this.cfg.uploadPath, fileInfo.savePath);
        let fd = yield fs.open(filePath, 'r');
        this.response.attachment(fileInfo.fileName);
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