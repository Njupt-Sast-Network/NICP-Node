/**
 * Created by wxy on 16/9/30.
 */
const judger = require('koa-router')();
let Roles = require("../router/auth").Roles;
let fs = require("fs-promise");
let path = require("path");

// Login
let login = require('koa-router')();
login.get('*/', function *(next) {
    yield this.render('login', {
        title: this.cfg.siteName + "评委登陆",
        name: this.cfg.siteName + "评委登陆",
    });
});

login.post('*/', function *(next) {
    let username = this.request.fields.username.toString();
    let password = this.request.fields.password.toString();
    console.log(username, password);
    let userInfo = yield this.db.Judger.findOne({
        where: {
            username: username,
            password: password,
        }
    });
    if (userInfo.username === username) {
        this.session.id = userInfo.id;
        this.session.name = userInfo.username;
        this.session.role = Roles.judger;
    }
});

judger.get('*/news/', function *(next) {
    let newsList = yield this.db.News.findAll({
        where: {
            role: Roles.judger,
        }
    });
    yield this.render('judger/news', {
        title: "通知公告",
        name: "通知公告",
        newsList: newsList
    });
    //TODO:阅读量增加可以一次 sql 请求就完成
    for (let news of newsList) {
        yield news.increment('viewCount');
    }
});

judger.get('*/rate/', function *(next) {
    let teamList = yield this.db.Team.findAll();
    yield this.render('judger/rate',{
        teamList:teamList
    });
});

judger.post('*/rate/save/:id/', function *(next) {
    let rate=Number.parseInt(this.request.fields.rate);

    if(Number.isInteger(rate)===false || rate<1 || rate > 10){
        this.body={status:"error",data:"评分必须是整数并且在1到10之间"};
        return;
    }
    let teamInfo = yield this.db.Team.findById(this.params.id);
    teamInfo.addJudgers(this.session.id,{rate : this.request.fields.rate});
    this.body={status:"success"};
});


judger.get('*/rate/download/:id/', function *(next) {

    let fileName = this.params.id + '_report_cutted.pdf' ;
    let fileInfo = yield this.db.File.findOne({
        where:{
            fileName:fileName,
            uploaderRole: Roles.team,
            uploaderId: this.params.id,
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
        this.response.attachment(fileInfo.fileName);
        this.body = yield fs.readFile(fd);
    } catch (err) {
        if (err.code == 'ENOENT') {
            yield this.render('fail', {
                title: "未上传该文件",
                message: "相关文件未上传"
            });
        } else {
            console.error(err);
            yield this.render('fail', {
                title: "未知错误",
                message: "请通知管理人员"
            });
        }
    }

});

judger.login = login;
module.exports=judger;