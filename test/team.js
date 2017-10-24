/**
 * Created by wxy on 2016/11/11.
 */
const request = require("supertest");
const chai = require('chai');
const {passwordHash} = require('../util/crypto');
const app = require('../app');

describe('Team', function () {
    let mock;
    before(function(done) {
        mock = app.listen(3218,done);
    });
    after(function(done) {
        mock.close(function () {
            app.context.db._sequelize.close();
            done();
        });

    });

    describe('index', function () {
        it('visit index should go to login', function (done) {
            request(mock)
                .get('/team/')
                .expect('Location', '/team/login/')
                .expect(302,done)
        });
    });

    describe('login', function () {
        it('/login/ should respond with 200', function (done) {
            request(mock)
                .get('/team/login/')
                .expect(200,done)
        });
        it('correct username and password should login successfully', function (done) {
            request(mock)
                .post('/team/login/')
                .field('username', 'wxy')
                .field('password', passwordHash('123wxy'))
                .expect(200,{status: "success"},done)
        });
        it('wrong username should fail to login', function (done) {
            request(mock)
                .post('/team/login/')
                .field('username', 'wxy1')
                .field('password', passwordHash('123wxy'))
                .expect(200,{status: "error", data: "用户名或密码错误"},done)
        });
        it('wrong password should fail to login', function (done) {
            request(mock)
                .post('/team/login/')
                .field('username', 'wxy')
                .field('password', passwordHash('1'))
                .expect(200,{status: "error", data: "用户名或密码错误"},done)
        });
    });

    describe('news', function () {
        let agent;
        before(function(done) {
            agent = request.agent(mock);
            agent.post('/team/login/')
                .field('username', 'wxy')
                .field('password', passwordHash('123wxy'))
                .end(done);
        });
        it('/news/ should show news', function (done) {
            agent.get('/team/news/')
                .expect(/test123123/) // demo title is test123123
                .expect(/testtesttest/) // demo content is testtesttest
                .expect(200)
                .end(done);
        });
    });
    describe('info', function () {
        let agent;
        before(function(done) {
            agent = request.agent(mock);
            agent.post('/team/login/')
                .field('username', 'wxy')
                .field('password', passwordHash('123wxy'))
                .end(done);
        });
        it('/info/ should show info', function (done) {
            agent.get('/team/info/')
                .expect(200)
                .expect(/队伍信息/)
                .expect(/第一作者信息/)
                .expect(/第二指导老师信息/)
                .end(done);
        });
    });
    describe('project', function () {
        let agent;
        before(function(done) {
            agent = request.agent(mock);
            agent.post('/team/login/')
                .field('username', 'wxy')
                .field('password', passwordHash('123wxy'))
                .end(done);
        });
        it('/project/ should show project', function (done) {
            agent.get('/team/project/')
                .expect(200)
                .expect(/项目信息/)
                .expect(/作品名称/)
                .expect(/作品简介/)
                .end(done);
        });
    });

});