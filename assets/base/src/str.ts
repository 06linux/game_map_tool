import { MD5 } from './md5';


const KEY_MD5_PASSWORD = 'com.06linx.xhzl';         // md5 加密 key  


/**
 * 字符串处理封装
 */
export class BaseStr {


    public static readonly ZH_SPACE = '　';           // 汉字空格，在中文输入法中切换到全角输入状态，此时按空格键会出现全角空格符号

    /**
     * 删除字符串中所有空格
     * 索字符串中的所有空格，过滤删除掉
     */
    public static delSpace(str: string) {
        if (str == null || str == '') {
            return '';
        }

        return str.replace(/ /g, '');
    }

    /**
     * 将多个空格过滤成 1个
     */
    public static trimSpace(str: string, rep: string = ' ') {
        if (str == null || str == '') {
            return '';
        }

        return str.replace(/\s\s+/g, rep);
    }

    // 按照换行符进行分割
    public static splitN(str: string) {
        if (str == null || str == '') return [];
        const str2 = str.replace(/\r\n|\n/g, '_N_');     //  替换所有换行  
        const arr = str2.split('_N_');
        return arr;
    }


    // 解析命令函数参数
    public static cmdPrase(cmd: string): string[] {
        const str1 = this.trimSpace(cmd);          // 多个空格过滤成 1个
        const str2 = str1.trim();                   // 过滤前后空格

        if (str2 == '') {
            return [];
        }

        const args = str2.split(' ');
        return args;
    }


    /**
    * 检测命令行参数是否存在某个参数，如果存在，返回对应下标
    * @param args 
    * @param param 参数值
    * 
    * BaseStr.cmdCheck(args, '-l') 检测命令字符串中是否存在 -l 参数
    */
    public static cmdCheck(args: string[], param: string) {

        if (args) {
            for (let index = 0; index < args.length; index++) {
                const element = args[index];
                if (element == param) {
                    return index;
                }
            }
        }

        return 0;
    }


    /**
     * 检测是否数字
     */
    public static matchNum(str: string) {
        if (str) {
            const regExp = "^[0-9]*$";
            if (str.match(regExp)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 26个英文字母组成的字符串
     */
    public static matchEN(str: string) {
        if (str) {
            const regExp = "^[A-Za-z]+$";
            if (str.match(regExp)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 数字和26个英文字母组成的字符串
     */
    public static matchEnNum(str: string) {
        if (str) {
            const regExp = "^[A-Za-z0-9]+$";
            if (str.match(regExp)) {
                return true;
            }
        }
        return false;
    }



    /**
     * 只能输入汉字
     */
    public static matchZH(str: string) {
        if (str) {
            const regExp = "^[\u4e00-\u9fa5]{0,}$";
            if (str.match(regExp)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 邮箱格式检测
     */
    public static matchEmail(str: string) {
        if (str) {
            const regExp = "[\\w!#$%&'*+/=?^_`{|}~-]+(?:\\.[\\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\\w](?:[\\w-]*[\\w])?\\.)+[\\w](?:[\\w-]*[\\w])?";
            if (str.match(regExp)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 密码的强度必须是包含大小写字母和数字的组合，不能使用特殊字符，长度在6-10之间。
     */
    public static matchPwd(str: string) {
        if (str) {
            const regExp = "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,10}$";
            if (str.match(regExp)) {
                return true;
            }
        }
        return false;
    }


    /**
     * 返回一个唯一的uuid
     */
    static uuid(): string {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }


    /**
    * 生成一个唯一的邀请码，时间单位精确到秒 
    * 格式：k9xqd4g4 （固定8位数字和字母）
    * 
    * 备注： 字符a-z0-9刚好是36个。邀请码 = 时间单位秒+三位随机数，转换成 36进制数 
    * 
    *      同一秒如果产生多个邀请码，会存在一定概率重复
    */
    public static uidInvite8(): string {

        const source = [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
            'a', 'b', 'c', 'd', 'e', 'f',
            'g', 'h', 'i', 'j', 'k', 'l',
            'm', 'n', 'o', 'p', 'q', 'r',
            's', 't', 'u', 'v', 'w', 'x',
            'y', 'z'
        ];

        function S1() {
            return (((1 + Math.random()) * 0x10) | 0).toString(10).substring(1);
        }

        // function S2() {
        //     return (((1 + Math.random()) * 0x100) | 0).toString(10).substring(1);
        // }

        const timeSeconds = Math.floor(Date.now() / (1000));  // unix 纪元时间，秒数
        let num = parseInt(`${timeSeconds}${S1()}${S1()}${S1()}`);
        // console.log('createCode, num=', num);

        let code = '';
        while (num) {
            const mod = num % 36;
            num = Math.floor(num / 36);
            code = `${source[mod]}${code}`;
        }
        // return code;
        return code.substring(0, 2) + code.substring(7) + code.substring(2, 6) + code.substring(6, 7); // 打乱顺序
    }


    /**
     * 生成一个唯一的邀请码 （时间单位精确到毫秒）
     * 格式：k9xqd4g4
     * 
     * 备注： 字符a-z0-9刚好是36个。
     *      具体算法，时间单位毫秒+三位随机数，转换成 36进制数 
     *      
     */
    public static uidInvite10(): string {

        const source = [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
            'a', 'b', 'c', 'd', 'e', 'f',
            'g', 'h', 'i', 'j', 'k', 'l',
            'm', 'n', 'o', 'p', 'q', 'r',
            's', 't', 'u', 'v', 'w', 'x',
            'y', 'z'
        ];

        function S1() {
            return (((1 + Math.random()) * 0x10) | 0).toString(10).substring(1);
        }

        // function S2() {
        //     return (((1 + Math.random()) * 0x100) | 0).toString(10).substring(1);
        // }

        const times = Date.now();  // unix 纪元时间，毫秒数
        let num = parseInt(`${times}${S1()}${S1()}${S1()}`);

        let code = '';
        while (num) {
            const mod = num % 36;
            num = Math.floor(num / 36);
            code = `${source[mod]}${code}`;
        }
        // return code;
        return code.substring(0, 2) + code.substring(7) + code.substring(2, 6) + code.substring(6, 7); // 打乱顺序

    }


    /**
     * 返回 md5 字符串
     * @param str 
     */
    public static md5(str: string): string {
        return MD5(str);
    }

    /**
     * 返回 md5 加密
     * @param str 
     */
    public static md5Pwd(str: string, key = KEY_MD5_PASSWORD): string {
        return MD5(str, key);
    }

}