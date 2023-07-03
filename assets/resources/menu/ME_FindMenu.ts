import { Component, EventKeyboard, Input, input, KeyCode, Node, _decorator } from 'cc';
import { BaseEvent, BaseMenu, BCC } from '../../base';
import { ME_MapList } from '../../game/ME_MapList';
const { ccclass, property } = _decorator;


/**
 * 地图查找
 */
@ccclass('ME_FindMenu')
export class ME_FindMenu extends Component {

    // 绑定属性
    @property({ type: Node })
    m_EditZone: Node = null;

    @property({ type: Node })
    m_EditName: Node = null;

    onLoad() {
        // 键盘事件
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }



    start() {
        BCC.setEditBox(this.m_EditZone, ME_MapList.SEARCH.zone);
        BCC.setEditBox(this.m_EditName, ME_MapList.SEARCH.name);
    }

    onNameChange(value: string) {
        ME_MapList.SEARCH.name = value;
    }

    onZoneChange(value: string) {
        ME_MapList.SEARCH.zone = value;
    }

    async onClickSubmit() {
        BaseEvent.emit('ME_MapList.refreshHome');
        BaseMenu.freeMenu(this.node);
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

