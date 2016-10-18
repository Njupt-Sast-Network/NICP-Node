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
    age: {
        title: "年龄",
        presence: true,
        length: {
            maximum: 50,
        },
        type: "text",
    },
    jobTitle: {
        title: "职称",
        presence: true,
        length: {
            maximum: 50,
        },
        type: "text",
    },
    company: {
        title: "工作单位",
        presence: true,
        length: {
            maximum: 50,
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