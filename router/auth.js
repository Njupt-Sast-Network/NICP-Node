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
    return async (ctx, next) => {
        let role = ctx.session.role;
        if (role === need_role) {
            await next();
        } else {
            switch (need_role){
                case Roles.team:
                    ctx.redirect('/team/login/');
                    break;
                case Roles.judger:
                    ctx.redirect('/judger/login/');
                    break;
                case Roles.admin:
                    ctx.redirect('/admin/login/');
                    break;
            }

        }
    }
}

async function logout(ctx,next) {
    await ctx.regenerateSession();
    switch(ctx.params.role){
        case 'admin':
            ctx.redirect('/admin/login');
            break;
        case 'team':
            ctx.redirect('/team/login');
            break;
        case 'judger':
            ctx.redirect('/judger/login');
            break;
        default:
            ctx.redirect('/');
    }
}

exports.Roles = Roles;
exports.verifyAuth = verifyAuth;
exports.logout = logout;
