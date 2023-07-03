import { Button, Component, director, Event, instantiate, log, Node, Size, size, Sprite, tween, UIOpacity, UITransform, v2, v3, Vec2, _decorator, Widget, Tween } from 'cc';
import { BCC } from '../src/bcc';
import { BaseColor } from '../src/color';
import { BaseStr } from '../src/str';
import { Base } from './Base';
import { BaseButton } from './BaseButton';
import { BaseLayout } from './BaseLayout';
import { BaseMark } from './BaseMark';
import { BaseMask } from './BaseMask';
import { BaseSpace } from './BaseSpace';
import { BaseFontSize } from '../src/font';
import { BaseText } from './BaseText';
const { ccclass, property } = _decorator;


/**
 * 显示样式
 */
export type BaseMenuStyle = {
    name?: string;                  // 菜单名称（唯一性，会将之前已经存在的同名称的菜单释放)
    lifetime?: number;              // 显示时间，单位：秒 （-1 表示永久显示)
    pos?: Vec2;                     // 显示位置（默认屏幕中间)
    size?: Size;                    // BaseMenu 大小 （默认全屏canvas大小)
    colorbg?: string;               // 背景的颜色 （null 表示不显示背景）

    freeType?: BaseMenuFreeType;    // 释放类型
    anInit?: boolean;               // 是否播放初始动效
    anFree?: boolean;               // 是否播放退出动效
    mask?: boolean;                 // 是否添加遮罩层（圆角遮罩）-- mask 大小使用添加的子菜单 node 大小
    tag?: string;                   // 标记位

    init?: boolean;                 // 是否调用脚本的初始化方法(默认初始化和预制体同名称的脚本 init 函数)
    initArg?: any;                  // 初始化参数（多个参数，使用数组传递）
}

export type BaseMenuFreeType = 'none' | 'click_bg';

/**
 * 默认的名称
 */
const DEF_NAME = '_base_menu_';

/**
 * 默认样式定义
 */
const DEF_STYLE: BaseMenuStyle = {
    name: DEF_NAME,
    lifetime: -1,
    pos: v2(0, 0),
    colorbg: '#000000C8',         // 黑色半透明
    size: null,                   // 默认全屏大小
    freeType: 'click_bg',         // 默认点击背景进行释放
    anInit: true,
    anFree: true,
    mask: false,
    tag: '_tag_',
}

/**
 * 自定义属性 (用来实现显示的动效)
 */
export type BaseMenuProp = {
    id: string;             // uuid
    opcity: number;         // 透明度, [0,255]  
    scale: number;          // 缩放
    lifetime: number;       // 当前生命周期，单位：秒（-1 表示不限制）
    isFree: boolean;        // 是否在执行释放
    isAn: boolean;          // 是否在执行动画
}



@ccclass('BaseMenu')
export class BaseMenu extends Component {


    //*************************************************************************************************************************************************/
    // static 方法

    /**
     * 返回默认的样式
     */
    public static getStyle() {
        const style = { ...DEF_STYLE };
        return style;
    }


    /**
     * 加载一个 node 对象
     * @param node 
     * @param style 
     */
    public static loadNode(node: Node, style?: BaseMenuStyle) {

        const baseN = director.getScene().getChildByName("Base");    // 场景中挂在的 base 对象
        const baseS = baseN ? baseN.getComponent(Base) : null;
        if (baseN == null || baseS.menu == null) {
            return null;
        }

        if (style && style.name && style.name != '') {
            BaseMenu.freeMenuByName(style.name);
        }

        // 初始化 baseMenu
        const baseMenuN = instantiate(baseS.BaseMenu);
        const baseMenuS = baseMenuN.getComponent(BaseMenu);
        baseMenuS.init(style);

        node.addComponent(Button);     // 添加一个按钮组件，遮挡点击背景点击区域

        if (style && style.mask) {
            const size = node.getComponent(UITransform).contentSize;
            baseMenuN.addChild(BaseMask.load({ size, child: node }));
        }
        else {
            baseMenuN.addChild(node);
        }

        baseS.menu.addChild(baseMenuN);
        return node;
    }


    /**
     * 加载一个预制体菜单
     * @param prefabName  预制体资源名称（不需要后缀）默认加载 asserts/resource/menu/下面的预制体
     * @param style  样式表
     * @param resPath 资源路径，从 asserts/resource/ 开始的相对路径
     * 
     * @example
     * const menu = await BaseMenu.loadP('LoginMenu'); 对应 asserts/resource/menu/LoginMen' 预制体 
     */
    public static async loadPrefab(prefabName: string, style?: BaseMenuStyle, resPath = 'menu') {

        const baseN = director.getScene().getChildByName("Base");    // 场景中挂在的 base 对象
        const baseS = baseN ? baseN.getComponent(Base) : null;
        if (baseN == null || baseS.menu == null) {
            return null;
        }

        // 加载预制体对象
        const menuN = await BCC.loadPrefab(`${resPath}/${prefabName}`);
        if (menuN == null) {
            return null;
        }

        if (style && style.name && style.name != '') {
            BaseMenu.freeMenuByName(style.name);
        }

        // 初始化 baseMenu
        const baseMenuN = instantiate(baseS.BaseMenu);
        const baseMenuS = baseMenuN.getComponent(BaseMenu);
        baseMenuS.init(style);

        menuN.addComponent(Button);     // 添加一个按钮组件，遮挡点击背景点击区域

        // 调用脚本初始化函数
        if (style && (style.init || style.initArg)) {
            const menuS = menuN.getComponent(prefabName) as any;
            if (style.initArg) {

                // 如果是数组，则展开，支持多个参数
                if (style.initArg instanceof Array) {
                    menuS.init(...style.initArg);
                }
                else {
                    menuS.init(style.initArg);
                }

            }
            else {
                menuS.init();
            }
        }

        if (style && style.mask) {
            const size = menuN.getComponent(UITransform).contentSize;
            baseMenuN.addChild(BaseMask.load({ size, child: menuN }));
        }
        else {
            baseMenuN.addChild(menuN);
        }

        baseS.menu.addChild(baseMenuN);
        return menuN;
    }


    public static getMenu(name: string, last = false) {

        if (name == null || name == '') return null;

        const baseN = director.getScene().getChildByName("Base");    // 场景中挂在的 base 对象
        const baseS = baseN ? baseN.getComponent(Base) : null;
        if (baseN == null || baseS.menu == null) {
            return null;
        }

        const parentN = baseS.menu;

        if (last) { // 反向遍历
            for (let index = parentN.children.length - 1; index >= 0; index--) {
                const objN = parentN.children[index];
                const objS = objN.getComponent(BaseMenu);
                if (objS && objS.getName() == name) {
                    return objN;
                }
            }
        }
        else {
            for (let index = 0; index < parentN.children.length; index++) {
                const objN = parentN.children[index];
                const objS = objN.getComponent(BaseMenu);
                if (objS && objS.getName() == name) {
                    return objN;
                }
            }
        }

        return null;
    }


    public static getMenuByTag(tag: string, last = false) {

        if (tag == null || tag == '') return null;

        const baseN = director.getScene().getChildByName("Base");    // 场景中挂在的 base 对象
        const baseS = baseN ? baseN.getComponent(Base) : null;
        if (baseN == null || baseS.menu == null) {
            return null;
        }

        const parentN = baseS.menu;
        if (last) { // 反向遍历
            for (let index = parentN.children.length - 1; index >= 0; index--) {
                const objN = parentN.children[index];
                const objS = objN.getComponent(BaseMenu);
                if (objS && objS.getTag() == tag) {
                    return objN;
                }
            }
        }
        else {
            for (let index = 0; index < parentN.children.length; index++) {
                const objN = parentN.children[index];
                const objS = objN.getComponent(BaseMenu);
                if (objS && objS.getTag() == tag) {
                    return objN;
                }
            }
        }

        return null;
    }




    /**
     * 释放一个菜单对象
     * @param node  baseMenu 或者 baseMenu child 对象
     * @returns 
     */
    public static freeMenu(node: Node) {
        if (node == null) return;

        // menu
        const nodeS = node.getComponent(BaseMenu);  // 挂在 BaseMenu 脚本组件
        if (nodeS) {
            nodeS.free();
            return;
        }

        // BaseMenu->Menu
        if (node.parent) {
            const parentS = node.parent.getComponent(BaseMenu);
            if (parentS) {
                parentS.free();
                return;
            }
        }

        // BaseMenu->BaseMask->Menu
        if (node.parent.parent) {
            const parentS = node.parent.parent.getComponent(BaseMenu);
            if (parentS) {
                parentS.free();
                return;
            }
        }

    }

    /**
     * 释放所有名称相同的菜单
     * @param name 
     * @returns 
     */
    public static freeMenuByName(name: string) {

        if (name == null || name == '') return;

        const baseN = director.getScene().getChildByName("Base");    // 场景中挂在的 base 对象
        const baseS = baseN ? baseN.getComponent(Base) : null;
        if (baseN == null || baseS.menu == null) {
            return null;
        }

        const parentN = baseS.menu;

        // 释放所有同名的其他菜单
        for (let index = 0; index < parentN.children.length; index++) {
            const objN = parentN.children[index];
            const objS = objN.getComponent(BaseMenu);
            if (objS && objS.getName() == name) {
                objS.free();
            }
        }

    }

    /**
     * 释放所有 tag 相同的菜单
     * @param tag 
     * @returns 
     */
    public static freeMenuByTag(tag: string) {

        if (tag == null || tag == '') return;

        const baseN = director.getScene().getChildByName("Base");    // 场景中挂在的 base 对象
        const baseS = baseN ? baseN.getComponent(Base) : null;
        if (baseN == null || baseS.menu == null) {
            return null;
        }

        const parentN = baseS.menu;

        // 释放所有符合标记的菜单
        for (let index = 0; index < parentN.children.length; index++) {
            const objN = parentN.children[index];
            const objS = objN.getComponent(BaseMenu);
            if (objS && objS.getTag() == tag) {
                objS.free();
            }
        }

    }

    // 清除所弹出菜单
    public static freeAll() {
        const baseN = director.getScene().getChildByName("Base");    // 场景中挂在的 base 对象
        const baseS = baseN ? baseN.getComponent(Base) : null;
        if (baseN == null || baseS.menu == null) {
            return null;
        }

        const parentN = baseS.menu;

        parentN.destroyAllChildren();
        parentN.removeAllChildren();

    }


    /**
     * 统计个数
     * @param tag 
     * @returns 
     */
    public static getMenuCount(tag: string) {

        if (tag == null || tag == '') return 0;

        const baseN = director.getScene().getChildByName("Base");    // 场景中挂在的 base 对象
        const baseS = baseN ? baseN.getComponent(Base) : null;
        if (baseN == null || baseS.menu == null) {
            return null;
        }

        const parentN = baseS.menu;

        let retCount = 0;
        for (let index = 0; index < parentN.children.length; index++) {
            const objN = parentN.children[index];
            const objS = objN.getComponent(BaseMenu);
            if (objS && objS.getTag() == tag) {
                retCount++;
            }
        }

        return retCount;
    }

    /**
     * 显示一个提示信息
     * @param markText 
     */
    public static showMsg(markText: string, colorbg = BaseColor.value('BG_NOR')) {

        const tag = '_base_msg_';

        const uiSize = size(400, 60);
        const pos = v2(0, 400);
        const markN = BaseMark.load({ text: markText, fontSize: BaseFontSize.TITLE });
        const markSize = markN.getComponent(UITransform).contentSize;

        const oldN = BaseMenu.getMenuByTag(tag, true);
        if (oldN) {
            pos.y = Math.max(-200, oldN.position.y);
            // log('pos', pos);
        }

        uiSize.width = Math.max(uiSize.width, markSize.width + 50);
        uiSize.height = Math.max(uiSize.height, markSize.height + 30);
        pos.y -= (uiSize.height + 15);

        const time = 2;

        const menuN = BaseMenu.loadNode(markN, {
            lifetime: time,
            size: uiSize,
            colorbg,
            pos,
            tag,
            anFree: false,
            freeType: 'none',
        });

        tween(menuN.parent).delay(time / 2).call(() => BCC.fadeOut(menuN.parent, time / 2)).start();
    }

    public static showMsg2(text: string, color: string = BaseColor.value('NOR'), colorbg = BaseColor.value('BG_NOR')) {

        const tag = '_base_msg_';

        const uiSize = size(400, 60);
        const pos = v2(0, 400);
        const textN = BaseText.load({ text: text, fontSize: BaseFontSize.TITLE, color });
        const textSize = textN.getComponent(UITransform).contentSize;

        const oldN = BaseMenu.getMenuByTag(tag, true);
        if (oldN) {
            pos.y = Math.max(-200, oldN.position.y);
            // log('pos', pos);
        }

        uiSize.width = Math.max(uiSize.width, textSize.width + 50);
        uiSize.height = Math.max(uiSize.height, textSize.height + 30);
        pos.y -= (uiSize.height + 15);

        const time = 2;
        const menuN = BaseMenu.loadNode(textN, {
            lifetime: time,
            size: uiSize,
            colorbg,
            pos,
            tag,
            anFree: false,
            freeType: 'none',
        });

        tween(menuN.parent).delay(time / 2).call(() => BCC.fadeOut(menuN.parent, time / 2)).start();
    }

    /**
     * 显示一个错误信息
     * @param markText 
     */
    public static showError(markText: string) {
        this.showMsg(markText, BaseColor.value('RED'));
    }

    public static showSuccess(markText: string) {
        this.showMsg(markText, BaseColor.value('GRN'));
    }


    /**
     * 显示一个确定对话框
     */
    public static showDialog(markText: string, ok = '确定', cancel = '取消', freeType: BaseMenuFreeType = 'click_bg') {

        return new Promise(resolve => {

            const markN = BaseMark.load({ text: markText });
            const markSize = markN.getComponent(UITransform).contentSize;

            const uiSize = size(460, 260);
            uiSize.width = Math.max(markSize.width + 100, uiSize.width);
            uiSize.height = Math.max(markSize.height + 200, uiSize.height);

            const btns = [];
            let btnCancel: Node = null;
            if (cancel && cancel != '') {
                btnCancel = BaseButton.load({ size: size(150, 60), text: cancel });
                btns.push(btnCancel);
            }

            const btnOK = BaseButton.load({ size: size(150, 60), text: (ok && ok != '') ? ok : '确定' });
            btns.push(btnOK);

            const layoutN = BaseLayout.loadV([markN, BaseLayout.loadH(btns, 50),], 60);
            const spaceN = BaseSpace.load({ size: uiSize, colorbg: BaseColor.value('BG_PANEL'), child: layoutN });
            const maskN = BaseMask.load({ size: uiSize, child: spaceN });
            const menuN = BaseMenu.loadNode(maskN, { freeType });

            const baseMenuN = menuN.parent;
            const baseMenuS = baseMenuN.getComponent(BaseMenu);
            if (btnCancel) {
                btnCancel.getComponent(BaseButton).setClick(baseMenuN, 'BaseMenu', 'onButtonClick', cancel);
            }
            if (btnOK) {
                btnOK.getComponent(BaseButton).setClick(baseMenuN, 'BaseMenu', 'onButtonClick', ok);
            }

            baseMenuS.onFinshi = (cmd: string) => {
                resolve(cmd);
            }
        });
    }


    //*************************************************************************************************************************************************/

    private m_style: BaseMenuStyle = BaseMenu.getStyle();

    private m_prop: BaseMenuProp = {
        id: BaseStr.uidInvite10(),
        opcity: 255,
        scale: 1,
        lifetime: -1,
        isFree: false,
        isAn: false,
    }

    /**
     * 初始化
     * @param style 
     */
    init(style?: BaseMenuStyle) {
        if (style) {
            this.m_style = { ...this.m_style, ...style };
        }

        this.m_prop.lifetime = this.m_style.lifetime;
        this.initPrefab(this.m_style);

        // 初始动画
        if (this.m_style.anInit) {

            this.m_prop.isAn = true;
            this.m_prop.opcity = 10;
            this.m_prop.scale = 0.96;
            this.node.getComponent(UIOpacity).opacity = this.m_prop.opcity;
            this.node.setScale(v3(this.m_prop.scale, this.m_prop.scale, 1));

            // 进入动画
            tween(this.m_prop)
                .to(
                    0.3,
                    { opcity: 255, scale: 1 },
                    {
                        easing: 'fade',
                        onUpdate: () => {
                            this.node.getComponent(UIOpacity).opacity = this.m_prop.opcity;
                            this.node.setScale(v3(this.m_prop.scale, this.m_prop.scale, 1));
                        }
                    }
                )
                .call(() => {
                    this.m_prop.isAn = false;
                })
                .start();
        }

    }

    /**
     * 是否菜单
     */
    free() {
        if (this.m_prop.isFree) return;

        if (this.m_style.anFree) {
            this.m_prop.isFree = true;
            this.m_prop.isAn = true;

            Tween.stopAllByTarget(this.m_prop);
            tween(this.m_prop).stop();
            tween(this.m_prop)
                .to(
                    0.3,
                    { opcity: 1, scale: 0.96 },
                    {
                        easing: 'fade',
                        onUpdate: () => {
                            this.node.getComponent(UIOpacity).opacity = this.m_prop.opcity;
                            this.node.setScale(v3(this.m_prop.scale, this.m_prop.scale, 1));
                        }
                    })
                .call(() => {
                    this.m_prop.isAn = false;
                    this.node.destroyAllChildren();
                    this.node.removeAllChildren();
                    this.node.destroy();
                })
                .start();
        }
        else {
            this.node.destroyAllChildren();
            this.node.removeAllChildren();
            this.node.destroy();
        }
    }

    private initPrefab(style: BaseMenuStyle) {

        if (style.size) {
            this.node.getComponent(Widget).enabled = false;     // 自定义大小，取消 widget 全屏
            this.node.getComponent(UITransform).setContentSize(style.size);
        }

        this.node.name = style.name;
        this.node.position = v3(style.pos.x, style.pos.y, 0);

        const bgN = this.node.getChildByName('_bg_');
        if (bgN) {
            if (style.colorbg) {
                bgN.getComponent(Sprite).color = BaseColor.init2(style.colorbg);
            }
            else {
                bgN.active = false;
                bgN.removeFromParent();
                bgN.destroy();  // 不使用背景
            }
        }

    }

    update(deltaTime: number) {
        if (this.m_prop.lifetime > 0) {
            this.m_prop.lifetime -= deltaTime;
            if (this.m_prop.lifetime <= 0) {
                this.free();
            }
        }
    }


    // 点击背景
    private onClickBg() {
        log('BaseMenu.onClickBg');
        if (this.m_style.freeType == 'click_bg') {
            this.free();
        }
    }

    getId() {
        return this.m_prop.id;
    }

    getName() {
        return this.m_style.name;
    }

    getTag() {
        return this.m_style.tag;
    }

    // 确认按钮绑定
    onButtonClick(event: Event, cmd: string) {
        this.onFinshi(cmd);
        BaseMenu.freeMenu(this.node);
    }

    // 结束回调
    public onFinshi = (cmd: string) => { };

}


