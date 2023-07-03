import { Component, Node, _decorator } from 'cc';
import { BaseEvent, BaseSocket, BCC } from '../base';
import { GAPI } from '../src/g_api';
import { SMap } from '../src/s_map';
import { UAccountUtil } from '../src/u_account';
import { ME_MapEdit } from './ME_MapEdit';
const { ccclass, property } = _decorator;


/**
 * 地图编辑器 (MapEditor)
 */
@ccclass('ME_Scene')
export class ME_Scene extends Component {

    onLoad() {
        this.init();
        BCC.fadeIn(this.node, 1.5);

        BaseEvent.on('ME_Scene.showMapList', this.showMapList, this);
        BaseEvent.on('ME_Scene.showMapEdit', this.showMapEdit, this);
    }

    onDestroy() {
        BaseEvent.off('ME_Scene.showMapList', this.showMapList, this);
        BaseEvent.off('ME_Scene.showMapEdit', this.showMapEdit, this);
    }

    init() {
        this.showMapList();
    }

    update(deltaTime: number) {
    }

    // 显示地图列表页面
    showMapList() {
        this.node.getChildByName('MapList').active = true;

        const mapEditN = this.node.getChildByName('MapEdit');
        mapEditN.active = false;
        mapEditN.getComponent(ME_MapEdit).free();
    }

    // 显示地图编辑页面
    showMapEdit(data: SMap) {
        if (data == null) return;

        this.node.getChildByName('MapList').active = false;

        const mapEditN = this.node.getChildByName('MapEdit');
        mapEditN.active = true;
        mapEditN.getComponent(ME_MapEdit).init(data);
    }


}

