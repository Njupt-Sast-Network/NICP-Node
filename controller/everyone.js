/**
 * Created by wxy on 2016/11/6.
 */
const judger = require('koa-router')();
let Roles = require("../router/auth").Roles;
let fs = require("fs-promise");
let path = require("path");


let everyone= require('koa-router')();

everyone.get('*/download/:id/', function *(next) {
    let fileInfo = yield this.db.File.find({
        where:{
            id:this.params.id,
            role:-1,
        },
    });
    if (fileInfo==null){
        yield this.render('fail', {
            title: "文件不存在",
            message: "该文件不存在",
        });
        return;
    }
    try {
        let filePath = path.resolve(this.cfg.uploadPath, fileInfo.savePath);
        let fd = yield fs.open(filePath, 'r');
        this.response.attachment(fileInfo.fileName);
        this.body = yield fs.readFile(fd);
    } catch (err) {
        if (err.code == 'ENOENT') {
            yield this.render('fail', {
                title: "文件不存在",
                message: "该文件不存在"
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

module.exports=everyone;