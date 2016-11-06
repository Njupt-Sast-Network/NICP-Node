const app = require("./app");
// Config
const config = require('./config');

app.listen(config.port || 3000, function () {
    console.log('Server listening on: ', 3000);
});