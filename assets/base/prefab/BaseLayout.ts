import { Component, director, instantiate, Layout, UITransform, _decorator, Node, Size, size } from 'cc';
import { Base } from './Base';
const { ccclass, property } = _decorator;


/**
 * 布局类型
 */
export type BaseLayoutLayoutType = 'HORIZONTAL' | 'VERTICAL' | 'GRID';
export type BaseLayoutLayoutResizeMode = 'CHILDREN' | 'CONTAINER' | 'NONE';

export type BaseLayoutStyle = {

    type?: BaseLayoutLayoutType;       // 布局 （null 表示不使用布局）
    gridCol?: number;             // 网格每行限制多少列
    paddingLeft?: number;         // 边距
    paddingRight?: number;        // 边距
    paddingTop?: number;          // 边距
    paddingButtom?: number;       // 边距
    spacingX?: number;            // 间隔
    spacingY?: number;            // 间隔

    size?: Size;                   // 可以设置 size 大小，设置 size 后，resizeMode 会自动设置为 NONE
    resizeMode?: BaseLayoutLayoutResizeMode;

    childs?: Node[];                // 初始化的时候添加多个节点
}

/**
 * 默认样式定义
 */
const DEF_STYLE: BaseLayoutStyle = {
    type: 'HORIZONTAL',
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingButtom: 0,
    spacingX: 0,
    spacingY: 0,
    gridCol: 2,           // 网格默认 2列

    resizeMode: 'CONTAINER',
    size: null,
}


@ccclass('BaseLayout')
export class BaseLayout extends Component {

    //*************************************************************************************************************************************************/
    // static 方法

    /**
     * 返回默认的样式
     */
    public static getStyle() {
        const style = { ...DEF_STYLE };
        return style;
    }

    public static load(style?: BaseLayoutStyle) {
        const scene = director.getScene();
        if (scene == null) {
            return null;
        }

        const baseN = scene.getChildByName("Base");
        if (baseN == null) {
            return null;
        }
        const baseS = baseN.getComponent(Base) as Base;
        const objN = instantiate(baseS.BaseLayout);
        const objS = objN.getComponent(BaseLayout);
        objS.init(style);
        return objN;
    }


    /**
     * 加载一个网格
     * @param col 限制一行中显示的列数
     * @param spacingX x 间距
     * @param spacingY y 间距
     * @returns 
     * 
     * @example
     *      loadGrid(10)  网格布局，每行中限制 10 列
     *      loadGrid(1)  列布局，每行限制 1列（竖排显示）
     * 
     *      同时配合 loadSpace 可以实现 table 布局中每一个列占用的不同宽度比例
     */
    public static loadGrid(col: number, childs?: Node[], spacingX = 10, spacingY = 10) {
        return BaseLayout.load({
            type: 'GRID',
            gridCol: Math.max(1, col),
            spacingX: spacingX,
            spacingY: spacingY,
            childs,
        });
    }


    /**
     * 水平布局 (X方向)
     */
    public static loadH(childs?: Node[], spacingX = 10) {
        return BaseLayout.load({
            type: 'HORIZONTAL',
            spacingX: spacingX,
            childs,
        });
    }


    /**
     * 垂直布局（Y方向）
     */
    public static loadV(childs?: Node[], spacingY = 10) {
        return BaseLayout.load({
            type: 'VERTICAL',
            spacingY: spacingY,
            childs,
        });
    }





    //*************************************************************************************************************************************************/

    private m_style: BaseLayoutStyle = BaseLayout.getStyle();

    /**
     * 注点：函数的调用顺序，先调用 init ，在显示之前调用 start()
     */
    start() {

        const layout = this.node.getComponent(Layout);

        if (this.m_style.resizeMode == 'CONTAINER') {
            if (this.m_style.type == 'HORIZONTAL') {
                let height = this.getChildMaxHeight();
                if (this.node.children.length > 0) {
                    if (this.node.children.length > 2) {
                        height += (layout.spacingY * (this.node.children.length - 1));
                    }
                    height += layout.paddingTop;
                    height += layout.paddingBottom;
                }
                this.node.getComponent(UITransform).height = height;

            }

            if (this.m_style.type == 'VERTICAL') {

                let width = this.getChildMaxWdith();
                if (this.node.children.length > 0) {
                    if (this.node.children.length > 2) {
                        width += (layout.spacingX * (this.node.children.length - 1));
                    }
                    width += layout.paddingLeft;
                    width += layout.paddingRight;
                }

                this.node.getComponent(UITransform).width = width;
            }

            if (this.m_style.type == 'GRID') {

                let width = this.getChildMaxWdithByGrid(this.m_style.gridCol);
                if (this.node.children.length > 0) {
                    if (this.node.children.length > this.m_style.gridCol) {
                        width += (layout.spacingX * (this.m_style.gridCol - 1));
                    }
                    else if (this.node.children.length > 2) {
                        width += (layout.spacingX * (this.node.children.length - 1));
                    }

                    width += layout.paddingLeft;
                    width += layout.paddingRight;
                }

                this.node.getComponent(UITransform).width = width;
            }
        }

    }


    /**
     * 初始化
     * @param style 
     */
    init(style?: BaseLayoutStyle) {
        if (style) {
            this.m_style = { ...this.m_style, ...style };
        }
        this.initPrefab(this.m_style);
    }

    private initPrefab(style: BaseLayoutStyle) {

        if (style.size) {
            this.m_style.resizeMode = 'NONE';
            this.node.getComponent(UITransform).setContentSize(style.size);
        }

        const layout = this.node.getComponent(Layout);
        layout.enabled = true;

        if (this.m_style.type == 'HORIZONTAL') layout.type = Layout.Type.HORIZONTAL;
        if (this.m_style.type == 'VERTICAL') layout.type = Layout.Type.VERTICAL;
        if (this.m_style.type == 'GRID') layout.type = Layout.Type.GRID;

        if (this.m_style.resizeMode == 'NONE') layout.resizeMode = Layout.ResizeMode.NONE;
        if (this.m_style.resizeMode == 'CONTAINER') layout.resizeMode = Layout.ResizeMode.CONTAINER;
        if (this.m_style.resizeMode == 'CHILDREN') layout.resizeMode = Layout.ResizeMode.CHILDREN;

        layout.verticalDirection = Layout.VerticalDirection.TOP_TO_BOTTOM;
        layout.horizontalDirection = Layout.HorizontalDirection.LEFT_TO_RIGHT;

        layout.spacingX = this.m_style.spacingX;
        layout.spacingY = this.m_style.spacingY;
        layout.paddingLeft = this.m_style.paddingLeft;
        layout.paddingRight = this.m_style.paddingRight;
        layout.paddingTop = this.m_style.paddingTop;
        layout.paddingBottom = this.m_style.paddingButtom;

        // 网格约束列数
        if (this.m_style.type == 'GRID') {
            layout.constraint = Layout.Constraint.FIXED_COL;
            layout.constraintNum = this.m_style.gridCol;
        }

        if (this.m_style.childs) {
            for (let index = 0; index < this.m_style.childs.length; index++) {
                const objN = this.m_style.childs[index];
                this.node.addChild(objN);
            }
        }
    }


    getChildMaxWdith() {

        let width = 0;
        for (let index = 0; index < this.node.children.length; index++) {
            const child = this.node.children[index];
            width = Math.max(width, child.getComponent(UITransform).width);
        }
        return width;

    }


    getChildMaxHeight() {
        let height = 0;
        for (let index = 0; index < this.node.children.length; index++) {
            const child = this.node.children[index];
            height = Math.max(height, child.getComponent(UITransform).height);
        }
        return height;
    }


    getChildMaxWdithByGrid(col: number) {

        let width = 0;
        let index = 0;
        while (true) {

            if (index >= this.node.children.length) {
                break;
            }

            let lineWidth = 0;
            for (let i = 0; i < col; i++) {
                if (index >= this.node.children.length) {
                    break;
                }

                const child = this.node.children[index];
                lineWidth += child.getComponent(UITransform).width
                index++;
            }

            width = Math.max(width, lineWidth);
        }
        return width;
    }

    /**
     * Layout 设置后的结果需要到下一帧才会更新，除非你设置完以后手动调用 updateLayout 
     * 
     * 引擎 有 bug ，刷新也不会更新
     */
    updateLayout() {
        this.node.getComponent(Layout).updateLayout(true);
        // console.log('updateLayout xxx');
    }
}
