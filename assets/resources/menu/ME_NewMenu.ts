import { Component, EventKeyboard, input, Input, KeyCode, log, Node, Toggle, _decorator } from 'cc';
import { BaseEvent, BaseMenu, BaseSocket, BaseStr, BaseTime, BaseUtil, BCC, SMsg, STag } from '../../base';
import { SMap } from '../../src/s_map';
const { ccclass, property } = _decorator;


/**
 * 地图编辑器-新建地图
 */
@ccclass('ME_NewMenu')
export class ME_NewMenu extends Component {

    // 绑定属性
    @property({ type: Node })
    m_EditName: Node = null;

    @property({ type: Node })
    m_EditZone: Node = null;

    m_data: SMap = {
        _id: BaseStr.uidInvite10(),
        zone: '默认',
        name: `地图-${BaseStr.uidInvite10()}`,
        type: '自由区',
        places: [],
        desc: '',
        spaceW: 180,
        spaceH: 120,
        time: BaseTime.now(),
        timeStr: BaseTime.timeStr(),
    }

    onLoad() {
        // 键盘事件
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    start() {
        BCC.setEditBox(this.m_EditName, this.m_data.name);
        BCC.setEditBox(this.m_EditZone, this.m_data.zone);
    }

    onNameChange(value: string) {
        this.m_data.name = value;
    }

    onZoneChange(value: string) {
        this.m_data.zone = value;
    }

    onDescChange(value: string) {
        this.m_data.desc = value;
    }

    onToggle(toggle: Toggle, cmd: string) {
        log('ME_NewMenu.onToggle', toggle, cmd);

        switch (cmd) {
            case '自由区':
            case '保护区':
            case '危险区':
                this.m_data.type = cmd;
                break;
            default:
                break;
        }
    }

    checkInput() {

        if (BaseUtil.isNull(this.m_data.name)) {
            BaseMenu.showError('地图名称不能为空');
            return false;
        }

        return true;
    }

    async onClickSubmit() {

        // log('ME_NewMenu.onClickSubmit', this.m_data);
        if (this.checkInput()) {
            BaseEvent.emit('ME_MapList.add', this.m_data);
            BaseMenu.freeMenu(this.node);
        }
    }

    onKeyDown(event: EventKeyboard) {

        switch (event.keyCode) {
            case KeyCode.ESCAPE:
                {
                    BaseMenu.freeMenu(this.node);
                }
                break;
        }

    }
}

