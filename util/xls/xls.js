'use strict';
const Q = require('q');
const child_process = require('child_process');
/**
 * 读取xls文件
 *
 * @param {String} filePath 文件路径
 *
 * @example
 * //ReadXLS('../docs/学生基本信息模板.xls')
 * ReadXLS('../docs/1461248018228 - 副本.xls')
 *   .then(
 *      (result)=> {
 *          console.log(result.length);
 *   })
 *   .catch(
 *      (err)=> {
 *          console.log(err);
 *      }
 *   );
 * */
function ReadXLS(filePath) {
    let deferred = Q.defer();
    child_process.exec(
        'python3 util/xls/xlsrd.py' + ' \'' + filePath + '\'',
        {
            maxBuffer: 1024 * 1024 * 200,// 200mb
            encoding: "utf8"
        }, (err, stdout, stderr) => {
            let result = JSON.parse(stdout);

            if (err != null) {
                deferred.reject(err.toString());
            }
            if (stderr != '') {
                deferred.reject(stderr);
            }

            deferred.resolve(result);
        }
    );
    return deferred.promise;
}

/**
 * 保存xls文件
 *
 * @param {String} filePath 文件路径
 *
 * @param data 二维数组形式的数据
 *
 * @param is_list {boolean} 是否是以列表形式提供的
 *
 * @example
 * writeXLS('../docs/1461248018228 - 副本.xls',data)
 *   .then(
 *      (result)=> {
 *          console.log(result.length);
 *   })
 *   .catch(
 *      (err)=> {
 *          console.log(err);
 *      }
 *   );
 * */
function WriteXLS(filePath,data,is_list=false) {
    let deferred = Q.defer();
    let xlswtPath;
    if(is_list){
        xlswtPath="python3 util/xls/xlswt_list.py";
    }else{
        xlswtPath="python3 util/xls/xlswt_.py";
    }
    let child = child_process.exec(
        xlswtPath + ' \'' + filePath + '\'',
        {
            maxBuffer: 1024 * 1024 * 200,// 200mb
            encoding: "utf8"
        }, (err, stdout, stderr) => {
            if (err != null) {
                deferred.reject(err.toString());
            }
            if (stderr != '') {
                deferred.reject(stderr);
            }
            deferred.resolve(stdout);
        }
    );
    child.stdin.write(JSON.stringify(data),'utf8');
    child.stdin.end();
    return deferred.promise;
}

/**
 * 标题转为key
 * @param data
 * @param format
 * @returns {Array}
 */
const E_TitleMisMatch = new Error('列标题不符');
function Title2Key (data, format) {

    for (let i = 0; i < format.length; i++) {
        if (data[0][i] != format[i][0]) {
            console.error(data[0][i],format[i][0]);
            throw E_TitleMisMatch;
        }
    }

    let result = [];
    for (let i = 1; i < data.length; i++) {
        let one = {};
        for (let j = 0; j < format.length; j++) {
            one[format[j][1]] = data[i][j];
        }
        result.push(one);
    }
    return result;
}

/**
 * key转为标题
 * @param data
 * @param format
 * @returns {Array}
 */
const E_MissKey = new Error('数据缺失key');
function Key2Title (data, format) {
    let result = [];
    for (let i = 0; i < data.length; i++) {
        let one = {};
        for (let j = 0; j < format.length; j++) {
            if(!data.hasOwnProperty(format[j][1])){
                throw E_MissKey
            }
            one[i][j] = data[format[j][1]];
        }
        result.push(one);
    }
    return result;
}

exports.Key2Title = Key2Title;
exports.Title2Key = Title2Key;
exports.ReadXLS = ReadXLS;
exports.writeXLS = WriteXLS;

/*
 xls2DB('../docs/学生列表.xls', ' ', [
 ['学号', 'std_id'], ['姓名', 'name'], ['年级', 'grade'], ['入学年份', 'entry_year'],
 ['学生来源', 'local'], ['身份证号', 'id_number'], ['家庭住址', 'address'],
 ['院系名称', 'department']
 ]);
 */
//
// xls2DB('../docs/学生列表.xls', ' ', [
//     ['学号', 'std_id'], ['姓名', 'name'], ['年级', 'grade'], ['入学年份', 'entry_year'],
//     ['民族代码','nation'],['性别','sex'],['出生日期','birth'],
//     ['学生来源', 'local'], ['身份证号', 'id_number'], ['家庭住址', 'address'],
//     ['院系名称', 'department']
// ]);