/**
 * Created by wxy on 2016/11/11.
 */
const request = require("supertest");
const chai = require('chai');


describe.skip('Disable Team', function () {
    let mock,app;
    before(function(done) {
        console.log("Start");
        process.env.NICP_DISABLE_TEAM=true;
        app = require('../app');
        mock = app.listen(3218,done);
    });
    after(function(done) {
        delete process.env.NICP_DISABLE_TEAM;
        mock.close();
        done();
    });

    describe('GET /admin/login/', function () {
        it('respond with 200', function (done) {
            request(mock)
                .get('/admin/login/')
                .expect(200,done)
        });
    });
    describe('GET '+'/team/login/', function () {
        it('respond with 404', function (done) {
            console.log(process.env.NICP_DISABLE_TEAM);
            request(mock)
                .get('/team/login/')
                .expect(404,done)
        });
    });
    describe('GET /judger/login/', function () {
        it('respond with 200', function (done) {
            request(mock)
                .get('/judger/login/')
                .expect(200,done)
        });
    });

});