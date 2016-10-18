/**
 * Created by wxy on 2016/10/14.
 */
module.exports = {
    name: {
        title: "作品名称",
        presence: true,
        length: {
            maximum: 100,
        },
        type: "text",
    },
    project_category: {
        title: "作品类别",
        presence: true,
        inclusion: {
            within: {
                "nature": "自然科学类学术论文",
                "philosophy": "哲学社会科学类社会调查报告和学术论文",
                "inventionA": "科技发明制作A类",
                "inventionB": "科技发明制作B类",
            }
        },
        type: "radio",
    },
    subject_category: {
        title: "学科类别",
        presence: true,
        length: {
            maximum: 100,
        },
        type: "text",
    },
    isSTITP: {
        title: "是否STITP",
        presence: true,
        inclusion: {
            within: {
                "true": "是",
                "false": "否",
            }
        },
        type: "radio",
    },
    brief: {
        title: "作品简介",
        presence: true,
        length: {
            maximum: 1000,
        },
        type: "text",
    },
    photo: {
        title: "作品照片",
        presence: true,
        type: "photo",
    },
};