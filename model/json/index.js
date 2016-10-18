/**
 * Created by wxy on 2016/10/13.
 */
let models = {};
let validate = require("validate.js");
let moment = require("moment");
models.first_author = require('./first_author');
models.other_author = require('./other_author');
models.teacher = require('./teacher');


models.validate = function (data, model) {

    //忽略附加信息
    validate.validators.title = function (value, options, key, attributes) {
        return undefined;
    };
    validate.validators.type = function (value, options, key, attributes) {
        return undefined;
    };

    validate.extend(validate.validators.datetime, {
        // The value is guaranteed not to be null or undefined but otherwise it
        // could be anything.
        parse: function (value, options) {
            return +moment.utc(value);
        },
        // Input is a unix timestamp
        format: function (value, options) {
            var format = options.dateOnly ? "YYYY-MM-DD" : "YYYY-MM-DD hh:mm:ss";
            return moment.utc(value).format(format);
        }
    });

    return validate.validate(data, model);
};

module.exports = models;