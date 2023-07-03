import { BaseUtil } from './util';
import { BaseConfig } from './config';
import { log } from 'cc';
import { BaseHttp } from './http';


/**
 * 一个基本消息
 */
export type SMsg = {
    event: string;              // EventId 事件id (客户端根据不同的事件进行逻辑处理)
    time: number;               // 时间戳，单位：毫秒
    data?: any;                 // 具体的数据
    uid?: string;               // 消息的创建者
    room?: string;              // 房间名称
    tag?: string;               // 标记位
}

export enum STag {
    success = 'success',
    error = 'error'
}

/**
 * BaseSocket 定义的事件类型
 */
export enum SEvent {

    PING = 'BS_PING',                       // ping 事件
    PONG = 'BS_PONG',                       // pong 事件
    ERROR = 'BS_ERROR',                     // 错误信息
    ERROR_TOKEN = 'BS_ERROR_TOKEN',         // 验证权限错误

}

/**
 * 回调函数
 */
// export type SEventFun = (msg: SMsg) => void;
export type SEventFun = (msg: SMsg) => Promise<void>;


/**
 * event 事件处理函数
 */
export type SEventHandle = {
    eFun: SEventFun,            // 回调函数
    context: any,                     // 回调函数上下文对象，如果在回调函数中使用this调用，需要绑定 this ，要不然 this 会丢失
}


/**
 * 连接 ID 数据
 */
export type BSConnectID = {
    uid: string;                // 连接的唯一标识 （用户 uid）
    rid?: string;               // 角色 id
}

/**
 * 房间配置
 */
export type BSRoom = {
    room: string;               // 房间名称
    time: number;               // 最后一次拿取数据的时间
}

const BASESOCKET_LOOP_TIME = 100;       // 循环时间

/**
 * 客户端 (BaseSocket Client)
 * http 长轮询
 */
export class BaseSocket {

    private static _events: Map<string, SEventHandle[]> = new Map();        // 事件函数
    private static _reqest = [] as SMsg[];                                  // 请求列表 （客户端发送给服务器）
    private static _url = '';                                               // 服务器地址
    private static _timer = 0;                                              // 定时器句柄

    private static _timeNow = 0;                                            // 服务器时间

    /**
     * 初始化
     * @param url 服务器 qsocket 地址
     */
    public static async init(url: string = BaseConfig.SERVER_BSOCKET) {

        this._url = url;
        this.destory();

        try {
            this._timer = setInterval(() => {
                BaseSocket.fflush();
            }, BASESOCKET_LOOP_TIME);
        } catch (error) {
            log('BaseSocket.init error!', error);
        }
    }

    /**
     * 断开连接
     */
    public static destory() {
        clearInterval(this._timer);
        this._timer = 0;
        this.clear();
    }


    /**
     * 清除数据
     */
    public static clear() {
        this._events.clear();
        this._reqest = [];
    }

    private static ping() {
        this._reqest.push({
            event: SEvent.PING,
            time: Date.now(),
        });
    }

    // 服务器时间
    public static getTime() {
        return this._timeNow;
    }


    /**
     * 发送数据 (给服务器)
     * @param event 事件id
     * @param data 
     * 
     * 优化： 如果有请求，马上发送给服务器
     * 监听数据，单独一个逻辑
     */
    public static send(event: string, data?: any, tag?: string) {
        const msg: SMsg = {
            event,
            time: Date.now(),
            data,
        };

        if (tag) {
            msg.tag = tag;
        }

        this._reqest.push(msg);
    }

    // 立刻发送
    public static sendNow(event: string, data?: any, tag?: string) {
        this.send(event, data, tag);
        this.fflush();
    }


    /**
     * 立刻发送请求
     */
    public static fflush() {

        // 如果消息为空，发送 ping 事件
        if (this._reqest.length == 0) {
            this.ping();
        }

        const req = this._reqest;
        this._reqest = [];

        this.run(req);
    }



    /**
     * 循环调用
     */
    private static async run(req: SMsg[]) {

        const msgLength = this._reqest.length;
        // console.log('BaseSocket.run ---> _reqest=', JSON.stringify(req));

        const response = await BaseHttp.fetchJson("POST", this._url, { msgs: JSON.stringify(req) }) as string[];
        if (response && response.length > 0) {
            // 处理服务器数据
            for (let index = 0; index < response.length; index++) {
                const msg = JSON.parse(response[index]) as SMsg;
                if (msg.event != SEvent.PONG) {
                    await this.emitEvent(msg.event, msg);
                }

                if (msg.time > this._timeNow) {
                    this._timeNow = msg.time;
                }
            }
        }
    }


    /**
    * 添加订阅者
    * @param event 事件名称
    * @param callBack 回调函数
    * @param context 回调函数对象实例，需要绑定 this ，要不然回调的时候 this 会丢失
    */
    public static on(event: string, eFun: SEventFun, context?: any) {

        if (event == "" || event == null || eFun == null) {
            return;
        }

        const handle: SEventHandle = { eFun, context };
        if (this._events.has(event)) {
            this._events.get(event).push(handle);
        }
        else {
            this._events.set(event, [handle]);
        }
    }


    /**
     * 关闭事件回调
     */
    public static off(event: string, eFun: SEventFun, context?: any) {

        if (event == "" || event == null) {
            return;
        }

        if (this._events.has(event)) {

            const list = this._events.get(event);
            for (let i = 0; i < list.length; i++) {
                const handle = list[i];
                if (context) {
                    if (handle.eFun === eFun && handle.context === context) {
                        list.splice(i, 1);  // 移除当前元素
                        break;
                    }
                }
                else {
                    if (handle.eFun === eFun) {
                        list.splice(i, 1);  // 移除当前元素
                        break;
                    }
                }
            }

            if (list.length == 0) {
                this._events.delete(event);
            }
        }
    }

    /**
     * 发送一个事件 （调用事件对应的回调函数）
     * @param event 事件名称
     * @param data 传递数据
     * @returns 
     */
    public static async emitEvent(event: string, msg: SMsg) {

        console.log('BaseSocket.emitEvent-->', event, msg);

        const list = this._events.get(event);
        if (list && list.length > 0) {
            for (let listIndex = 0; listIndex < list.length; listIndex++) {
                const handle = list[listIndex];
                if (handle.context) {
                    // call调用对象方法， 绑定 this 指针，否则函数中的 this 指针无法访问
                    await handle.eFun.call(handle.context, msg);
                }
                else {
                    await handle.eFun(msg);
                }
            }
        }
        else {
            console.error('Error, BaseSocket.emitEvent 没有执行函数', msg);
        }

    }

    public static debug() {
        console.log('BaseSocket.debug', { events: this._events });
    }

}