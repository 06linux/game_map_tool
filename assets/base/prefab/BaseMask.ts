import { Component, Graphics, Mask, Node, Size, Tween, UITransform, Widget, _decorator, director, instantiate, log, size, tween } from 'cc';
import { Base } from './Base';
const { ccclass, property } = _decorator;


export type BaseMaskStyle = {
    size: Size;                     // transform size 大小
    radius?: number;                // 圆角半径
    child?: Node;                   // 初始化的时候添加一个子节点
}

/**
 * 动效类型
 */
export type BaseMaskAnType = (
    | 'NONE'        // 不执行任何动画

    // 进入动画
    | 'IN_LEFT'                 // 左侧进入
    | 'IN_RIGHT'                // 右侧进入
    | 'IN_TOP'                  // 顶部进入
    | 'IN_BUTTOM'               // 底部进入
    | 'IN_X'                    // 水平展开（x轴）
    | 'IN_Y'                    // 垂直展开（x轴）
    | 'IN_XY'                   // XY展开  (从中心展开)

    // 退出动画
    | 'OUT_LEFT'
    | 'OUT_RIGHT'
    | 'OUT_TOP'
    | 'OUT_BUTTOM'
    | 'OUT_X'                    // 水平展开（x轴）
    | 'OUT_Y'                    // 垂直展开（x轴）
    | 'OUT_XY'                   // XY展开  (从中心展开)

);


/**
 * 动画效果
 */
export type BaseMaskAn = {
    type: BaseMaskAnType;       // 类型
    isRun?: boolean;            // 是否正在运行
}

/**
 * 默认样式定义
 */
const DEF_STYLE: BaseMaskStyle = {
    size: size(500, 500),
    radius: 15,
}

/**
 * 属性数据
 */
export type BaseMaskProp = {
    size: Size,                     // 当前显示大小
}

/**
 * 计算各种遮罩效果 
 */
@ccclass('BaseMask')
export class BaseMask extends Component {

    //****************************************************************************************************************/
    // 静态方法

    /**
     * 返回默认的样式
     */
    public static getStyle() {
        const style = { ...DEF_STYLE };
        return style;
    }

    /**
     * 加载一个填充区域
     * @param style 
     * @returns 
     */
    public static load(style: BaseMaskStyle) {

        const scene = director.getScene();
        if (scene == null) {
            return null;
        }

        const baseN = scene.getChildByName("Base");
        if (baseN == null) {
            return null;
        }
        const baseS = baseN.getComponent(Base) as Base;
        const objN = instantiate(baseS.BaseMask);
        const objS = objN.getComponent(BaseMask);
        objS.init(style);
        return objN;
    }


    //****************************************************************************************************************/


    private m_style: BaseMaskStyle = BaseMask.getStyle();

    private m_prop: BaseMaskProp = {
        size: DEF_STYLE.size,
    }

    private m_an: BaseMaskAn = {
        type: 'NONE',
        isRun: false,
    };

    /**
     * 初始化
     * @param style 
     */
    init(style?: BaseMaskStyle) {
        if (style) {
            this.m_style = { ...this.m_style, ...style };
        }

        this.m_prop.size = this.m_style.size.clone();
        this.initPrefab();
        this.draw();
    }

    private initPrefab() {
        this.getComponent(Mask).enabled = true;
        this.node.getComponent(UITransform).setContentSize(this.m_style.size);
        if (this.m_style.child) {
            this.node.addChild(this.m_style.child);
        }
    }


    /**
     * 绘制遮罩区域
     * @param style 
     */
    private draw() {

        const transform = this.node.getComponent(UITransform);
        const uiSize = this.m_style.size;
        const radius = this.m_style.radius;
        const currSize = this.m_prop.size;      // 当前显示大小
        const anchor = transform.anchorPoint;

        const g = this.getComponent(Graphics);
        g.clear();

        switch (this.m_an.type) {
            case 'IN_LEFT':
            case 'OUT_LEFT':
                g.roundRect(-uiSize.width * anchor.x, -uiSize.height * anchor.y, currSize.width, uiSize.height, radius);
                break;
            case 'IN_RIGHT':
            case 'OUT_RIGHT':
                g.roundRect(-uiSize.width * anchor.x + (uiSize.width - currSize.width), -uiSize.height * anchor.y, currSize.width, uiSize.height, radius);
                break;
            case 'IN_BUTTOM':
            case 'OUT_BUTTOM':
                g.roundRect(-uiSize.width * anchor.x, -uiSize.height * anchor.y, uiSize.width, currSize.height, radius);
                break;
            case 'IN_TOP':
            case 'OUT_TOP':
                g.roundRect(-uiSize.width * anchor.x, -uiSize.height * anchor.y + (uiSize.height - currSize.height), uiSize.width, currSize.height, radius);
                break;
            case 'IN_X':
            case 'IN_Y':
            case 'IN_XY':
            case 'OUT_X':
            case 'OUT_Y':
            case 'OUT_XY':
                g.roundRect(-currSize.width * anchor.x, -currSize.height * anchor.y, currSize.width, currSize.height, radius);
                break;

            case 'NONE':
            default:
                // 显示当前 ui 区域
                g.roundRect(-uiSize.width * anchor.x, -uiSize.height * anchor.y, uiSize.width, uiSize.height, radius);
                break;
        }

        g.stroke();
        g.fill();
    }


    /**
     * 启动动画
     * @param time 动画时间，单位：秒
     * 
     * 注意： 必须将对象添加到 canvas 上才能 调用  tween 要不然，编辑器预览会报错
     */
    startAn(type: BaseMaskAnType, time = 1) {

        if (type == 'NONE') return;

        this.m_an.type = type;
        this.m_an.isRun = true;

        let sizeStart = this.m_style.size.clone();
        let sizeEnd = this.m_style.size.clone();

        switch (this.m_an.type) {
            case 'IN_LEFT':
            case 'IN_RIGHT':
            case 'IN_X':
                sizeStart.width = 0;
                break;
            case 'IN_BUTTOM':
            case 'IN_TOP':
            case 'IN_Y':
                sizeStart.height = 0;
                break;
            case 'IN_XY':
                sizeStart.width = 0;
                sizeStart.height = 0;
                break;

            case 'OUT_LEFT':
            case 'OUT_RIGHT':
            case 'OUT_X':
                sizeEnd.width = 0;
                break;
            case 'OUT_BUTTOM':
            case 'OUT_TOP':
            case 'OUT_Y':
                sizeEnd.height = 0;
                break;
            case 'OUT_XY':
                sizeEnd.width = 0;
                sizeEnd.height = 0;
                break;

        }

        this.m_prop.size = sizeStart;

        this.draw();
        tween(this.m_prop)
            .to(
                time,
                { size: sizeEnd },
                {
                    easing: 'fade',
                    onUpdate: (target?: object, ratio?: number) => {
                        this.draw();
                    }
                },
            )
            .call(() => {
                this.m_an.isRun = false
            })
            .start();
    }


    /**
     * 停止动画
     */
    stopAn() {
        this.m_an.isRun = false;
        this.m_prop.size = this.m_style.size.clone();
        Tween.stopAllByTarget(this.m_prop);   // 修正停止失败bug
        
    }

    // 是否正在运行动画
    isRunAn() {
        return this.m_an.isRun;
    }

}
