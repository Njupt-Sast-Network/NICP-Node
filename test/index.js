/**
 * Created by wxy on 2016/11/6.
 */
const supertest = require("supertest");
const chai = require('chai');
const app = require('../app');


function request() {
    return supertest(app.listen());
}

function should200(url) {
    describe('GET '+url, function () {
        it('respond with 200', function (done) {
            request()
                .get(url)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                    }
                    done();
                })
        });
    });
}

describe('index', function () {
    should200('/admin/login/');
    should200('/team/login/');
    should200('/judger/login/');

});