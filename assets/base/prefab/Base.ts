import { _decorator, Component, Node, Prefab, director } from 'cc';
const { ccclass, property } = _decorator;


/**
 * base 模块用到的预制体组件
 * 需要将此 预制体挂在到 scene 根路径下面
 */

@ccclass('Base')
export class Base extends Component {

    @property({ type: Prefab })
    public BaseText: Prefab = null;

    @property({ type: Prefab })
    public BaseMark: Prefab = null;

    @property({ type: Prefab })
    public BaseSpace: Prefab = null;

    @property({ type: Prefab })
    public BaseLayout: Prefab = null;

    @property({ type: Prefab })
    public BaseMask: Prefab = null;

    @property({ type: Prefab })
    public BaseMusic: Prefab = null;

    @property({ type: Prefab })
    public BaseMenu: Prefab = null;

    @property({ type: Prefab })
    public BaseProgress: Prefab = null;

    @property({ type: Prefab })
    public BaseLoading: Prefab = null;

    @property({ type: Prefab })
    public BaseScroll: Prefab = null;

    @property({ type: Prefab })
    public BaseButton: Prefab = null;


    /**
     * ui分层绑定 
     * 需要 绑定当前场景中的  UI 节点
     */
    @property({ type: Node })
    public menu: Node = null;             // menu 层默认加载到此处

    @property({ type: Node })
    public loading: Node = null;          // loading 界面使用，要保证 loading 层在最上面


    /**
     * 游戏中所有的音乐节点，统一添加到 '_music_'子节点
     * @param objN 
     * 
     * 备注： BaseMusic 节点，必须添加到场景中，才能正常播放
     */
    addMusic(objN: Node) {
        this.node.getChildByName('_music_').addChild(objN);
    }

    /**
     * 清除所有音乐节点
     */
    clearMusic() {
        this.node.getChildByName('_music_').destroyAllChildren();
    }

}

