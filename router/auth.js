/**
 * Created by wxy on 2016/10/4.
 */
`use strict`;
const Roles = {
    all: -1,
    team: 1,
    judger: 2,
    admin: 3
};

function verifyAuth(need_role) {
    return function *(next) {
        let role = this.session.role;
        if (role === need_role) {
            yield next;
        } else {
            switch (need_role){
                case Roles.team:
                    this.redirect('/team/login/');
                    break;
                case Roles.judger:
                    this.redirect('/judger/login/');
                    break;
                case Roles.admin:
                    this.redirect('/admin/login/');
                    break;
            }

        }
    }
}

function *logout(next) {
    yield this.regenerateSession();
}

exports.Roles = Roles;
exports.verifyAuth = verifyAuth;
exports.logout = logout;
