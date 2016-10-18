/**
 * Created by wxy on 16/9/30.
 */
let Roles = require("../router/auth").Roles;

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
        where:{
            role:Roles.team,
        }
    });
    yield this.render('team/news',{
        title: "通知公告",
        name: "通知公告",
        newsList:newsList
    });
    //TODO:阅读量增加可以一次 sql 请求就完成
    for (let news of newsList) {
        yield news.increment('viewCount');
    }
});
team.get('*/info/', function *(next) {
    let infoData=yield this.db.Team.findById(this.session.id);
    yield this.render('team/info',{
        jsonModel:this.jsonModel,
        firstAuthorData:infoData.firstAuthor,
        otherAuthorData:infoData.otherAuthors,
        teacherData:infoData.teachers,
    });
});
team.post('*/info/first_author/', function *(next) {
    let infoData=yield this.db.Team.findById(this.session.id);
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
team.post('*/info/other_author/:id/', function *(next) {
    let infoData=yield this.db.Team.findById(this.session.id);
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
team.post('*/info/teacher/:id/', function *(next) {
    let infoData=yield this.db.Team.findById(this.session.id);
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

team.login = login;
module.exports = team;