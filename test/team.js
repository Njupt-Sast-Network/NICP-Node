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
        it('choosing remember me should return cookie with age', function (done) {
            request(mock)
                .post('/team/login/')
                .field('username', 'wxy')
                .field('password', passwordHash('123wxy'))
                .field('remember_me', 'on')
                .expect('Set-Cookie',/expires/)
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
        it('should be able to change first author', function (done) {
            agent.post('/team/info/first_author/')
                .type('form')
                .send({
                    name:"wxy",
                    studentID:"B15040000",
                    sex:"male",
                    birthday:"2017-10-03",
                    academy:"计软院",
                    major:"计算机科学与技术",
                    grade:"大二",
                    qualification:"本科",
                    schoolSystem:"四年制",
                    admissionDate:"2017-10-17",
                    forwardingAddress:"南京",
                    telephone:"18350000000"
                })
                .expect(200,{status: "success"})
                .end(done);
        });
        it('wrong first author info should be rejected',function (done) {
            agent.post('/team/info/first_author/')
                .type('form')
                .send({
                    name:"wxy",
                })
                .expect(200)
                .expect(function (res) {
                    let resp = res.body;
                    if(!resp || !resp.status || resp.status!=="error")
                        throw new Error("Server didn't response error")
                })
                .end(done);
        });
        it('should be able to change other author', function (done) {
            agent.post('/team/info/other_author/0/')
                .type('form')
                .send({
                    name:"wxy",
                    studentID:"B15040000",
                    sex:"male",
                    academy:"计软院",
                    major:"计算机科学与技术",
                    age:"18",
                    qualification:"本科",
                    forwardingAddress:"南京",
                })
                .expect(200,{status: "success"})
                .end(done);
        });
        it('wrong other author info should be rejected',function (done) {
            agent.post('/team/info/other_author/0/')
                .type('form')
                .send({
                    name:"wxy",
                })
                .expect(200)
                .expect(function (res) {
                    let resp = res.body;
                    if(!resp || !resp.status || resp.status!=="error")
                        throw new Error("Server didn't response error")
                })
                .end(done);
        });
        it('should be able to change teacher', function (done) {
            agent.post('/team/info/teacher/0/')
                .type('form')
                .send({
                    name:"test",
                    sex:"male",
                    age:"20",
                    jobTitle:"副教授",
                    company:"南邮",
                    telephone:"18350000000"
                })
                .expect(200,{status: "success"})
                .end(done);
        });
        it('wrong teacher info should be rejected',function (done) {
            agent.post('/team/info/teacher/0/')
                .type('form')
                .send({
                    name:"wxy",
                })
                .expect(200)
                .expect(function (res) {
                    let resp = res.body;
                    if(!resp || !resp.status || resp.status!=="error")
                        throw new Error("Server didn't response error")
                })
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
        it('should be able to change project', function (done) {
            agent.post('/team/project/')
                .type('form')
                .send({
                    name:"test",
                    project_category:"nature",
                    subject_category:"test",
                    isSTITP:"true",
                    brief:"teststest"
                })
                .expect(200,{status: "success"})
                .end(done);
        });
        it('wrong  project info should be rejected',function (done) {
            agent.post('/team/project/')
                .type('form')
                .send({
                    name:"test",
                })
                .expect(200)
                .expect(function (res) {
                    let resp = res.body;
                    if(!resp || !resp.status || resp.status!=="error")
                        throw new Error("Server didn't response error")
                })
                .end(done);
        });
    });
    describe('password', function () {
        let agent;
        before(function(done) {
            agent = request.agent(mock);
            agent.post('/team/login/')
                .field('username', 'wxy')
                .field('password', passwordHash('123wxy'))
                .end(done);
        });
        it('/password/ should show password page', function (done) {
            agent.get('/team/password/')
                .expect(200)
                .expect(/修改密码/)
                .expect(/重复新密码/)
                .end(done);
        });
        it('should be able to change password', function (done) {
            agent.post('/team/password/')
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
            agent.post('/team/password/')
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
            agent.post('/team/password/')
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

    describe('file', function () {
        let agent;
        before(function(done) {
            agent = request.agent(mock);
            agent.post('/team/login/')
                .field('username', 'wxy')
                .field('password', passwordHash('123wxy'))
                .end(done);
        });
        it('/file/ should show files', function (done) {
            agent.get('/team/file/')
                .expect(200)
                .expect(/文件上传/)
                .expect(/申报书上传/)
                .expect(/作品简介书上传/)
                .end(done);
        });
        it('should be able to upload report', function (done) {
            agent.post('/team/file/upload/report/')
                .attach("file","./test/test.pdf")
                .expect(200,{status: "success"})
                .end(done);
        });
        it('wrong report should be rejected', function (done) {
            agent.post('/team/file/upload/report/')
                .attach("file","./test/test.wrong_pdf")
                .expect(200, {status: "error", data: "请上传有效的 pdf"})
                .end(done);
        });

        it('wrong type should be rejected', function (done) {
            agent.post('/team/file/upload/wrong_type/')
                .attach("file","./test/test.pdf")
                .expect(200,  {status: "error", data: "不存在该类文件"})
                .end(done);
        });

        it('should be able to upload rfp', function (done) {
            agent.post('/team/file/upload/rfp/')
                .attach("file","./test/test.pdf")
                .expect(200,  {"status": "success"})
                .end(done);
        });

        it('wrong rfp/brief should be rejected', function (done) {
            agent.post('/team/file/upload/rfp/')
                .attach("file","./test/test.wrong_pdf")
                .expect(200, {status: "error", data: "请上传有效的 pdf"})
                .end(done);
        });

        it('wrong type download should be rejected', function (done) {
            agent.get('/team/file/download/wrong_type/')
                .expect(200)
                .expect(/文件类型错误/)
                .expect(/不存在该类文件/)
                .end(done);
        });

        it('should be able to download rfp/brief', function (done) {
            agent.get('/team/file/download/rfp.pdf/')
                .expect(200)
                .end(done);
        });

        it('file should not be downloaded before be uploaded', function (done) {
            agent.get('/team/file/download/brief.pdf/')
                .expect(200)
                .end(done);
        });
    });
});
