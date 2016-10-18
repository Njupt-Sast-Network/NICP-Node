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
        type: "textarea",
        placeHolder: "1000字以内，应包括项目背景、创新点、已获得立项资助情况、已获奖、专利或发表论文情况、成果鉴定情况、作品完成情况。论文类作品需作品撰写的目的和基本思路，阐述作品的实际应用价值和现实指导意义；制作类作品要给出主要技术指标，提供该作品的适应范围及推广前景的技术性说明及市场分析和经济效益预测等",
    },
    photo: {
        title: "作品照片",
        type: "photo",
    },
};