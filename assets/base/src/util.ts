/**
 * 常用工具函数封装
 */
export class BaseUtil {

    static isNull(value: any) {

        if (value === null ||
            value === undefined ||
            value === "" ||
            value === "null" ||
            value === "Null" ||
            value === "NULL"
        ) {
            return true;
        }
        else {
            return false;
        }
    }


    /**
    * 获取类型 （obj类对应的名称）
    * @returns 
    */
    static getType(obj: any) {
        if (obj) {
            // 返回函数的名称
            if (obj.constructor.name == 'Function') {
                return obj.name;
            }

            return obj.constructor.name;
        }
        return '';
    }

    /**
     * 将 data 数据绑定到 obj 对象中
     * @param obj 对象
     * @param data 设置的数据
     * @param key 绑定的 key 值
     */
    static setData(obj: Object, data: any, key: string = 'DATA') {
        if (obj && key) {
            obj[`__B_UTIL_SET_${key}__`] = data;
        }
    }

    /**
    * 将 data 数据绑定到 obj 对象中
    * @param obj 对象
    * @param key 绑定的 key 值
    * @param data 设置的数据
    */
    static getData(obj: Object, key: string = 'DATA') {
        if (obj && key) {
            return obj[`__B_UTIL_SET_${key}__`];
        }
        return null;
    }


    /**
     * 模拟等待
     * @param delay 单位： 微妙 
     */
    public static async sleep(delay: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(true);
            }, delay);
        })
    }

    /**
     * 将对象内容转换为 url 参数格式
     * BaseUtil.urlParams({ id: 'helloxxx }) 返回： 'id=helloxxx'
     */
    public static obj2URL(obj: any) {
        let retStr = "";
        for (let key in obj) {

            if (retStr != "") {
                retStr += '&';
            }
            retStr += (key + '=' + obj[key]);
        }
        return retStr;
    }

    /**
     * 获取一个对象 key 值列表
     * @param obj 
     * @returns 
     */
    public static objKeys(obj: object) {
        let retList: string[] = [];
        for (let key in obj) {
            retList.push(key);
        }
        return retList;
    }


    /**
    * 清除数组中 null, undefind 元素
    * @param arr 数组
    */
    public static arrTrim(array: any[]) {
        if (array) {
            for (let i = 0; i < array.length; i++) {
                if (array[i] == null || typeof (array[i]) == "undefined") {
                    array.splice(i--, 1);
                }
            }
            return array;
        }

        return [];
    }


    public static arrDel(array: any[], value: any) {
        if (array) {
            for (let i = 0; i < array.length; i++) {
                if (array[i] == value) {
                    array.splice(i--, 1);
                }
            }
            return array;
        }

        return [];
    }

    public static arrDel2(array: any[], key: string, value: any) {
        if (array) {
            for (let i = 0; i < array.length; i++) {
                if (array[i][key] == value) {
                    array.splice(i--, 1);
                }
            }
            return array;
        }

        return [];
    }


    /**
     * 检测 value  是否存在 arr 数组中
     */
    public static arrCheck(array: any[], value: any) {
        if (array) {
            for (let i = 0; i < array.length; i++) {
                const obj = array[i];
                if (obj == value) {
                    return true;
                }
            }
        }
        return false;
    }


    /**
     * 检测 value  是否存在 arr 数组中
     */
    public static arrCheck2(array: any[], key: string, value: any) {
        if (array && key) {
            for (let i = 0; i < array.length; i++) {
                const obj = array[i];
                if (obj[key] == value) {
                    return true;
                }
            }
        }
        return false;
    }


    /**
     * 查找 
     */
    public static arrFind(array: any[], key: string, value: any) {
        if (array && key) {
            for (let i = 0; i < array.length; i++) {
                const obj = array[i];
                if (obj[key] == value) {
                    return obj;
                }
            }
        }
        return null;
    }


}