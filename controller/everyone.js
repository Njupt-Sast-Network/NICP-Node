/**
 * Created by wxy on 2016/11/6.
 */
const judger = require('koa-router')();
let Roles = require("../router/auth").Roles;
let fs = require("fs-promise");
let path = require("path");

let Router = require('koa-router');
let everyone= new Router();

everyone.get('*/download/:id/',  async (ctx, next) => {
    let fileInfo = await ctx.db.File.find({
        where:{
            id:ctx.params.id,
            role:-1,
        },
    });
    if (fileInfo === null){
        await ctx.render('fail', {
            title: "文件不存在",
            message: "该文件不存在",
        });
        return;
    }
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

module.exports=everyone;