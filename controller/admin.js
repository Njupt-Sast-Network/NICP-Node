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

//team
admin.get('*/team/',function *(next) {
    let teamList = yield this.db.Team.findAll();
    yield this.render('admin/team', {
        teamList: teamList,
    });
});
admin.get('*/team/add/', function *(next) {
    yield this.render('admin/team_add');
});
admin.post('*/team/add/', function *(next) {
    yield this.db.Team.create(this.request.fields);
    this.redirect('../');
});



admin.get('*/team/del/:id/', function *(next) {
    let team = yield this.db.Team.findById(this.params.id);
    yield this.render('admin/team_del', {
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
    yield this.render('admin/team_edit', {
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
    yield this.render('team/project',{
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

admin.login = login;
module.exports = admin;