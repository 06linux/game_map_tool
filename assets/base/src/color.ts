import { Color } from "cc";


/**
 * 颜色key定义
 */
export type BaseColorKey = (
    | 'NOR'          // 默认颜色
    | 'BLK'
    | 'RED'
    | 'BRN'
    | 'YEL'
    | 'GRN'
    | 'CYN'
    | 'BLU'
    | 'MAG'
    | 'HIW'
    | 'HIR'
    | 'HIN'
    | 'HIY'
    | 'HIG'
    | 'HIC'
    | 'HIB'
    | 'HIM'
    | 'WHT'
    | 'LIW'
    | 'LIR'
    | 'LIN'
    | 'LIY'
    | 'LIG'
    | 'LIC'
    | 'LIB'
    | 'LIM'

    | 'BG_CAMERA'
    | 'BG_NOR'
    | 'BG_MENU'
    | 'BG_PANEL'
    | 'BG_BTN'
)

// 颜色定义
/**
 * 摄像机颜色 
 * 
 */
const GAME_COLOR = new Map<string, string>(
    [
        ['NOR', '#FFFFFF'],     // 默认白色

        ['BLK', '#000000'],
        ['RED', '#AC0000'],
        ['BRN', '#4A3939'],
        ['YEL', '#FFD700'],
        ['GRN', '#006400'],
        ['CYN', '#40E0D0'],
        ['BLU', '#211DDD'],
        ['MAG', '#800080'],
        ['HIW', '#FFFFFF'],
        ['HIR', '#FF0000'],
        ['HIN', '#B8860B'],
        ['HIY', '#FFFF00'],
        ['HIG', '#57B764'],
        ['HIC', '#00FFFF'],
        ['HIB', '#00BFFF'],
        ['HIM', '#C71585'],
        ['WHT', '#C0C0C0'],
        ['LIW', '#DEDBDB'],
        ['LIR', '#FF4500'],
        ['LIN', '#927E7E'],
        ['LIY', '#FFF1D6'],
        ['LIG', '#90EE90'],
        ['LIC', '#E1FFFF'],
        ['LIB', '#87CEFA'],
        ['LIM', '#EE82EE'],


        // 其他自定义
        ['BG_CAMERA', '#2B2D31'],       // 摄像机颜色
        ['BG_NOR', '#242629'],          // 背景 -- 默认背景
        ['BG_MENU', '#1c1d1f'],         // 菜单背景
        ['BG_PANEL', '#303235'],        // panel 背景
        ['BG_BTN', '#5349AA'],          // 按钮背景
    ]
);

/**
 * 颜色定义
 */
export class BaseColor {

    /**
     * 根据颜色名称 返回颜色值
     * @param key 
     * @returns 返回对应的颜色字符串，如果不存在返回 null
     */
    public static value(key: BaseColorKey) {

        if (key == null) return null;
        return GAME_COLOR.get(key);
    }


    /**
     * 是否存在 key 
     * @param key 
     * @returns 
     */
    public static has(key: string) {
        return GAME_COLOR.has(key);
    }

    /**
     * 初始化一个 Color 对象
     * @param name 颜色名称 
     * @returns 
     */
    public static init(name: BaseColorKey) {
        const colorStr = BaseColor.value(name);
        if (colorStr) {
            return new Color(colorStr);
        }
        return null;
    }

    /**
     * 初始化一个 Color 对象
     * @param color 颜色十六进制字符串， 例如：#FFFFFF 
     * @returns 颜色对象
     * 
     * @example
     * BaseColor.init2(#FFFFFF')
     * BaseColor.init2(#ffffff')
     * BaseColor.init2(ffffff')
     */
    public static init2(colorStr: string) {
        return new Color(colorStr);
    }
}
