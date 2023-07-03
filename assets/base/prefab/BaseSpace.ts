import { Button, Component, director, EventHandler, instantiate, Node, Prefab, size, Size, Sprite, UITransform, v2, Vec2, _decorator } from 'cc';
import { BaseColor } from '../src/color';
import { Base } from './Base';
const { ccclass, property } = _decorator;


// 矩形边界样式
export type BaseSpaceRectType = (
    | 'ReacA1'
    | 'ReacA2'
    | 'ReacA3'
    | 'ReacA4'
    | 'ReacA5'
    | 'ReacA6'
    | 'ReacB1'
    | 'ReacB2'
    | 'ReacB3'
    | 'ReacB4'
    | 'ReacB5'
    | 'ReacB6'
    | 'ReacB7'
)

export type BaseSpaceStyle = {
    size: Size,
    anchor?: Vec2;
    colorbg?: string;               // 颜色(背景颜色)
    child?: Node;                   // 初始化的时候添加一个子节点

    rectType?: BaseSpaceRectType;
}

/**
 * 默认样式定义
 */
const DEF_STYLE: BaseSpaceStyle = {
    size: size(200, 200),
    anchor: v2(0.5, 0.5),

    rectType: null,
}


/**
 * 用来填充空间
 */
@ccclass('BaseSpace')
export class BaseSpace extends Component {

    //*************************************************************************************************************************************************/
    // static 方法


    /**
     * 加载一个填充区域
     * @param style 
     * @returns 
     */
    public static load(style: BaseSpaceStyle) {

        const scene = director.getScene();
        if (scene == null) {
            return null;
        }

        const baseN = scene.getChildByName("Base");
        if (baseN == null) {
            return null;
        }
        const baseS = baseN.getComponent(Base) as Base;
        const objN = instantiate(baseS.BaseSpace);
        const objS = objN.getComponent(BaseSpace);
        objS.init(style);

        return objN;
    }

    /**
     * 返回默认的样式
     */
    public static getStyle() {
        const style = { ...DEF_STYLE };
        return style;
    }


    //*************************************************************************************************************************************************/

    @property({ type: Prefab })
    public m_ReacA1: Prefab = null;
    @property({ type: Prefab })
    public m_ReacA2: Prefab = null;
    @property({ type: Prefab })
    public m_ReacA3: Prefab = null;
    @property({ type: Prefab })
    public m_ReacA4: Prefab = null;
    @property({ type: Prefab })
    public m_ReacA5: Prefab = null;
    @property({ type: Prefab })
    public m_ReacA6: Prefab = null;
    @property({ type: Prefab })
    public m_ReacB1: Prefab = null;
    @property({ type: Prefab })
    public m_ReacB2: Prefab = null;
    @property({ type: Prefab })
    public m_ReacB3: Prefab = null;
    @property({ type: Prefab })
    public m_ReacB4: Prefab = null;
    @property({ type: Prefab })
    public m_ReacB5: Prefab = null;
    @property({ type: Prefab })
    public m_ReacB6: Prefab = null;
    @property({ type: Prefab })
    public m_ReacB7: Prefab = null;


    private m_style: BaseSpaceStyle = BaseSpace.getStyle();

    /**
     * 初始化
     * @param style 
     */
    init(style?: BaseSpaceStyle) {
        if (style) {
            this.m_style = { ...this.m_style, ...style };
        }
        this.initPrefab();
    }

    private initPrefab() {

        const transform = this.node.getComponent(UITransform);
        transform.width = this.m_style.size.width;
        transform.height = this.m_style.size.height;

        if (this.m_style.anchor) {
            transform.setAnchorPoint(this.m_style.anchor);
        }

        if (this.m_style.colorbg) {
            this.node.getComponent(Sprite).enabled = true;
            this.node.getComponent(Sprite).color = BaseColor.init2(this.m_style.colorbg);
        }

        if (this.m_style.rectType) {

            let bgRect: Node = null;

            switch (this.m_style.rectType) {
                case 'ReacA1': bgRect = instantiate(this.m_ReacA1); break;
                case 'ReacA2': bgRect = instantiate(this.m_ReacA2); break;
                case 'ReacA3': bgRect = instantiate(this.m_ReacA3); break;
                case 'ReacA4': bgRect = instantiate(this.m_ReacA4); break;
                case 'ReacA5': bgRect = instantiate(this.m_ReacA5); break;
                case 'ReacA6': bgRect = instantiate(this.m_ReacA6); break;

                case 'ReacB1': bgRect = instantiate(this.m_ReacB1); break;
                case 'ReacB2': bgRect = instantiate(this.m_ReacB2); break;
                case 'ReacB3': bgRect = instantiate(this.m_ReacB3); break;
                case 'ReacB4': bgRect = instantiate(this.m_ReacB4); break;
                case 'ReacB5': bgRect = instantiate(this.m_ReacB5); break;
                case 'ReacB6': bgRect = instantiate(this.m_ReacB6); break;
                case 'ReacB7': bgRect = instantiate(this.m_ReacB7); break;

                default:
                    break;
            }

            if (bgRect) {
                bgRect.name = '_base_rect_';
                bgRect.getComponent(UITransform).setContentSize(transform.contentSize);     // buf fix (必须设置大小，要不然，在菜单弹出是，会出现闪烁画面)
                this.node.addChild(bgRect);
            }
        }

        if (this.m_style.child) {
            this.node.addChild(this.m_style.child);
        }
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

    setColorbg(colorbg: string) {
        this.m_style.colorbg = colorbg;
        if (colorbg) {
            this.node.getComponent(Sprite).enabled = true;
            this.node.getComponent(Sprite).color = BaseColor.init2(this.m_style.colorbg);
        } else {
            this.node.getComponent(Sprite).enabled = false;
        }
    }
}

