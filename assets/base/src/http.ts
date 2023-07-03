import { BaseUtil } from "./util";


/**
* 返回状态定义
*/
export type HttpStatus = 'success' | 'error' | 'error-token';


/**
 * 下传数据
 */
export type HttpRes = {
    status: HttpStatus;     // 数据状态
    data?: any;             // 下发的数据
    desc?: string;          // 描述信息，一般是状态错误对应的内容描述
    tag?: string;           // 标记位
}


/**
 * 请求方式
 */
export type HttpMethod = 'GET' | 'POST';


/**
 * base http 联网封装
 */
export class BaseHttp {

    public static TOKEN = "";

    /**
    * 请求网络数据， 返回 null 表示获取数据失败
    * @param method 请求方法
    * @param url   请求路径，相对路径
    * @param data 请求参数
    * @returns 
    * 
    * const res = await BaseHttp.fetchJson("POST", 'http://localhost:8000/api_v1/test/test-parms', {name:'zhangsan', desc:'我是张三'}) as HttpRes;
    * log("res.status=", res.status);
    */
    public static async fetchData(method: HttpMethod, url: string, data?: object): Promise<string> {
        try {
            const body = data ? JSON.stringify(data) : null;
            const res = await fetch(url,
                {
                    method,
                    body,
                    headers: {
                        'Content-Type': 'application/json',
                        'token': this.TOKEN,
                    }
                }
            );

            const text = await res.text();
            // console.log('BaseHttp.fetchData', text);
            return text;

        } catch (error) {
            console.error('Error, BaseHttp.fetchData', error);
        }

        return null;
    }

    /**
     * 请求 json 数据， 返回 null 表示获取数据失败
     * @param method 请求方法
     * @param url   请求路径，相对路径
     * @param params 请求参数
     * @returns 返回一个 json 对象
     * 
     *  const res = await BaseHttp.fetchData("POST", 'http://localhost:8000/api_v1/test/test-parms', {name:'zhangsan', desc:'我是张三'}) as HttpRes;
     *  log("res.status=", res.status);
     */
    public static async fetchJson(method: HttpMethod, url: string, params = {}) {

        const resData = await this.fetchData(method, url, params);
        if (resData) {
            try {
                const res = JSON.parse(resData);
                return res;
            } catch (error) {
                console.error('Error!! BaseHttp.fetchJson', { resData, error });
            }
        }
        return null;
    }

}


// /**
//  * base http 联网封装
//  * 
//  *  备注：
//  *  XMLHttpRequest 请求是， url 中文数据无法正常传递
//  */
// export class BaseHttpXXX {

//     public static TOKEN = "";

//     /**
//     * 请求网络数据， 返回 null 表示获取数据失败
//     * @param method 请求方法
//     * @param url   请求路径，相对路径
//     * @param params 请求参数
//     * @returns 
//     * 
//     * const res = await BaseHttp.fetchData("POST", 'http://localhost:8000/api_v1/test/test-parms', {name:'zhangsan', desc:'我是张三'}) as HttpRes;
//     * log("res.status=", res.status);
//     */
//     public static async fetchData(method: HttpMethod, url: string, params = {}): Promise<string> {

//         // fetch()

//         return new Promise(resolve => {

//             try {
//                 const strParams = BaseUtil.obj2URL(params);
//                 const xhr = new XMLHttpRequest();

//                 if (method == "POST") {
//                     xhr.open("POST", url + "?" + strParams, true);
//                 }
//                 else { // 默认 GET 请求
//                     xhr.open("GET", url + "?" + strParams, true);
//                 }

//                 // xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");// --在服务器端设置，客户端设置会报错
//                 xhr.setRequestHeader("token", this.TOKEN);
//                 xhr.timeout = 2000;

//                 xhr.send()
//                 xhr.onreadystatechange = () => {
//                     if (xhr.readyState === 4 && xhr.status === 200) {
//                         // console.log('BaseHttp.fetchData', xhr.responseText);
//                         resolve(xhr.responseText);
//                     }
//                 }
//                 xhr.ontimeout = () => {
//                     console.error('BaesHttp.Request Timeout!!');
//                     resolve(null);
//                 };

//             } catch (error) {
//                 console.log('Error!! BaseHttp.fetchData 异常', error);
//                 resolve(null);
//             }
//         });

//     }

//     /**
//      * 请求 json 数据， 返回 null 表示获取数据失败
//      * @param method 请求方法
//      * @param url   请求路径，相对路径
//      * @param params 请求参数
//      * @returns 返回一个 json 对象
//      * 
//      *  const res = await BaseHttp.fetchData("POST", 'http://localhost:8000/api_v1/test/test-parms', {name:'zhangsan', desc:'我是张三'}) as HttpRes;
//      *  log("res.status=", res.status);
//      */
//     public static async fetchJson(method: HttpMethod, url: string, params = {}) {

//         const resData = await this.fetchData(method, url, params);
//         if (resData) {
//             try {
//                 const res = JSON.parse(resData);
//                 return res;
//             } catch (error) {
//                 console.log('Error!! BaseHttp.fetchJson, JSON.parse', { resData, error });
//             }
//         }
//         return null;
//     }


// }