/**
 * Created by wxy on 2016/10/11.
 */
'use strict';
module.exports = {
    name: {
        title: "姓名",
        presence: true,
        length: {
            maximum: 20,
        },
        type: "text",
    },
    studentID: {
        title: "学号",
        presence: true,
        length: {
            maximum: 20,
        },
        type: "text",
    },
    sex: {
        title: "性别",
        presence: true,
        inclusion: {
            within: {
                "male": "男",
                "female": "女"
            }
        },
        type: "radio",
    },
    birthday: {
        title: "出生年月",
        presence: true,
        datetime: {
            dateOnly: true
        },
        type: "date",
    },
    academy: {
        title: "学院",
        presence: true,
        length: {
            maximum: 50,
        },
        type: "text",
    },
    major: {
        title: "专业",
        presence: true,
        length: {
            maximum: 50,
        },
        type: "text",
    },
    grade: {
        title: "年级",
        presence: true,
        length: {
            maximum: 50,
        },
        type: "text",
    },
    qualification: {
        title: "学历",
        presence: true,
        length: {
            maximum: 50,
        },
        type: "text",
    },
    schoolSystem: {
        title: "学制",
        presence: true,
        length: {
            maximum: 50,
        },
        type: "text",
    },
    admissionDate: {
        title: "入学时间",
        presence: true,
        datetime: {
            dateOnly: true
        },
        type: "date"
    },
    forwardingAddress: {
        title: "通讯地址",
        presence: true,
        length: {
            maximum: 100,
        },
        type: "text",
    },
    telephone: {
        title: "电话",
        presence: true,
        length: {
            maximum: 20,
        },
        type: "text",
    }
};