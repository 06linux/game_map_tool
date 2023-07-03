import { Vec2 } from "cc";

/**
 * 地图配置 
 * sys map 
 * 
 * zone + name 唯一确定一个地图
 */
export type SMap = {
    _id: string;
    zone: string;               // 区域（分区）
    name: string;               // 名称 
    type: SMapType;             // 类型
    places: SMapPlace[];        // 地点配置
    desc: string;               // 描述

    spaceW?: number;             // 地点之间的间距
    spaceH?: number;             // 地点之间的间距
    args?: string;               // 自定义参数（格式：key=value&key2=value2)

    time?: number;              // 最后修改时间
    timeStr?: string;
}

/**
 * 地图名称参数
 * 
 * 格式： 地图名称#参数设置 
 * 举例： 迷雾森林#迷宫
 */
export type SMapNameArg = '迷宫' | '探索' | '其他';

export type SMapType = (
    | '自由区'              // 默认自由区域 （可以自由决定战斗或者不战斗）
    | '保护区'              // 保护区 （禁止任何战斗，新手区域或者一些主城中是保护区）
    | '危险区'              // 危险区域 （见面自动进入战斗）
)


/**
 * 地图位置
 */
export type SMapPos = {
    map: string;                // 地图名称
    mapId: string;              // 地图 id
    place: string;              // 地点名称
    placeId: string;            // 地点 id
}


/**
 * 地图地点数据
 */
export type SMapPlace = {
    _id: string;
    name: string;           // 名称

    args?: string;          // 自定义参数（格式：key=value&key2=value2)
    desc?: string;          // 简介
    color?: string;         // 文字颜色
    colorbg?: string;       // 背景颜色
    pos?: Vec2;             // 显示坐标
    fadeLoop?: boolean;     // 是否淡入淡出


    // 链接的地点id （八方向）
    n?: string;             // north 北方
    s?: string;             // south 南方
    e?: string;             // east 东方
    w?: string;             // west 西方
    nw?: string;            // northwest 西北
    ne?: string;            // northeast 东北
    sw?: string;            // southwest 西南
    se?: string;            // southeast 东南

    skip?: SMapPos;         // 跳转地点 (进入当前地点后，直接触发传送到地图另一个地点)
    // npcs?: SMapNpc[];       // npc配置
    // items?: SMapItem[];     // 物品配置
    // storys?: SMapStory[];   // 剧情绑定
}





// 地图方向 （行走命令）（8方向）
export enum SMapDir {

    // 缩写
    N = 'north',          // 北
    S = 'south',          // 南      
    W = 'west',           // 西
    E = 'east',           // 东
    SE = 'southeast',     // 东南
    SW = 'southwest',     // 西南
    NE = 'northeast',     // 东北
    NW = 'northwest',     // 西北

    // 完整（命令）
    // NORTH = 'north',                // 北
    // SOUTH = 'south',                // 南      
    // WEST = 'west',                  // 西
    // EAST = 'east',                  // 东
    // SOUTH_EAST = 'southeast',       // 东南
    // SOUTH_WEST = 'southwest',       // 西南
    // NORTH_EAST = 'northeast',       // 东北
    // NORTH_WEST = 'northwest',       // 西北
}

// 数字键盘：上北下南，左西右东 布局（8方向）
export enum SMapDirNum {

    NULL = -1,      // 表示没有方向数据

    N = 8,          // 北
    S = 2,          // 南      
    W = 4,          // 西
    E = 6,          // 东
    SE = 3,         // 东南
    SW = 1,         // 西南
    NE = 9,         // 东北
    NW = 7,         // 西北
}


export class SMapUtil {

    /**
     * 获取地图名称， 地图名称中存在参数数据，需要过滤掉
     * @param map 
     */
    public static getName(map: SMap) {
        const name = map.name.split('#')[0];
        return name;
    }

    public static getName2(mapName: string) {
        const name = mapName.split('#')[0];
        return name;
    }

    public static getNameArg(map: SMap) {
        const nameArgs = map.name.split('#');
        if (nameArgs.length > 1) {
            return nameArgs[1] as SMapNameArg;
        }
        return null;
    }

    public static dirReverse(dir: SMapDir): SMapDir {
        switch (dir) {
            case SMapDir.N: return SMapDir.S;
            case SMapDir.S: return SMapDir.N;
            case SMapDir.W: return SMapDir.E;
            case SMapDir.E: return SMapDir.W;
            case SMapDir.NW: return SMapDir.SE;
            case SMapDir.SE: return SMapDir.NW;
            case SMapDir.SW: return SMapDir.NE;
            case SMapDir.NE: return SMapDir.SW;
            default:
                break;
        }

        return null;
    }

    // 数字转换成方向
    public static dirPrase(dir: SMapDirNum): SMapDir {
        switch (dir) {
            case SMapDirNum.N: return SMapDir.N;
            case SMapDirNum.S: return SMapDir.S;
            case SMapDirNum.W: return SMapDir.W;
            case SMapDirNum.E: return SMapDir.E;
            case SMapDirNum.NW: return SMapDir.NW;
            case SMapDirNum.NE: return SMapDir.NE;
            case SMapDirNum.SW: return SMapDir.SW;
            case SMapDirNum.SE: return SMapDir.SE;
        }
        return null;
    }

    /**
     * 获取某个方向的连接
     * @param src 
     * @param dist 
     * @param dir 
     */
    public static connGet(data: SMapPlace, dir: SMapDir) {

        switch (dir) {
            case SMapDir.N: return data.n;
            case SMapDir.S: return data.s;
            case SMapDir.W: return data.w;
            case SMapDir.E: return data.e;
            case SMapDir.NW: return data.nw;
            case SMapDir.NE: return data.ne;
            case SMapDir.SW: return data.sw;
            case SMapDir.SE: return data.se;
            default:
                break;
        }

        return null;
    }

    /**
     * 检测 src 和 dist 是否存在连接，如果存在，返回对应的方向
     * @param src 
     * @param dist 
     */
    public static connCheck(src: SMapPlace, dist: SMapPlace) {

        if (src.n == dist._id) {
            return SMapDir.N;
        }
        if (src.w == dist._id) {
            return SMapDir.W;
        }
        if (src.s == dist._id) {
            return SMapDir.S;
        }
        if (src.e == dist._id) {
            return SMapDir.E;
        }
        if (src.nw == dist._id) {
            return SMapDir.NW;
        }
        if (src.ne == dist._id) {
            return SMapDir.NE;
        }
        if (src.sw == dist._id) {
            return SMapDir.SW;
        }
        if (src.se == dist._id) {
            return SMapDir.SE;
        }

        return null;
    }


    // 链接两个地点
    public static connOpen(src: SMapPlace, dist: SMapPlace, dir: SMapDir) {

        switch (dir) {
            case SMapDir.N:
                {
                    src.n = dist._id;
                    dist.s = src._id;
                }
                break;
            case SMapDir.S:
                {
                    src.s = dist._id;
                    dist.n = src._id;
                }
                break;
            case SMapDir.W:
                {
                    src.w = dist._id;
                    dist.e = src._id;
                }
                break;
            case SMapDir.E:
                {
                    src.e = dist._id;
                    dist.w = src._id;
                }
                break;
            case SMapDir.NW:
                {
                    src.nw = dist._id;
                    dist.se = src._id;
                }
                break;
            case SMapDir.SE:
                {
                    src.se = dist._id;
                    dist.nw = src._id;
                }
                break;
            case SMapDir.SW:
                {
                    src.sw = dist._id;
                    dist.ne = src._id;
                }
                break;
            case SMapDir.NE:
                {
                    src.ne = dist._id;
                    dist.sw = src._id;
                }
                break;

            default:
                break;
        }

    }

    // 断开两个点连接
    public static connClose(src: SMapPlace, dist: SMapPlace) {

        // 断开 src 链接
        if (src.n == dist._id) {
            src.n = undefined;
        }
        if (src.w == dist._id) {
            src.w = undefined;
        }
        if (src.s == dist._id) {
            src.s = undefined;
        }
        if (src.e == dist._id) {
            src.e = undefined;
        }
        if (src.nw == dist._id) {
            src.nw = undefined;
        }
        if (src.ne == dist._id) {
            src.ne = undefined;
        }
        if (src.sw == dist._id) {
            src.sw = undefined;
        }
        if (src.se == dist._id) {
            src.se = undefined;
        }

        // 断开 dist
        if (dist.n == src._id) {
            dist.n = undefined;
        }
        if (dist.w == src._id) {
            dist.w = undefined;
        }
        if (dist.s == src._id) {
            dist.s = undefined;
        }
        if (dist.e == src._id) {
            dist.e = undefined;
        }
        if (dist.nw == src._id) {
            dist.nw = undefined;
        }
        if (dist.ne == src._id) {
            dist.ne = undefined;
        }
        if (dist.sw == src._id) {
            dist.sw = undefined;
        }
        if (dist.se == src._id) {
            dist.se = undefined;
        }
    }

    // 随机获取一个跳转点
    public static getSkip(data: SMap) {

        let retPos: SMapPos = null;
        if (data && data.places) {

            for (let index = 0; index < data.places.length; index++) {
                const place = data.places[index];
                if (place.skip) {
                    retPos = {
                        map: data.name,
                        mapId: data._id,
                        place: place.name,
                        placeId: place._id,
                    }
                }
            }
        }

        return retPos;
    }
}

