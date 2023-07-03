import { Button, Component, director, EventHandler, instantiate, Layout, Node, Prefab, UITransform, v3, _decorator, size, tween, log, v2, Tween } from 'cc';
import { BaseColor, BaseColorKey } from '../src/color';
import { BaseFontSize } from '../src/font';
import { Base } from './Base';
import { BaseText, BaseTextType } from './BaseText';
import { BaseMask } from './BaseMask';
const { ccclass, property } = _decorator;


/**
 * 每一行的间隔
 */
const LINE_SPACE = 5;


/**
 * 标记文本，支持多行，支持背景颜色
 * 默认左侧对齐 每一行的锚点（0， 0.5）
 * 
 * 
 * 标记说明：
 * 
 * $BR$ 换行
 * 
 * $RED$ 表示文字颜色，红色
 * $NOR$ 清除文字颜色，使用默认颜色
 * 
 * $BRED$ 表示背景颜色，红色
 * $BNOR$ 清除背景颜色，背景不在显示
 * 
 * $BO$ 开启粗体
 * $BX$ 关闭粗体
 * 
 * $IO$ 开启斜体
 * $IX$ 关闭斜体
 * 
 * $UO$ 开启下划线
 * $UX$ 关闭下划线
 * 
 */


/**
 * 竖排文字的显示方向
 */
export enum BaseMarkDir {
    /**
     * @zh 从左往右排列。
     */
    LEFT_TO_RIGHT = 0,
    /**
     * @zh 从右往左排列。
     */
    RIGHT_TO_LEFT = 1
}


export type BaseMarkStyle = {
    text: string;               // 标记文本(支持自定义颜色关键字)，举例： 我用$BBLK$$HIR$金蛇剑$NOR$$BNOR$砍向张三丰
    type?: BaseTextType;        // 显示类型
    fontSize?: number;          // 字体大小
    limitWidth?: number;        // 限制宽度， (汉字的个数，限制一行显示多少个汉字，超过数量则自动换行, 0 表示不限制) 
    dir?: BaseMarkDir;          // 竖排文字排列方向
}

/**
 * 默认显示样式
 */
const DEF_STYLE: BaseMarkStyle = {
    text: "$RED$标记文本",
    type: 'HORIZONTAL',                     // 默认水平显示文字
    fontSize: BaseFontSize.NOR,
    limitWidth: 0,
    dir: BaseMarkDir.RIGHT_TO_LEFT,         // 从左到右
}


@ccclass('BaseMark')
export class BaseMark extends Component {

    //*************************************************************************************************************************************************/
    // static 方法


    /**
     * 加载一个标记文本对象
     * const node = BaseMark.load({text: `$HIY$[按钮]`});
     */
    public static load(style?: BaseMarkStyle) {

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
        const objN = instantiate(baseS.BaseMark);
        const objS = objN.getComponent(BaseMark);
        objS.init(style);
        return objN;
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



    @property({ type: Prefab })
    private m_baseText: Prefab = null;                  // BaseText 预制体

    @property({ type: Node })
    private m_markNode: Node = null;                    // 所有 line 数据统一添加到此节点


    private m_text = 'MarkText';                        // 标记文本(支持自定义颜色关键字)，举例： 我用$BBLK$$HIR$金蛇剑$NOR$$BNOR$砍向张三丰
    private m_styleText = BaseText.getStyle();          // 文字样式
    private m_styleMark = BaseMark.getStyle();          // 标记样式


    private m_line: Node = null;                        //  当前指向的行
    private m_TextNDemo: Node = null;                   // 临时加载一个文字，用来计算宽高

    init(style?: BaseMarkStyle) {

        if (style) {
            this.m_styleMark = { ...this.m_styleMark, ...style };
            this.m_styleText.fontSize = this.m_styleMark.fontSize;
            this.m_styleText.type = this.m_styleMark.type;
            this.m_text = this.m_styleMark.text;
        }

        {
            this.m_TextNDemo = instantiate(this.m_baseText);
            const objScript = this.m_TextNDemo.getComponent(BaseText);
            objScript.init({ ...this.m_styleText, text: '测试' });
        }

        this.initPrefab();
        this.parse();
        this.initTransfrom();
    }

    // 设置文本
    setText(style?: BaseMarkStyle) {

        this.clearAll();
        this.init(style);
    }

    getText() {
        return this.m_text;
    }

    // 根据方向更新预制体属性
    private initPrefab() {

        if (this.m_styleText.type == 'HORIZONTAL') {

            const anchorX = 0;
            const anchorY = 0.5;

            {
                const layout = this.m_markNode.getComponent(Layout);
                layout.resizeMode = Layout.ResizeMode.CONTAINER;
                layout.type = Layout.Type.VERTICAL;
                layout.verticalDirection = Layout.VerticalDirection.TOP_TO_BOTTOM;
                layout.spacingY = LINE_SPACE;

                const transform = this.m_markNode.getComponent(UITransform);
                transform.anchorX = anchorX;
                transform.anchorY = anchorY;
            }

            {
                const layout = this.node.getChildByName('_line_').getComponent(Layout);
                layout.resizeMode = Layout.ResizeMode.CONTAINER;
                layout.type = Layout.Type.HORIZONTAL;
                layout.horizontalDirection = Layout.HorizontalDirection.LEFT_TO_RIGHT;

                const transform = this.node.getChildByName('_line_').getComponent(UITransform);
                transform.anchorX = anchorX;
                transform.anchorY = anchorY;
                transform.height = this.getTextHeight();
            }
        }

        if (this.m_styleText.type == 'VERTICAL') {

            const anchorX = 0.5;
            const anchorY = 1;

            {
                const layout = this.m_markNode.getComponent(Layout);
                layout.resizeMode = Layout.ResizeMode.CONTAINER;
                layout.type = Layout.Type.HORIZONTAL;
                layout.horizontalDirection = this.m_styleMark.dir as any;
                layout.spacingX = LINE_SPACE * 2;

                const transform = this.m_markNode.getComponent(UITransform);
                transform.anchorX = anchorX;
                transform.anchorY = anchorY;
            }

            {
                const layout = this.node.getChildByName('_line_').getComponent(Layout);
                layout.resizeMode = Layout.ResizeMode.CONTAINER;
                layout.type = Layout.Type.VERTICAL;
                layout.verticalDirection = Layout.VerticalDirection.TOP_TO_BOTTOM;

                const transform = this.node.getChildByName('_line_').getComponent(UITransform);
                transform.anchorX = anchorX;
                transform.anchorY = anchorY;
                transform.width = this.getTextWidth();
            }
        }


    }

    // 更新 transfrom
    private initTransfrom() {

        const width = this.getWidth();
        const height = this.getHeight();

        this.node.getComponent(UITransform).width = width;
        this.node.getComponent(UITransform).height = height;

        if (this.m_styleText.type == 'HORIZONTAL') {
            this.m_markNode.getComponent(UITransform).width = width;
            this.m_markNode.position = v3(-width / 2, 0, 0);
        }

        if (this.m_styleText.type == 'VERTICAL') {
            this.m_markNode.getComponent(UITransform).height = height;
            this.m_markNode.position = v3(0, height / 2, 0);
        }
    }


    /**
     * 按钮点击回调函数
     * @param target 目标节点
     * @param component 组件名称 （脚本名称）
     * @param handle  回调函数名称
     * @param customEventData 自定义数据
     * 
     * 举例：
     * markText.getComponent(BaseMark).setClick(this.node, BUtil.getType(this), 'onMenuClick', cmd);
     * markText.getComponent(BaseMark).setClick(this.node, 'BagMenu', 'onClick', bag._id);
     * 
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


    private clearAll() {
        this.m_markNode.destroyAllChildren();
    }

    /**
     * 计算宽度
     */
    private getWidth() {
        let width = 0;

        // 横排，选择最宽的一行作为当前组件宽度 
        if (this.m_styleText.type == 'HORIZONTAL') {
            for (let index = 0; index < this.m_markNode.children.length; index++) {
                const child = this.m_markNode.children[index];
                const limitWidth = this.getLineWdithSum(child);
                width = Math.max(width, limitWidth);
            }
        }

        // 竖排，将所有宽度相加
        if (this.m_styleText.type == 'VERTICAL') {
            const layout = this.m_markNode.getComponent(Layout);
            if (this.m_markNode.children.length > 0) {
                width = this.m_markNode.children.length * this.getTextWidth();
                if (this.m_markNode.children.length > 2) {
                    width += (layout.spacingX * (this.m_markNode.children.length - 1));
                }
                width += layout.paddingLeft;
                width += layout.paddingRight;
            }
        }

        return width;
    }

    /**
     * 所有行中， （显示）
     */
    private getHeight() {

        let height = 0;

        // 横排，将所有的高度相加
        if (this.m_styleText.type == 'HORIZONTAL') {
            const layout = this.m_markNode.getComponent(Layout);
            if (this.m_markNode.children.length > 0) {
                height = this.m_markNode.children.length * this.getTextHeight();
                if (this.m_markNode.children.length > 2) {
                    height += (layout.spacingY * (this.m_markNode.children.length - 1));
                }
                height += layout.paddingTop;
                height += layout.paddingBottom;
            }
        }

        // 竖排,选择最高的一行作为当前组件宽度
        if (this.m_styleText.type == 'VERTICAL') {
            for (let index = 0; index < this.m_markNode.children.length; index++) {
                const child = this.m_markNode.children[index];
                const limitWidth = this.getLineHeighSum(child);
                height = Math.max(height, limitWidth);
            }
        }

        return height;
    }


    private getLineWdithSum(objLine: Node) {
        let retWidth = 0;
        for (let index = 0; index < objLine.children.length; index++) {
            const objText = objLine.children[index];
            retWidth += objText.getComponent(UITransform).width;
        }
        return retWidth;
    }

    private getLineHeighSum(objLine: Node) {
        let retHeight = 0;
        for (let index = 0; index < objLine.children.length; index++) {
            const objText = objLine.children[index];
            retHeight += objText.getComponent(UITransform).height;
        }
        return retHeight;
    }


    /**
     * 获取第一个元素，计算高度
     * @returns 
     */
    private getTextHeight() {
        if (this.m_TextNDemo) {
            return this.m_TextNDemo.getComponent(UITransform).height;
        }
        return 0;
    }

    // 获取第一个元素，宽度
    private getTextWidth() {
        if (this.m_TextNDemo) {
            return this.m_TextNDemo.getComponent(UITransform).width;
        }
        return 0;
    }


    // 计算一行中 文本的个数
    private getLineTextLength(objLine: Node) {
        let retLen = 0;
        for (let index = 0; index < objLine.children.length; index++) {
            const objText = objLine.children[index];
            retLen += objText.getComponent(BaseText).getText().length;
        }
        return retLen;
    }

    // 初始化新的一行
    private initLine() {
        const objNode = instantiate(this.node.getChildByName('_line_'));
        objNode.active = true;
        objNode.name = 'line';

        this.m_markNode.addChild(objNode);
        return objNode;
    }

    // 解析文本
    public parse() {

        this.clearAll();

        const text2 = this.m_text.replace(/\r\n|\n/g, '$BR$');  //  替换所有换行  
        const arrText = text2.split('$');
        // console.log('BaseMark.parse, arrText', arrText);

        this.m_line = this.initLine();

        for (let i = 0; i < arrText.length; i++) {
            const currText = arrText[i];
            if (currText == "") {
                continue;
            }

            // 换行
            if (currText == 'BR') {
                this.m_line = this.initLine();
                continue;
            }

            // 开启粗体
            if (currText == 'BO') {
                this.m_styleText.isBold = true;
                continue;
            }

            // 关闭粗体
            if (currText == 'BX') {
                this.m_styleText.isBold = false;
                continue;
            }

            // 开启斜体
            if (currText == 'IO') {
                this.m_styleText.isItalic = true;
                continue;
            }

            // 关闭斜体
            if (currText == 'IX') {
                this.m_styleText.isItalic = false;
                continue;
            }

            // 开启下划线
            if (currText == 'UO') {
                this.m_styleText.isUnderline = true;
                continue;
            }

            // 关闭下划线
            if (currText == 'UX') {
                this.m_styleText.isUnderline = false;
                continue;
            }


            // 清除背景颜色
            if (currText == 'BNOR') {
                this.m_styleText.colorbg = null;
                continue;
            }

            // 文字颜色
            if (BaseColor.has(currText)) {
                this.m_styleText.color = BaseColor.value(currText as BaseColorKey);
                continue;
            }

            // 背景颜色
            const currText2 = currText.substring(1);
            if (currText[0] == 'B' && BaseColor.has(currText2)) {  // 背景颜色 
                this.m_styleText.colorbg = BaseColor.value(currText2 as any);
                continue;
            }

            this.praseText(currText);
        }
    }


    /**
     * 解析文本字符串，如果超过 width 则换行显示
     * @param text 
     */
    private praseText(text: string) {

        // 限制宽度，超过宽度后，自动换行
        if (this.m_styleMark.limitWidth > 0) {
            const maxWidth = Math.max(1, Math.floor(this.m_styleMark.limitWidth));       // 一行显示文字的个数

            let subIndex = 0;
            for (let index = 0; index < 1000; index++) {

                if (subIndex >= text.length) {
                    break;
                }

                //  当前可以使用的宽度
                let limitWidth = maxWidth - this.getLineTextLength(this.m_line);

                // 换行
                if (limitWidth <= 0) {
                    this.m_line = this.initLine();
                    limitWidth = maxWidth;
                }

                const width = Math.min(limitWidth, text.length - subIndex);
                const subTxt = text.substring(subIndex, subIndex + width);

                subIndex += width;

                const objNode = instantiate(this.m_baseText);
                const objScript = objNode.getComponent(BaseText);

                objScript.init({ ...this.m_styleText, text: subTxt });
                this.m_line.addChild(objNode);
            }
        }
        else {
            const objNode = instantiate(this.m_baseText);
            const objScript = objNode.getComponent(BaseText);
            objScript.init({ ...this.m_styleText, text });
            this.m_line.addChild(objNode);
        }
    }

    /**
     * 播放动画 (文字展开动画)
     */
    startAn() {

        const arrMask = [] as Node[];

        if (this.m_styleText.type == 'HORIZONTAL') {

            const arrLine = [...this.m_markNode.children];

            let deltaTime = 0;

            // 初始化 arrMask 节点
            for (let index = 0; index < arrLine.length; index++) {
                const lineN = arrLine[index];
                const width = this.getLineWdithSum(lineN);
                const height = this.getTextHeight();

                lineN.removeFromParent();

                const maskN = BaseMask.load({ size: size(width, height), child: lineN });

                lineN.setPosition(v3(-width / 2, 0));   //  每行字的默认锚点是 0， 需要偏移一下
                maskN.setPosition(v3(width / 2, 0));   //  每行字的默认锚点是 0， 需要偏移一下

                lineN.active = false;
                this.m_markNode.addChild(maskN);

                const speed = 500;
                const time = width / speed;

                tween(maskN).delay(deltaTime).call(() => {
                    lineN.active = true;
                    maskN.getComponent(BaseMask).startAn('IN_LEFT', time);
                }).start();

                deltaTime += time;
            }
        }

        if (this.m_styleText.type == 'VERTICAL') {


        }
    }

    // 停止动画
    stopAn() {
        const arrLine = [...this.m_markNode.children];
        for (let index = 0; index < arrLine.length; index++) {
            const maskN = arrLine[index];
            const maskS = maskN.getComponent(BaseMask);
            if (maskS) {
                Tween.stopAllByTarget(maskN);
                maskS.stopAn();
            }

        }

    }
}
