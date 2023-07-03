import { Component, ProgressBar, Size, Sprite, UITransform, Vec2, _decorator, director, instantiate, log, size, tween, v2, v3 } from 'cc';
import { BaseColor } from '../src/color';
import { Base } from './Base';
const { ccclass, property } = _decorator;


export type BaseProgressType = 'HORIZONTAL' | 'VERTICAL';

export type BaseProgressStyle = {
    type?: BaseProgressType;        // 显示方式
    size?: Size;                    // 显示大小
    anchor?: Vec2;                  // 锚点
    color?: string;                 // 进度条颜色
    colorbg?: string;               // 背景颜色
    reverse?: boolean;              // 是否反向
    progressInit?: number;          // 初始进度 [0,1]
}


/**
 * 默认显示样式
 */
const DEF_STYLE: BaseProgressStyle = {
    type: 'HORIZONTAL',                     // 默认水平显示
    size: size(100, 50),
    anchor: v2(0.5, 0.5),
    color: BaseColor.value('RED'),
    colorbg: BaseColor.value('BG_NOR'),
    progressInit: 0.5,
    reverse: false,
}

/**
 * 进度条封装 
 */
@ccclass('BaseProgress')
export class BaseProgress extends Component {

    //*************************************************************************************************************************************************/
    // static 方法

    public static load(style?: BaseProgressStyle) {

        const scene = director.getScene();
        if (scene == null) {
            return null;
        }

        // 场景中挂在的 base 对象
        const baseN = scene.getChildByName("Base");
        if (baseN == null) {
            return null;
        }

        const baseS = baseN.getComponent(Base) as Base;
        const objN = instantiate(baseS.BaseProgress);
        const objS = objN.getComponent(BaseProgress);
        objS.init(style);
        return objN;

    }


    //*************************************************************************************************************************************************/

    private m_style = { ...DEF_STYLE };

    private m_prop = {
        daoJiShi: 0,          // 倒计时秒
    }

    /**
     * 初始化
     */
    init(style?: BaseProgressStyle) {

        if (style) {
            this.m_style = { ...this.m_style, ...style }
        }
        this.initPrefab();
    }

    private initPrefab() {

        const uiSize = this.m_style.size;
        const uiAnchor = this.m_style.anchor;

        this.node.getComponent(UITransform).anchorPoint = this.m_style.anchor;
        this.node.getComponent(UITransform).setContentSize(uiSize);

        if (this.m_style.colorbg) {
            this.node.getComponent(Sprite).enabled = true;
            this.node.getComponent(Sprite).color = BaseColor.init2(this.m_style.colorbg);
        }
        else {
            this.node.getComponent(Sprite).enabled = false;
        }

        const barN = this.node.getChildByName('_bar_');
        const barAnchor = v2(0.5, 0.5);                         // 进度条锚点        
        barN.getComponent(UITransform).setContentSize(uiSize);
        barN.getComponent(UITransform).setAnchorPoint(barAnchor);
        barN.getComponent(Sprite).color = BaseColor.init2(this.m_style.color);
        barN.position = v3(0 - uiSize.width * (uiAnchor.x - barAnchor.x), 0 - uiSize.height * (uiAnchor.y - barAnchor.y), 0);


        const progressBar = this.node.getComponent(ProgressBar);
        if (this.m_style.type == 'HORIZONTAL') {
            progressBar.mode = ProgressBar.Mode.HORIZONTAL;
            progressBar.totalLength = uiSize.width;
        }

        if (this.m_style.type == 'VERTICAL') {
            progressBar.mode = ProgressBar.Mode.VERTICAL;
            progressBar.totalLength = uiSize.height;
        }

        progressBar.progress = this.m_style.progressInit;
        progressBar.reverse = this.m_style.reverse;
    }

    /**
     * 设置进度条
     * @param progress 取值范围 [0,1]
     */
    setProgress(progress: number) {
        this.node.getComponent(ProgressBar).progress = progress;
    }

    /**
     * 返回进度
     * @returns 取值范围 [0,1]
     */
    getProgress() {
        return this.node.getComponent(ProgressBar).progress;
    }

    /**
     * 开始动画
     * @param time 时间长度，单位：秒 
     * @param time 时间长度，单位：秒 
     */
    startAn(time: number, progress: number) {

        this.stopAn();

        const progressBar = this.node.getComponent(ProgressBar);
        tween(progressBar).to(time, { progress }).start();

        this.m_prop.daoJiShi = time;
        tween(this.m_prop).to(time, { daoJiShi: 0 }).start();
    }

    stopAn() {
        const progressBar = this.node.getComponent(ProgressBar);
        tween(progressBar).stop();
        tween(this.m_prop).stop();

        this.m_prop.daoJiShi = 0;
    }

    getDaoJiShi() {
        return this.m_prop.daoJiShi;
    }

}