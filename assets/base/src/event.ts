import { BaseUtil } from "./util";

/**
 * 回调函数 (...args 表示动态参数)
 */
export type EventFun = (...args: any) => void;

/**
 * event 事件处理函数
 */
export type EventHandle = {
    eFun: EventFun,            // 回调函数
    context: any,              // 回调函数上下文对象，如果在回调函数中使用this调用，需要绑定 this ，要不然 this 会丢失
}


/**
 * 事件注册回调函数
 * 方便不同的模块中传递消息
 */
export class BaseEvent {

    protected static _events: Map<string, EventHandle[]> = new Map();     // 事件函数

    /**
     * 添加订阅者
     * @param event 事件名称
     * @param callBack 回调函数
     * @param context 回调函数对象实例，需要绑定 this ，要不然回调的时候 this 会丢失
     * 
     * @example
     * 
     * BaseEvent.on('MenuPanel.show', this.show, this);
     */
    public static on(event: string, eFun: EventFun, context?: any) {

        if (event == "" || event == null || eFun == null) {
            return;
        }

        this.off(event, eFun, context);

        const handle: EventHandle = { eFun, context };
        if (this._events.has(event)) {
            this._events.get(event).push(handle);
        }
        else {
            this._events.set(event, [handle]);
        }
    }


    /**
     * 关闭事件回调
     * 
     * @example
     * BaseEvent.off('MenuPanel.show', this.show, this);
     */
    public static off(event: string, eFun: EventFun, context?: any) {

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
     * 触发事件， 件触发后该事件所有订阅者会被调用
     * @param event 事件名称
     * @param data 传递数据
     * @returns 
     */
    public static emit(event: string, ...args: any) {
        const list = this._events.get(event);
        if (list && list.length > 0) {
            for (let i = list.length - 1; i >= 0; i--) {
                const handle = list[i];

                if (handle.context) {
                    // call调用对象方法， 绑定 this 指针，否则函数中的 this 指针无法访问
                    // 注意 ...args 标识展开参数
                    handle.eFun.call(handle.context, ...args);
                }
                else {
                    handle.eFun(...args);
                }
            }
        }
    }

}
