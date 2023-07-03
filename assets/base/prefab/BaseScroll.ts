import { Component, Node, ScrollView, UITransform, v3, _decorator } from 'cc';
const { ccclass, property } = _decorator;


/**
 * 滚动显示 （直接拖拽到编辑器进行编辑）
 */
@ccclass('BaseScroll')
export class BaseScroll extends Component {

    @property({ type: Node })
    m_content: Node = null;        // 内容显示对象，所有需要显示的对象都添加到此节点中

    onLoad() {
        this.initPrefab();
    }

    private initPrefab() {

        const transform = this.node.getComponent(UITransform);
        const uiSize = transform.contentSize;
        this.m_content.getComponent(UITransform).contentSize = uiSize;
    }


    // 添加一个节点
    public addNode(node: Node) {
        this.m_content.addChild(node);
    }

    public clearAll() {
        this.m_content.destroyAllChildren();
    }

    public toTop(second = 0) {
        const scrollV = this.node.getComponent(ScrollView);
        scrollV.scrollToTop(second);
    }

    public stopAutoScroll(second = 0) {
        const scrollV = this.node.getComponent(ScrollView);
        scrollV.stopAutoScroll();
    }


    public toButtom(second = 0) {
        const scrollV = this.node.getComponent(ScrollView);
        scrollV.scrollToBottom(second);
    }

}
