/**
 * 数字封装
 */
export class BaseNum {

    /**
    * 创建一个 [0,max) 之间的随机数
    * max 必须是 int类型
    */
    public static rand(max: number): number {
        if (max <= 0) return 0;
        const rand = Math.random() * 10000000000000;
        return Math.floor(rand % max);
    }

    /**
     * 创建一个 [num1,num2) 之间的随机数
     */
    public static rand2(num1: number, num2: number): number {

        if (num1 <= 0) return this.rand(num2);
        if (num2 - num1 < 1) return num1;
        return num1 + this.rand(num2 - num1);
    }

    /**
     * 创建一个随机数字字符串
     * @param len 
     */
    public static randStr(len: number): string {
        let retStr = '';
        for (let i = 0; i < len; i++) {
            retStr += (1 + this.rand(9));  // 防止第一位为 '0'
        }
        return retStr;
    }


    /**
     * 计算数字精度 (金钱交易精度控制) -- 不存在四舍五入！！
     * @param num  
     * @param dec 保留小数点以后几位数字  
     * 
     */
    public static precision(num: string | number, dec: number): string {

        const strNum = num + '';   // 转换成字符串
        const pointIndex = strNum.indexOf('.');
        if (pointIndex < 0) {
            return strNum;  // 不存在小数点
        }
        if (dec <= 0) {
            return strNum.substring(0, pointIndex); // 值返回整数部分
        }
        return strNum.substring(0, pointIndex) + strNum.substring(pointIndex, pointIndex + dec + 1);
    }

    public static precision2(num: string | number, dec: number): number {
        const strNum = this.precision(num, dec);
        return parseFloat(strNum);
    }

    /**
     * 返回数据的精度，例如： 0.01 返回 2，表示精确到小数点后面 2位
     * @param num 
     */
    public static getPrecision(num: number) {
        let retPrecision = 0;
        for (let index = 0; index < 20; index++) {
            if (num >= 1) {
                break;
            }
            num = num * 10;
            retPrecision += 1;
        }
        return retPrecision;
    }


    /**
    * 英文数字转换成中文汉字
    * @param num 
    * @returns 
    */
    public static toZH(num: number) {
        let arr1 = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        let arr2 = ['', '十', '百', '千', '万', '十', '百', '千', '亿', '十', '百', '千', '万', '十', '百', '千', '亿'];//可继续追加更高位转换值
        if (!num || isNaN(num)) {
            return "零";
        }
        let english = num.toString().split("")
        let result = "";
        for (let i = 0; i < english.length; i++) {
            let des_i = english.length - 1 - i;//倒序排列设值
            result = arr2[i] + result;
            let arr1_index = english[des_i];
            result = arr1[arr1_index] + result;
        }
        //将【零千、零百】换成【零】 【十零】换成【十】
        result = result.replace(/零(千|百|十)/g, '零').replace(/十零/g, '十');
        //合并中间多个零为一个零
        result = result.replace(/零+/g, '零');
        //将【零亿】换成【亿】【零万】换成【万】
        result = result.replace(/零亿/g, '亿').replace(/零万/g, '万');
        //将【亿万】换成【亿】
        result = result.replace(/亿万/g, '亿');
        //移除末尾的零
        result = result.replace(/零+$/, '')
        //将【零一十】换成【零十】
        //result = result.replace(/零一十/g, '零十');//貌似正规读法是零一十
        //将【一十】换成【十】
        result = result.replace(/^一十/g, '十');
        return result;
    }

}