/**
 * Created by wxy on 16/9/30.
 */
const team = require('koa-router')();

team.get('/', function *(next) {
    this.body="hello";
});
module.exports=team;