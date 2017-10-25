const request = require("supertest");
const chai = require('chai');
const {passwordHash} = require('../util/crypto');
const app = require('../app');

describe('Judger', function () {
    let mock;
    before(function(done) {
        mock = app.listen(3218,done);
    });
    after(function(done) {
        mock.close(function () {
            done();
        });

    });

    describe('index', function () {
        it('visit index should go to login', function (done) {
            request(mock)
                .get('/judger/')
                .expect('Location', '/judger/login/')
                .expect(302,done)
        });
    });

    describe('login', function () {
        it('/login/ should respond with 200', function (done) {
            request(mock)
                .get('/judger/login/')
                .expect(200,done)
        });
        it('correct username and password should login successfully', function (done) {
            request(mock)
                .post('/judger/login/')
                .field('username', 'wxy')
                .field('password', passwordHash('123wxy'))
                .expect(200,{status: "success"},done)
        });
        it('choosing remember me should return cookie with age', function (done) {
            request(mock)
                .post('/judger/login/')
                .field('username', 'wxy')
                .field('password', passwordHash('123wxy'))
                .field('remember_me', 'on')
                .expect('Set-Cookie',/expires/)
                .expect(200,{status: "success"},done)
        });
        it('wrong username should fail to login', function (done) {
            request(mock)
                .post('/judger/login/')
                .field('username', 'wxy1')
                .field('password', passwordHash('123wxy'))
                .expect(200,{status: "error", data: "用户名或密码错误"},done)
        });
        it('wrong password should fail to login', function (done) {
            request(mock)
                .post('/judger/login/')
                .field('username', 'wxy')
                .field('password', passwordHash('1'))
                .expect(200,{status: "error", data: "用户名或密码错误"},done)
        });
    });

    describe('news', function () {
        let agent;
        before(function(done) {
            agent = request.agent(mock);
            agent.post('/judger/login/')
                .field('username', 'wxy')
                .field('password', passwordHash('123wxy'))
                .end(done);
        });
        it('/news/ should show news', function (done) {
            agent.get('/judger/news/')
                .expect(/test123123/) // demo title is test123123
                .expect(/testtesttest/) // demo content is testtesttest
                .expect(200)
                .end(done);
        });
    });

    describe('password', function () {
        let agent;
        before(function(done) {
            agent = request.agent(mock);
            agent.post('/judger/login/')
                .field('username', 'wxy')
                .field('password', passwordHash('123wxy'))
                .end(done);
        });
        it('/password/ should show password page', function (done) {
            agent.get('/judger/password/')
                .expect(200)
                .expect(/修改密码/)
                .expect(/重复新密码/)
                .end(done);
        });
        it('should be able to change password', function (done) {
            agent.post('/judger/password/')
                .type('form')
                .send({
                    old_password:passwordHash("123wxy"),
                    new_password:passwordHash("123wxy"),
                    again_password:passwordHash("123wxy"),
                })
                .expect(200,{status: "success", data: "修改成功"})
                .end(done);
        });

        it('wrong old password should be rejected', function (done) {
            agent.post('/judger/password/')
                .type('form')
                .send({
                    old_password:passwordHash("123"),
                    new_password:passwordHash("123wxy"),
                    again_password:passwordHash("123wxy"),
                })
                .expect(200,{status: "error", data: "旧密码错误"})
                .end(done);
        });

        it('mismatched new password should be rejected', function (done) {
            agent.post('/judger/password/')
                .type('form')
                .send({
                    old_password:passwordHash("123wxy"),
                    new_password:passwordHash("123wxy"),
                    again_password:passwordHash("123"),
                })
                .expect(200,{status: "error", data: "两次新密码不符"})
                .end(done);
        });
    });
    describe('rate', function () {
        let agent;
        before(function(done) {
            agent = request.agent(mock);
            agent.post('/judger/login/')
                .field('username', 'wxy')
                .field('password', passwordHash('123wxy'))
                .end(done);
        });
        it('/rate/ should show rate', function (done) {
            agent.get('/judger/rate/')
                .expect(/评分管理/)
                .expect(/研究报告下载/)
                .expect(200)
                .end(done);
        });
        it('should be able to see team info', function (done) {
            agent.get('/judger/rate/show_project/1/')
                .expect(/队伍申报书查阅/)
                .expect(/队伍申报书/)
                .expect(/作品简介/)
                .expect(200)
                .end(done);
        });
        it('should be able to rate team', function (done) {
            agent.post('/judger/rate/save/1/')
                .field('rate','1')
                .expect(200,{"status":"success"})
                .end(done);
        });

        it('wrong rate should be rejected', function (done) {
            agent.post('/judger/rate/save/1/')
                .field('rate','11')
                .expect(200,{status: "error", data: "评分必须是整数并且在1到10之间"})
                .end(done);
        });

        it('should be able to download document', function (done) {
            agent.get('/judger/rate/download/1/')
                .expect(200)
                .end(done);
        });

        it('wrong document id should be rejected', function (done) {
            agent.get('/judger/rate/download/10000/')
                .expect(200)
                .expect(/未上传该文件/)
                .expect(/相关文件未上传/)
                .end(done);
        });
    });
});