import { Component, EventKeyboard, Input, KeyCode, Node, Toggle, _decorator, input } from 'cc';
import { BCC, BaseEvent, BaseMenu, BaseUtil } from '../../base';
import { SMap } from '../../src/s_map';
const { ccclass, property } = _decorator;


/**
 * 地图属性编辑
 */
@ccclass('ME_EditMenu')
export class ME_EditMenu extends Component {

    // 绑定属性
    @property({ type: Node })
    m_EditName: Node = null;

    @property({ type: Node })
    m_EditZone: Node = null;

    @property({ type: Node })
    m_EditDesc: Node = null;

    @property({ type: Node })
    m_Args: Node = null;

    @property({ type: Node })
    m_EditW: Node = null;

    @property({ type: Node })
    m_EditH: Node = null;

    @property({ type: Node })
    m_ToggleZiYou: Node = null;

    @property({ type: Node })
    m_ToggleBaoHu: Node = null;

    @property({ type: Node })
    m_ToggleWeiXian: Node = null;

    m_data: SMap = null;

    onLoad() {

        // 键盘事件
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onDestroy() {

        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    init(data: SMap) {
        this.m_data = data;
        BCC.setEditBox(this.m_EditName, this.m_data.name);
        BCC.setEditBox(this.m_EditZone, this.m_data.zone);
        BCC.setEditBox(this.m_EditDesc, this.m_data.desc);
        BCC.setEditBox(this.m_Args, this.m_data.args);
        BCC.setEditBox(this.m_EditW, `${this.m_data.spaceW}`);
        BCC.setEditBox(this.m_EditH, `${this.m_data.spaceH}`);


        switch (this.m_data.type) {
            case '自由区':
                this.m_ToggleZiYou.getComponent(Toggle).isChecked = true;
                break;
            case '保护区':
                this.m_ToggleBaoHu.getComponent(Toggle).isChecked = true;
                break;
            case '危险区':
                this.m_ToggleWeiXian.getComponent(Toggle).isChecked = true;
                break;
            default:
                break;
        }

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

    onArgsChange(value: string) {
        this.m_data.args = value;
    }

    onWChange(value: string) {
        const num = parseInt(value);
        if (num) {
            this.m_data.spaceW = num;
        }
    }

    onHChange(value: string) {
        const num = parseInt(value);
        if (num) {
            this.m_data.spaceH = num;
        }
    }

    onToggle(toggle: Toggle, cmd: string) {
        // log('ME_EditMenu.onToggle', toggle, cmd);

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

        // log('ME_EditMenu.onClickSubmit', this.m_data);

        if (this.checkInput()) {
            BaseEvent.emit('ME_MapList.set', this.m_data);
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

