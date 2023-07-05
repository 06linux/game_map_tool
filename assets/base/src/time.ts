
/**
 * 常用时间函封装
 */
export class BaseTime {

    /**
    * 定义时间戳长度
    */
    public static readonly DAY = 24 * 60 * 60 * 1000;        // 一天的时间长度，单位：毫秒
    public static readonly HOUR = 60 * 60 * 1000;            // 一小时的时间长度，单位：毫秒
    public static readonly MINUTE = 60 * 1000;

    /**
     * 当前时间
     * 返回 1970 年 1 月 1 日至今的毫秒数。
     */
    public static now(): number {
        return Date.now();
    }


    public static timeStr(time?: number) {
        const date = time ? new Date(time) : new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const min = date.getMinutes();
        const second = date.getSeconds();

        return `${year}-${month}-${day}${hour}:${min}:${second}`;
    }

    public static dateStr(time?: number) {
        const date = time ? new Date(time) : new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        return `${year}-${month}-${day}`;
    }

}