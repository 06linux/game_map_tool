import { Component, director, instantiate, Node, Size, size, UITransform, v3, _decorator, EventHandler, Button } from 'cc';
import { BCC } from '../src/bcc';
import { BaseColor } from '../src/color';
import { BaseFontSize } from '../src/font';
import { Base } from './Base';
import { BaseMark } from './BaseMark';
import { BaseMask } from './BaseMask';
import { BaseSpace } from './BaseSpace';
import { BaseText, BaseTextType } from './BaseText';
const { ccclass, property } = _decorator;



export type BaseButtonStyle = {
    text: string;                   // markText
    type?: BaseTextType;
    fontSize?: number;
    colorbg?: string;               // 背景颜色
    size?: Size;                    // 按钮大小，默认为 null ，使用文本大小动态计算    
    focus?: boolean;                // 是否显示焦点
    focusSize?: number;             // 焦点大小
    focusColor?: string;            // 焦点颜色
    focusAn?: boolean;              // 焦点动画效果
}

/**
 * 默认显示样式
 */
const DEF_STYLE: BaseButtonStyle = {
    text: '基础按钮',
    type: 'HORIZONTAL',                     // 默认水平显示文字
    fontSize: BaseFontSize.NOR,
    colorbg: BaseColor.value('BG_BTN'),
    size: null,

    focus: false,
    focusSize: 40,
    focusColor: 'ff0000',
    focusAn: false,
}


/**
 * 基础按钮
 */
@ccclass('BaseButton')
export class BaseButton extends Component {

    //*************************************************************************************************************************************************/
    // static 方法

    public static load(style?: BaseButtonStyle) {

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
        const objN = instantiate(baseS.BaseButton);
        const objS = objN.getComponent(BaseButton);
        objS.init(style);
        return objN;
    }


    //*************************************************************************************************************************************************/

    private m_style = { ...DEF_STYLE };
    private m_space: Node = null;


    /**
     * 初始化
     * @param style 显示样式
     */
    init(style?: BaseButtonStyle) {
        if (style) {
            this.m_style = { ...this.m_style, ...style }
        }

        const textN = BaseMark.load({ text: this.m_style.text, type: this.m_style.type, fontSize: this.m_style.fontSize });
        const textSize = textN.getComponent(UITransform).contentSize;
        const uiSize = (this.m_style.size && this.m_style.size.width > 0 && this.m_style.size.height > 0) ? this.m_style.size : size(textSize.width + 20, textSize.height + 15);
        const spaceN = BaseSpace.load({ size: uiSize, colorbg: this.m_style.colorbg, child: textN });
        const maskN = BaseMask.load({ size: uiSize, child: spaceN });

        this.node.addChild(maskN);
        this.m_space = spaceN;
        this.node.getComponent(UITransform).setContentSize(uiSize);
        this.setFoucs(this.m_style.focus, this.m_style.focusSize, this.m_style.focusColor);
    }

    getText() {
        return this.m_style.text;
    }

    /**
     * 按钮点击回调函数
     * @param target 目标节点
     * @param component 组件名称 （脚本名称）
     * @param handle  回调函数名称
     * @param customEventData 自定义数据
     * 
     * @example
         objS.setClick(this.node, 'TestScene', 'onClickText', '111')
    */
    setClick(target: Node, component: string, handle: string, customEventData: string = '') {

        const eventHandler = new EventHandler();
        eventHandler.target = target
        eventHandler.component = component;
        eventHandler.handler = handle;
        eventHandler.customEventData = customEventData;

        const button = this.node.getComponent(Button);
        button.enabled = true;
        button.clickEvents.push(eventHandler);
    }

    setFoucs(active: boolean, focusSize = DEF_STYLE.focusSize, color = DEF_STYLE.focusColor, focusAn = DEF_STYLE.focusAn) {

        if (active) {
            const uiSize = this.node.getComponent(UITransform);
            const textN = BaseText.load({ text: "●", fontSize: focusSize, color });
            const textSize = textN.getComponent(UITransform).contentSize;
            textN.name = '_focus_';
            textN.position = v3(uiSize.width / 2 - textSize.width / 4, uiSize.height / 2 - textSize.height / 5, 0);
            this.node.addChild(textN);

            if (focusAn) {
                BCC.fadeLoop(textN);
            }
        }
        else {
            const textN = this.node.getChildByName('_focus_');
            if (textN) {
                textN.destroy();
            }
        }
    }

}
