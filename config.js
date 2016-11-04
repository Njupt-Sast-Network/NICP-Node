/**
 * Created by wxy on 2016/10/28.
 */
const path = require('path');
module.exports = {
    debug: process.env.NICP_DEBUG ? process.env.NICP_DEBUG : true,
    siteName: "“创新杯”",
    uploadPath: process.env.NICP_UPLOAD_PATH ? process.env.NICP_UPLOAD_PATH : path.resolve(__dirname, "./upload/"),
    keys: [Math.random().toString(36).substr(2), Math.random().toString(36).substr(2)],
    port: 3000,
    rootUserName: process.env.NICP_ROOT_NAME ? process.env.NICP_ROOT_NAME : "wxy",
    rootUserPassword: process.env.NICP_ROOT_PASSWORD ? process.env.NICP_ROOT_PASSWORD : "123wxy",
    db: {
        host: process.env.PG_PORT_5432_TCP_ADDR ? process.env.PG_PORT_5432_TCP_ADDR : '127.0.0.1',
        port: process.env.PG_PORT_5432_TCP_PORT ? process.env.PG_PORT_5432_TCP_PORT : 5432,
        name: process.env.NICP_DB_NAME ? process.env.NICP_DB_NAME : 'nicp',
        user: process.env.NICP_DB_USER ? process.env.NICP_DB_USER : 'nicp',
        password: process.env.NICP_DB_PASSWORD ? process.env.NICP_DB_PASSWORD : 'nicp',
    }
};