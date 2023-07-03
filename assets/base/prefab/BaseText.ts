import { Button, Component, EventHandler, Label, Node, Size, Sprite, UITransform, Vec2, _decorator, director, instantiate, v2 } from 'cc';
import { BaseColor, BaseColorKey } from '../src/color';
import { BaseFontSize } from '../src/font';
import { Base } from './Base';
const { ccclass, property } = _decorator;


/**
 * 定义文本的显示样式
 * 
 * 注意：
 * 下划线 和背景颜色不要同时设置，否则下划线显示会不明显
 * 开启按钮功能，会自动设置下划线显示
 */
export type BaseTextStyle = {
    text: string;               // 文本内容
    type?: BaseTextType;        // 显示类型
    fontSize?: number;          // 字体大小
    color?: string;             // 文字颜色 (hex颜色，例如：'#FFFFFF')
    colorbg?: string;           // 背景颜色 (hex颜色，例如：'#FF00FF')

    anchor?: Vec2;              // 锚点
    size?: Size;                // 自定义显示大小，默认 null 表根据文字高度自动计算

    isBold?: boolean;           // 是否粗体
    isItalic?: boolean;         // 是否斜体
    isUnderline?: boolean;      // 是否显示下划线
}

/**
 * 文字显示类型
 * 横排显示  HORIZONTAL 
 * 竖排显示  VERTICAL
 */
export type BaseTextType = 'HORIZONTAL' | 'VERTICAL';



/**
 * 默认显示样式
 */
const DEF_STYLE: BaseTextStyle = {
    text: '基础文本',
    type: 'HORIZONTAL',                     // 默认水平显示文字
    fontSize: BaseFontSize.NOR,
    color: BaseColor.value('NOR'),          // 默认文字颜色
    anchor: v2(0.5, 0.5),
    size: null,
    isBold: false,
    isItalic: false,
    isUnderline: false,
}


/**
 * 基础文本封装 
 */
@ccclass('BaseText')
export class BaseText extends Component {

    //*************************************************************************************************************************************************/
    // static 方法

    /**
     * 加载一个 BaseText 文本对象，创建一个新的对象，需要在外部添加到目标对象
     */
    public static load(style?: BaseTextStyle) {

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
        const objN = instantiate(baseS.BaseText);
        const objS = objN.getComponent(BaseText);
        objS.init(style);
        return objN;
    }


    public static load2(text: string, color?: BaseColorKey, colorbg?: BaseColorKey, isUnderline?: boolean, fontSize?: number) {

        const style = BaseText.getStyle();

        style.text = text;

        if (color) style.color = BaseColor.value(color);
        if (colorbg) style.colorbg = BaseColor.value(colorbg);
        if (fontSize) style.fontSize = fontSize;
        if (isUnderline) style.isUnderline = isUnderline;

        return this.load(style);
    }

    /**
     * 返回默认的样式
     *（每次都创建一个新的返回，不要修改基础数据）
     */
    public static getStyle() {
        const style = { ...DEF_STYLE };
        return style;
    }



    //*************************************************************************************************************************************************/


    private m_style = BaseText.getStyle();


    /**
     * 初始化
     * @param style 显示样式
     */
    init(style?: BaseTextStyle) {
        if (style) {
            this.m_style = { ...this.m_style, ...style }
        }

        this.setStr(this.node.getChildByName('_text_'), this.m_style.text, this.m_style);

        // 存在背景颜色
        if (this.m_style.colorbg) {
            this.node.getComponent(Sprite).color = BaseColor.init2(this.m_style.colorbg);
            this.node.getComponent(Sprite).enabled = true;
        }
        else {
            this.node.getComponent(Sprite).enabled = false;
        }

        this.setAnchor(this.m_style.anchor);
        this.setTransform();
    }

    getText() {
        return this.m_style.text;
    }


    /**
     * 计算 label 文本的宽高 (实时计算)
     */
    getLabelTransform() {
        const textNode = this.node.getChildByName('_text_');

        // 必须刷新一次，才能获取最新设置的文本宽度 (此处用来实时计算最新的文本宽度)
        textNode.getComponent(Label).updateRenderData(true);
        return textNode.getComponent(UITransform);
    }


    /**
     * 得到当前节点的高度
     */
    getNodeHeight() {
        return this.node.getComponent(UITransform).height;
    }


    /**
     * 按钮点击回调函数
     * @param target 目标节点
     * @param component 组件名称 （脚本名称）
     * @param handle  回调函数名称
     * @param customEventData 自定义数据
     * 
     * @example
     * 
     *  const textN = BaseTextUtil.load2('小不点xx', 'HIY', null, 25);
        const textS = textN.getComponent(BaseText);
        textS.setClick(this.node, 'TestScene', 'onClickText', '111')
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

    /**
     * 设置文本内容
     * @param textN 
     * @param str 
     * @param style 
     */
    private setStr(textN: Node, str: string, style: BaseTextStyle) {

        const label = textN.getComponent(Label);

        if (style.type == 'HORIZONTAL') {
            label.overflow = Label.Overflow.NONE;
            textN.getComponent(UITransform).height = this.getLineHeight(this.m_style);

        }
        if (style.type == 'VERTICAL') {
            label.overflow = Label.Overflow.RESIZE_HEIGHT;
            textN.getComponent(UITransform).width = this.getLineWidth(this.m_style);
        }

        label.string = str;
        label.color = BaseColor.init2(this.m_style.color);
        label.fontSize = this.m_style.fontSize;
        label.lineHeight = this.getLineHeight(this.m_style);
        label.isBold = this.m_style.isBold;
        label.isItalic = this.m_style.isItalic;
        label.isUnderline = this.m_style.isUnderline;

    }


    private setTransform() {

        const transform = this.getLabelTransform();

        if (this.m_style.size) {
            this.setSize(this.m_style.size);
            return;
        }

        if (this.m_style.type == 'HORIZONTAL') {
            this.node.getComponent(UITransform).width = transform.width;     // 根据 label 大小设置
            this.node.getComponent(UITransform).height = this.getLineHeight(this.m_style);
        }

        if (this.m_style.type == 'VERTICAL') {
            this.node.getComponent(UITransform).height = transform.height;   // 根据 label 大小设置
            this.node.getComponent(UITransform).width = this.getLineWidth(this.m_style);
        }

    }

    /**
     * 自定义区域大小
     * @param size 
     */
    setSize(size: Size) {
        this.node.getComponent(UITransform).setContentSize(size);
    }


    /**
     * 计算行高
     */
    private getLineHeight(style: BaseTextStyle) {

        if (style.type == 'VERTICAL') {
            return (style.fontSize + 2);
        }

        return (style.fontSize + 5);
    }

    /**
     * 计算行宽
     * @param style 
     * @returns 
     */
    private getLineWidth(style: BaseTextStyle) {
        return (style.fontSize + 5);
    }

    setAnchor(anchor: Vec2) {
        if (anchor) {
            this.node.getComponent(UITransform).setAnchorPoint(anchor);
            this.node.getChildByName('_text_').getComponent(UITransform).setAnchorPoint(anchor);
        }
    }

}
