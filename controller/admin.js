/**
 * Created by wxy on 16/9/30.
 */
let Roles = require("../router/auth").Roles;
// Login
let login = require('koa-router')();
const fs = require('fs-promise');
const path = require('path');
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
    yield this.render('admin/news/index', {
        newsList: newsList,
        roles:Roles,
    });
});
admin.get('*/news/add/', function *(next) {
    yield this.render('admin/news/add',{
        roles: Roles,
    });
});
admin.post('*/news/add/', function *(next) {
    yield this.db.News.create(this.request.fields);
    this.redirect('../');
});

admin.get('*/news/edit/:id/', function *(next) {
    let news = yield this.db.News.findById(this.params.id);
    yield this.render('admin/news/edit', {
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
    yield this.render('admin/news/del', {
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

//team
admin.get('*/team/',function *(next) {
    let teamList = yield this.db.Team.findAll();
    yield this.render('admin/team/index', {
        teamList: teamList,
    });
});
admin.get('*/team/add/', function *(next) {
    yield this.render('admin/team/add');
});
admin.post('*/team/add/', function *(next) {
    yield this.db.Team.create(this.request.fields);
    this.redirect('../');
});



admin.get('*/team/del/:id/', function *(next) {
    let team = yield this.db.Team.findById(this.params.id);
    yield this.render('admin/team/del', {
        team: team,
    });
});
admin.post('*/team/del/:id/', function *(next) {
    yield this.db.Team.destroy({
        where: {
            id: this.params.id,
        }
    });
    this.redirect('../../');
});

admin.get('*/team/edit/:team_id/', function *(next) {
    let team = yield this.db.Team.findById(this.params.team_id);
    yield this.render('admin/team/edit', {
        jsonModel:this.jsonModel,
        firstAuthorData:team.firstAuthor,
        otherAuthorData:team.otherAuthors,
        teacherData:team.teachers,
        team: team,
    });
});

admin.post('*/team/edit/:team_id/first_author/', function *(next) {
    let infoData=yield this.db.Team.findById(this.params.team_id);
    let result = this.jsonModel.validate(this.request.fields,this.jsonModel.first_author);
    if(result===undefined){
        infoData.set("firstAuthor",this.request.fields);
        infoData.set("firstAuthorId",this.request.fields.studentID);
        yield infoData.save();
        this.body={status:"success"};
    }else{
        this.body={status:"error",data:result};
    }

});
admin.post('*/team/edit/:team_id/other_author/:id/', function *(next) {
    let infoData=yield this.db.Team.findById(this.params.team_id);
    let result = this.jsonModel.validate(this.request.fields,this.jsonModel.other_author);
    if(result===undefined) {
        let otherAuthorsData=infoData.otherAuthors;
        otherAuthorsData[this.params.id]=this.request.fields;
        infoData.set("otherAuthors",otherAuthorsData);
        yield infoData.save();
        this.body={status:"success"};
    }else{
        this.body={status:"error",data:result};
    }

});
admin.post('*/team/edit/:team_id/teacher/:id/', function *(next) {
    let infoData=yield this.db.Team.findById(this.params.team_id);
    let result = this.jsonModel.validate(this.request.fields,this.jsonModel.teacher);
    if(result===undefined) {
        let teacherData=infoData.teachers;
        teacherData[this.params.id]=this.request.fields;
        infoData.set("teachers",teacherData);
        yield infoData.save();
        this.body={status:"success"};
    }else{
        this.body={status:"error",data:result};
    }

});

admin.get('*/team/edit_project/:id/', function *(next) {
    let infoData=yield this.db.Team.findById(this.params.id);
    yield this.render('admin/team/edit_project',{
        jsonModel:this.jsonModel,
        projectData:infoData.project,
    });
});
admin.post('*/team/edit_project/:id/', function *(next) {
    let infoData=yield this.db.Team.findById(this.params.id);
    let result = this.jsonModel.validate(this.request.fields,this.jsonModel.project);
    if(result===undefined){
        infoData.set("project",this.request.fields);
        yield infoData.save();
        this.body={status:"success"};
    }else{
        this.body={status:"error",data:result};
    }

});

//file
admin.get('*/file/',function *(next) {
    let fileList = yield this.db.File.findAll();
    yield this.render('admin/file/index', {
        fileList: fileList,
    });
});
admin.get('*/file/add/',function *(next) {
    yield this.render('admin/file/add',{
        roles:Roles
    });
});
admin.post('*/file/add/',function *(next) {
    if ("file" in this.request.fields) {
        let fileName =  this.request.fields.fileName;
        let filePath = path.join("./", this.request.fields.savePath);
        let absoluteFilePath = path.join(this.cfg.uploadPath, filePath);

        yield fs.copy(this.request.fields.file[0].path,
            absoluteFilePath,
            {clobber: true}
        );

        yield this.db.File.create({
            fileName: fileName,
            savePath: filePath,
            size: this.request.fields.file[0].size,
            uploaderRole: Roles.admin,
            uploaderId: this.session.id,
            role:  this.request.fields.role,
        });
        this.body = {status: "success"};
    } else {
        this.body = {status: "error", data: "未发现文件"};
    }
});

admin.get('*/file/del/:id/',function *(next) {
    let fileInfo = yield this.db.File.findById(this.params.id);
    yield this.render('admin/file/del', {
        file: fileInfo
    });
});
admin.post('*/file/del/:id/',function *(next) {
    let fileInfo = yield this.db.File.findById(this.params.id);
    let filePath =  path.resolve(this.cfg.uploadPath,fileInfo.savePath);
    let newFilePath = path.join(this.cfg.uploadPath,"/deleted/",fileInfo.fileName);
    yield fs.rename(filePath,newFilePath);
    yield this.db.File.destroy({
        where: {
            id: this.params.id,
        }
    });
    this.redirect('../../');
});

admin.get('*/file/download/:id/',function *(next) {
    let fileInfo = yield this.db.File.findById(this.params.id);
    try{
        let filePath = path.resolve(this.cfg.uploadPath,fileInfo.savePath);
        let fd = yield fs.open(filePath,'r');
        this.response.attachment(fileInfo.fileName);
        this.body = yield fs.readFile(fd);
    }catch (err) {
        if(err.code=='ENOENT'){
            yield this.render('fail',{
                title:"文件不存在",
                message:"该文件不存在"
            });
        }else{
            console.error(err);
            yield this.render('fail',{
                title:"未知错误",
                message:"请通知管理人员"
            });
        }
    }
});

//team
admin.get('*/judger/',function *(next) {
    let judgerList = yield this.db.Judger.findAll();
    yield this.render('admin/judger/index', {
        judgerList: judgerList,
    });
});
admin.get('*/judger/add/', function *(next) {
    yield this.render('admin/judger/add');
});

admin.post('*/judger/add/', function *(next) {
    yield this.db.Judger.create(this.request.fields);
    this.redirect('../');
});


admin.get('*/judger/del/:id/', function *(next) {
    let judger = yield this.db.Judger.findById(this.params.id);
    yield this.render('admin/judger/del', {
        judger: judger,
    });
});
admin.post('*/judger/del/:id/', function *(next) {
    yield this.db.Judger.destroy({
        where: {
            id: this.params.id,
        }
    });
    this.redirect('../../');
});

admin.get('*/judger/edit/:id/', function *(next) {
    let judger= yield this.db.Judger.findById(this.params.id);
    yield this.render('admin/judger/edit', {
        judger:judger,
    });
});
admin.post('*/judger/edit/:id/', function *(next) {
    yield this.db.Judger.update(this.request.fields, {
        where: {
            id: this.params.id,
        }
    });
    this.redirect('../../');
});
admin.login = login;
module.exports = admin;