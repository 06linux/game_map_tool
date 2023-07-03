import { Component, Node, Prefab, UITransform, _decorator, instantiate, size } from 'cc';
import { BCC, BaseColor, BaseMask, BaseSpace, BaseStr, BaseText, BaseUtil } from '../base';
import { SMapDir, SMapPlace, SMapUtil } from '../src/s_map';
import { ME_MapEdit } from './ME_MapEdit';
const { ccclass, property } = _decorator;

@ccclass('ME_Place')
export class ME_Place extends Component {

    @property({ type: Prefab })
    m_liziChuanSong: Prefab = null;         // 粒子特效

    @property({ type: Prefab })
    m_liziHuoHuan: Prefab = null;           // 粒子特效


    m_data: SMapPlace = {
        _id: BaseStr.uidInvite10(),
        name: '新地点',
        desc: '',
        color: BaseColor.value('NOR'),
        colorbg: BaseColor.value('BG_MENU'),
    };

    private m_focus = false;        // 是否选中

    init(data?: SMapPlace) {

        if (data) {
            this.m_data = { ...data };
        }

        if (BaseUtil.isNull(this.m_data.name)) {
            this.m_data.name = 'xxxxxx';
        }

        if (this.m_data.skip) {
            this.m_data.colorbg = '#1C6B32';        // 跳转点颜色固定
            this.m_data.fadeLoop = false;
        }

        const textN = BaseText.load({ text: this.m_data.name, color: this.m_data.color });
        const textSize = textN.getComponent(UITransform).contentSize;
        const uiSize = size(textSize.width + 30, textSize.height + 20);
        const spaceN = BaseSpace.load({ size: uiSize, child: textN, colorbg: this.m_data.colorbg });
        const maskN = BaseMask.load({ size: uiSize, child: spaceN });

        spaceN.name = 'space';
        maskN.name = 'mask';

        this.node.addChild(maskN);
        this.node.getComponent(UITransform).setContentSize(uiSize);

        if (this.m_data.pos) {
            this.node.setPosition(BCC.toV3(this.m_data.pos));
        }

        if (this.m_data.fadeLoop) {
            BCC.fadeLoop(this.node);
        }
        else {
            BCC.fadeStop(this.node);
        }
    }

    setFocus(focus: boolean) {
        this.m_focus = focus;

        if (focus) {
            const uiSize = this.node.getComponent(UITransform).contentSize;
            const focusN = BaseSpace.load({ rectType: 'ReacB7', size: size(uiSize.width + 35, uiSize.height + 30) });
            focusN.name = '_focus_';

            BCC.fadeLoop(focusN);
            this.node.addChild(focusN);
            console.log('ME_Place.setFocus', this.m_data);

        } else {
            const focusN = this.node.getChildByName('_focus_');
            if (focusN) {
                focusN.destroy();
            }
        }

    }

    getFocus() {
        return this.m_focus;
    }

    getData() {
        this.m_data.pos = BCC.toV2(this.node.position);
        return { ...this.m_data } as SMapPlace;
    }

    getId() {
        return this.m_data._id;
    }

    getName() {
        return this.m_data.name;
    }

    setData(data: SMapPlace) {
        data.name = data.name.trim();       // 过滤前后空格
        data.desc = data.desc.trim();       // 过滤前后空格
        data._id = this.m_data._id;         // 默认不能修改 id
        data.pos = undefined;               // 位置数据修改

        this.node.destroyAllChildren();
        this.node.removeAllChildren();      // 移除所有节点，马上执行

        this.init(data);
    }

    // 获取连接的位置
    getConnect(dir: SMapDir) {
        const id = SMapUtil.connGet(this.m_data, dir);
        if (id && ME_MapEdit.Instance) {
            return ME_MapEdit.Instance.placeGet(id);
        }
        return null;
    }

    setLiZiChuanSong(active: boolean) {

        const name = '_lizi_chuansong_';
        if (active) {
            const objN = instantiate(this.m_liziChuanSong);
            objN.name = name;
            this.node.addChild(objN);
        }
        else {
            const objN = this.node.getChildByName(name);
            if (objN) {
                objN.removeFromParent();
                objN.destroy();
            }
        }
    }

    setLiZiHuoHuan(active: boolean) {
        const name = '_lizi_huohuan_';
        if (active) {
            const objN = instantiate(this.m_liziHuoHuan);
            objN.name = name;
            this.node.addChild(objN);
        }
        else {
            const objN = this.node.getChildByName(name);
            if (objN) {
                objN.removeFromParent();
                objN.destroy();
            }
        }
    }


    setClick(target: Node, component: string, handle: string, customEventData: string = '') {
        const spaceN = this.node.getChildByPath('mask/space');
        if (spaceN) {
            spaceN.getComponent(BaseSpace).setClick(target, component, handle, customEventData);
        }
    }

    // 删除当前节点绑定的数据
    // delSubData(uuid: string) {
    //     if (this.m_data.npcs) {
    //         for (let index = 0; index < this.m_data.npcs.length; index++) {
    //             const mapNpc = this.m_data.npcs[index];
    //             if (mapNpc.uuid == uuid) {
    //                 this.m_data.npcs.splice(index, 1);
    //                 return;
    //             }
    //         }
    //     }

    //     if (this.m_data.items) {
    //         for (let index = 0; index < this.m_data.items.length; index++) {
    //             const mapItem = this.m_data.items[index];
    //             if (mapItem.uuid == uuid) {
    //                 this.m_data.items.splice(index, 1);
    //                 return;
    //             }
    //         }
    //     }

    // }

    // （临时添加，刷新地图会消失)
    // addItem(data: SMapItem) {

    //     if (this.m_data.items) {
    //         this.m_data.items.push({ ...data });
    //     }
    //     else {
    //         this.m_data.items = [{ ...data }];
    //     }
    // }

}

