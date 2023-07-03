

/**
 * 环境配置
 */
export class BaseConfig {

    public static readonly GAME_NAME = '地图工具';
    public static readonly GAME_VER = 'V1.0.0';
    public static readonly GAME_ID = 'game_map_tool';


    public static readonly DEBUG_MODE = false;               // 调试模式，正式打包需要注释


    /**
     * 开发环境配置
     */
    // public static readonly SERVER_HTTP = 'http://localhost:8000';                    // http 请求地址 
    // public static readonly SERVER_BSOCKET = 'http://localhost:8000/bsocket';         // websocket 链接地址 
    public static readonly SERVER_HTTP = 'http://192.168.0.146:8000';                   // http 请求地址 
    public static readonly SERVER_BSOCKET = 'http://192.168.0.146:8000/bsocket';        // qsocket 链接地址 


    public static readonly pageSize = 20;

}


// 主题配置