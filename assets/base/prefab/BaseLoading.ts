import { Component, director, instantiate, log, Node, size, tween, UITransform, _decorator } from 'cc';
import { BCC } from '../src/bcc';
import { BaseColor } from '../src/color';
import { BaseFontSize } from '../src/font';
import { Base } from './Base';
import { BaseLayout } from './BaseLayout';
import { BaseMark } from './BaseMark';
import { BaseMask, BaseMaskAnType } from './BaseMask';
import { BaseSpace } from './BaseSpace';
import { BaseTextType } from './BaseText';
const { ccclass, property } = _decorator;


export type BaseLoadingStyle = {
    markText?: string;          // 显示的提示信息
    textType?: BaseTextType;    // 文本显示类型

    anIn?: BaseMaskAnType;      // 进入动画 
    anOut?: BaseMaskAnType;     // 退出动画 
    anTime?: number;            // 动画时间
    switchScene?: string;       // 对应要切换的场景名称 （如果配置，则执行场景切换）
    colorbg?: string;           // 背景颜色 （默认和摄像机颜色保持一致）
    free?: boolean;             // 释放自己 (播放完成动画后是否释放自己)
}


/**
 * 默认显示样式
 */
const DEF_STYLE: BaseLoadingStyle = {
    markText: `$BRED$道德经$BNOR$\n\n道可道\n非常道\n名可名\n非常名\n无名天地之始\n有名万物之母\n故常无欲\n以观其妙\n常有欲\n以观其徼\n此两者\n同出而异名\n同谓之玄\n玄之又玄\n众妙之门`,
    textType: 'VERTICAL',
    anIn: 'IN_LEFT',
    anOut: 'OUT_LEFT',
    anTime: 1.8,
    switchScene: null,
    colorbg: BaseColor.value('BG_CAMERA'),
    free: true,
}


const LOAD_NAME = '_BaseLoading_';           // 加载界面对象的名称

/**
 * 基础文本封装 
 */
@ccclass('BaseLoading')
export class BaseLoading extends Component {

    //*************************************************************************************************************************************************/
    // static 方法

    /**
     * 加载 loading 节点
     * @param markText 文本内容, 显示一些提示信息
     */
    public static load(style?: BaseLoadingStyle) {

        const baseN = director.getScene().getChildByName("Base");    // 场景中挂在的 base 对象
        const baseS = baseN ? baseN.getComponent(Base) : null;
        if (baseN == null || baseS.loading == null) {
            return null;
        }

        const objN = instantiate(baseS.BaseLoading);
        const objS = objN.getComponent(BaseLoading);

        objN.name = LOAD_NAME;
        objS.init(style);

        baseS.loading.addChild(objN);
        return objN;
    }


    /**
     * 获取加载界面
     * @param parent 
     * @returns 
     */
    public static get() {

        const baseN = director.getScene().getChildByName("Base");    // 场景中挂在的 base 对象
        const baseS = baseN ? baseN.getComponent(Base) : null;
        if (baseN == null || baseS.loading == null) {
            return null;
        }

        return baseS.loading.getChildByName(LOAD_NAME);
    }


    public static clear() {

        const baseN = director.getScene().getChildByName("Base");    // 场景中挂在的 base 对象
        const baseS = baseN ? baseN.getComponent(Base) : null;
        if (baseN == null || baseS.loading == null) {
            return null;
        }

        baseS.loading.destroyAllChildren();
    }


    //*************************************************************************************************************************************************/

    private m_mask: Node = null;
    private m_style: BaseLoadingStyle = { ...DEF_STYLE };

    /**
     * 初始化
     */
    init(style?: BaseLoadingStyle) {

        if (style) {
            this.m_style = { ...this.m_style, ...style };
        }

        // 切换场景必须有进入动画
        if (this.m_style.switchScene) {
            if (this.m_style.anIn == null) {
                this.m_style.anIn = 'IN_Y';
            }
        }

        const size = BCC.canvasSize();
        const textN = this.initText(this.m_style.markText, this.m_style.textType);
        const progressN = this.initProgress();
        const layoutN = BaseLayout.loadV([textN, progressN], 50);
        const spaceN = BaseSpace.load({ size, colorbg: this.m_style.colorbg, child: layoutN });
        const maskN = BaseMask.load({ size, radius: 0, child: spaceN });
        this.m_mask = maskN;
        this.node.addChild(maskN);

        this.initAn();
    }

    /**
     * 释放自己
     */
    free() {
        this.node.active = false;
        this.stopAn();
        this.node.destroyAllChildren();
        this.node.destroy();
    }

    // 提示文本
    private initText(text: string, type: BaseTextType) {
        const textN = BaseMark.load({ text, fontSize: BaseFontSize.TITLE, type });
        const textSize = textN.getComponent(UITransform).contentSize;
        const showSize = size(textSize.width + 30, textSize.height + 30);
        const spaceN = BaseSpace.load({ size: showSize, colorbg: BaseColor.value('BG_NOR'), child: textN });
        const maskN = BaseMask.load({ size: showSize, child: spaceN });
        return maskN;
    }


    // 加载进度
    private initProgress() {
        const showSize = size(800, 60);
        const text = `资源加载中...`;
        const textN = BaseMark.load({ text, fontSize: BaseFontSize.TITLE, type: 'HORIZONTAL' });
        const spaceN = BaseSpace.load({ size: showSize, colorbg: BaseColor.value('BG_NOR'), child: textN });
        const maskN = BaseMask.load({ size: showSize, child: spaceN });

        BCC.fadeLoop(textN);
        return maskN;
    }

    /**
     * 初始化动画
     */
    private initAn() {
        if (this.m_mask == null) return;

        const maskS = this.m_mask.getComponent(BaseMask);

        // 需要切换场景
        if (this.m_style.switchScene) {

            tween(this.node)
                .call(() => { maskS.startAn(this.m_style.anIn, this.m_style.anTime) })
                .delay(this.m_style.anTime)
                .call(() => {

                    director.preloadScene(this.m_style.switchScene, (err: Error) => {
                        if (err) {
                            log('Error! BaseLoading', this.m_style.switchScene, err);
                            this.free();
                        }
                        else {
                            director.loadScene(this.m_style.switchScene);
                        }
                    });

                })
                .start();

        }
        else if (this.m_style.anIn && this.m_style.anOut) {
            // 播放进入和退出动画之后，就释放退出
            tween(this.node)
                .call(() => { maskS.startAn(this.m_style.anIn, this.m_style.anTime) })
                .delay(this.m_style.anTime)
                .call(() => { maskS.startAn(this.m_style.anOut, this.m_style.anTime) })
                .delay(this.m_style.anTime)
                .call(() => {

                    if (this.m_style.free) {
                        this.free();
                    }
                })
                .start();
        }
        else if (this.m_style.anIn) {
            tween(this.node)
                .call(() => { maskS.startAn(this.m_style.anIn, this.m_style.anTime) })
                .delay(this.m_style.anTime)
                .call(() => {
                    if (this.m_style.free) {
                        this.free();
                    }
                })
                .start();

        }
        else if (this.m_style.anOut) {
            tween(this.node)
                .call(() => { maskS.startAn(this.m_style.anOut, this.m_style.anTime) })
                .delay(this.m_style.anTime)
                .call(() => {
                    if (this.m_style.free) {
                        this.free();
                    }
                })
                .start();
        }
        else {
            tween(this.node)
                .delay(this.m_style.anTime)
                .call(() => {
                    if (this.m_style.free) {
                        this.free();
                    }
                })
                .start();
        }
    }

    stopAn() {
        if (this.m_mask) {
            this.m_mask.getComponent(BaseMask).stopAn();
        }
    }


    playAn(type: BaseMaskAnType, time: number, free = false) {

        if (this.m_mask == null) return;
        const maskS = this.m_mask.getComponent(BaseMask);

        tween(this.node)
            .call(() => { maskS.startAn(type, time) })
            .delay(time)
            .call(() => {
                if (free) {
                    this.free();
                }
            })
            .start();
    }

    // 增加一个按钮，防止点击穿透
    onClick() {
        log('BaseLoading.onClick, 点击按下');
    }

}
