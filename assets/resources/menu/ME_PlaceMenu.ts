import { Component, Event, EventKeyboard, Input, KeyCode, Node, Toggle, _decorator, input, size } from 'cc';
import { BCC, BaseColor, BaseEvent, BaseLayout, BaseMask, BaseMenu, BaseSpace, BaseStr, BaseText } from '../../base';
import { ME_MapEdit } from '../../game/ME_MapEdit';
import { ME_Place } from '../../game/ME_Place';
import { SMapPlace } from '../../src/s_map';
const { ccclass, property } = _decorator;

/**
 * 地点详情菜单
 */
@ccclass('ME_PlaceMenu')
export class ME_PlaceMenu extends Component {

    // 绑定属性
    @property({ type: Node })
    m_EditName: Node = null;

    @property({ type: Node })
    m_EditDesc: Node = null;

    @property({ type: Node })
    m_Args: Node = null;

    @property({ type: Node })
    m_EditColor: Node = null;

    @property({ type: Node })
    m_EditColorBg: Node = null;

    @property({ type: Node })
    m_toggleFade: Node = null;

    @property({ type: Node })
    m_skipInfo: Node = null;

    @property({ type: Node })
    m_idInfo: Node = null;

    @property({ type: Node })
    m_dir: Node = null;

    m_place: Node = null;           // 地点节点
    m_data: SMapPlace = null;       // 地点中的数据信息

    onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        BaseEvent.on('ME_PlaceMenu.refresUI', this.refresUI, this);
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        BaseEvent.off('ME_PlaceMenu.refresUI', this.refresUI, this);

        if (this.m_place) {
            this.m_place.getComponent(ME_Place).setData(this.m_data);
            this.m_place.getComponent(ME_Place).setFocus(true);
        }
    }

    init(place: Node) {
        this.m_place = place;
        this.m_data = place.getComponent(ME_Place).getData();

        BCC.setLabel(this.m_idInfo, this.m_data._id);
        BCC.setEditBox(this.m_EditName, this.m_data.name);
        BCC.setEditBox(this.m_EditDesc, this.m_data.desc);
        BCC.setEditBox(this.m_Args, this.m_data.args);
        BCC.setEditBox(this.m_EditColor, this.m_data.color);
        BCC.setEditBox(this.m_EditColorBg, this.m_data.colorbg);

        this.m_toggleFade.getComponent(Toggle).isChecked = this.m_data.fadeLoop;

        this.initDirInfo();
        this.refresUI();
    }

    refresUI() {
        {
            if (this.m_data.skip) {
                BCC.setLabel(this.m_skipInfo, `${this.m_data.skip.map}-${this.m_data.skip.place}`);
            }
            else {
                BCC.setLabel(this.m_skipInfo, `无`);
            }
        }
    }

    // 初始化方向信息
    initDirInfo() {

        if (ME_MapEdit.Instance == null) return;

        const btnSize = size(150, 150);
        const btns = [];

        this.m_dir.destroyAllChildren();
        this.m_dir.removeAllChildren();

        {
            const placeN = ME_MapEdit.Instance.placeGet(this.m_data.nw);
            const placeD = placeN ? placeN.getComponent(ME_Place).getData() : null;
            btns.push(this.loadDirNode(placeD));
        }

        {
            const placeN = ME_MapEdit.Instance.placeGet(this.m_data.n);
            const placeD = placeN ? placeN.getComponent(ME_Place).getData() : null;
            btns.push(this.loadDirNode(placeD));
        }

        {
            const placeN = ME_MapEdit.Instance.placeGet(this.m_data.ne);
            const placeD = placeN ? placeN.getComponent(ME_Place).getData() : null;
            btns.push(this.loadDirNode(placeD));
        }

        {
            const placeN = ME_MapEdit.Instance.placeGet(this.m_data.w);
            const placeD = placeN ? placeN.getComponent(ME_Place).getData() : null;
            btns.push(this.loadDirNode(placeD));
        }

        {
            btns.push(this.loadDirNode(this.m_data));
        }

        {
            const placeN = ME_MapEdit.Instance.placeGet(this.m_data.e);
            const placeD = placeN ? placeN.getComponent(ME_Place).getData() : null;
            btns.push(this.loadDirNode(placeD));
        }

        {
            const placeN = ME_MapEdit.Instance.placeGet(this.m_data.sw);
            const placeD = placeN ? placeN.getComponent(ME_Place).getData() : null;
            btns.push(this.loadDirNode(placeD));
        }

        {
            const placeN = ME_MapEdit.Instance.placeGet(this.m_data.s);
            const placeD = placeN ? placeN.getComponent(ME_Place).getData() : null;
            btns.push(this.loadDirNode(placeD));
        }

        {
            const placeN = ME_MapEdit.Instance.placeGet(this.m_data.se);
            const placeD = placeN ? placeN.getComponent(ME_Place).getData() : null;
            btns.push(this.loadDirNode(placeD));
        }

        const layoutN = BaseLayout.loadGrid(3, btns);
        this.m_dir.addChild(layoutN);
    }

    loadDirNode(data: SMapPlace) {
        const uiSize = size(150, 150);
        if (data) {
            const textN = BaseText.load({ text: data.name, color: data.color });
            const spaceN = BaseSpace.load({ size: uiSize, child: textN, colorbg: data.colorbg });
            const maskN = BaseMask.load({ size: uiSize, child: spaceN });
            return maskN;
        }
        else {
            const spaceN = BaseSpace.load({ size: uiSize, colorbg: BaseColor.value('BG_MENU') });
            const maskN = BaseMask.load({ size: uiSize, child: spaceN });
            return maskN;
        }
    }


    onNameChange(value: string) {
        this.m_data.name = value;
        this.initDirInfo();
    }

    onDescChange(value: string) {
        this.m_data.desc = value;
    }

    onArgsChange(value: string) {
        this.m_data.args = value;
    }

    onColorChange(value: string) {
        this.m_data.color = value;
        this.initDirInfo();
    }

    onColorBgChange(value: string) {
        this.m_data.colorbg = value;
        this.initDirInfo();
    }

    onKeyDown(event: EventKeyboard) {

        if (BaseMenu.getMenu('ME_NpcPickMenu') ||
            BaseMenu.getMenu('ME_ItemPickMenu') ||
            BaseMenu.getMenu('ME_DropPickMenu') ||
            BaseMenu.getMenu('ME_SkipPickMenu')
        ) {
            return;
        }

        switch (event.keyCode) {
            case KeyCode.SPACE:
            case KeyCode.ESCAPE:
                {
                    BaseMenu.freeMenu(this.node);
                }
                break;
        }

    }

    async onButtonClick(event: Event, cmd: string) {
        if (cmd == 'npc') {
            BaseMenu.loadPrefab('ME_NpcPickMenu', { name: 'ME_NpcPickMenu', initArg: this.m_data });
        }
        if (cmd == 'item') {
            BaseMenu.loadPrefab('ME_ItemPickMenu', { name: 'ME_ItemPickMenu', initArg: this.m_data });
        }
        if (cmd == 'story') {
            BaseMenu.loadPrefab('ME_StoryPickMenu', { name: 'ME_StoryPickMenu', initArg: this.m_data });
        }

        if (cmd == 'skip') {
            BaseMenu.loadPrefab('ME_SkipPickMenu', { name: 'ME_SkipPickMenu', initArg: this.m_data });
        }
    }


    onToggle(toggle: Toggle, cmd: string) {
        this.m_data.fadeLoop = toggle.isChecked;
    }


}

