const koa = require('koa');
const app = koa();
const router = require("./router/router.js");
const serve = require('koa-serve');

const logger = require('koa-logger');
const body = require('koa-better-body');

const fs = require('fs-promise');
const path = require('path');

// Database
const db = require("./model");
app.context.db = db;
const jsonModel = require("./model/json");
app.context.jsonModel = jsonModel;

// Config
const config = require('./config');
app.keys = config.keys;
app.context.cfg = config;

if (config.debug){
    app.use(logger());
}
app.use(serve('asset'));
app.use(body());
app.use(router.routes());
app.use(router.allowedMethods());

//创建 upload 目录结构
fs.ensureDir(path.join(config.uploadPath,'team'));
fs.ensureDir(path.join(config.uploadPath,'deleted'));
fs.ensureDir(path.join(config.uploadPath,'export'));

module.exports=app;

