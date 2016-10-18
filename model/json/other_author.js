/**
 * Created by wxy on 2016/10/13.
 */
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
    age: {
        title: "年龄",
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
    forwardingAddress: {
        title: "联系方式",
        presence: true,
        length: {
            maximum: 100,
        },
        type: "text",
    },
};