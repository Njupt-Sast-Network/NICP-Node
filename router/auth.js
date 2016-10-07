/**
 * Created by wxy on 2016/10/4.
 */
`use strict`;
const Roles={
    team:1,
    judger:2,
    admin:3
};

function verifyAuth(need_role) {
    return function *(next) {
        let role = this.session.role;
        if (role === need_role){
            yield next;
        }else{
            this.body="no";
        }
    }
}

function *logout(next) {
    yield this.regenerateSession();
}

exports.Roles=Roles;
exports.verifyAuth=verifyAuth;
exports.logout=logout;
