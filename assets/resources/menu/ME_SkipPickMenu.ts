import { Component, Event, EventKeyboard, input, Input, KeyCode, log, Node, size, v2, _decorator } from 'cc';
import { BaseColor, BaseEvent, BaseLayout, BaseMenu, BaseSav, BaseSocket, BaseSpace, BaseText, BaseUtil, BCC, SMsg } from '../../base';
import { SMap, SMapDBAPI, SMapPlace } from '../../src/s_map';
const { ccclass, property } = _decorator;


/**
 * 地图跳转 选择菜单
 * 
 * 注意： 如果地点是双向跳转的，需要去对应的地图配置返回跳转
 */
@ccclass('ME_SkipPickMenu')
export class ME_SkipPickMenu extends Component {

    @property({ type: Node })
    m_mapContent: Node = null;             // 地图列表内容

    @property({ type: Node })
    m_placeContent: Node = null;           // 地点列表内容

    @property({ type: Node })
    m_skipName: Node = null;               // label 

    m_place: SMapPlace = null;             // 当前菜单对应的地点数据
    m_search = { name: '', zone: '' };     // 搜索条件

    m_selectMap: SMap = null;               // 当前选中的地图
    m_selectPlace: SMapPlace = null;        // 当前选中的地点

    onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);

    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);

        BaseEvent.emit('ME_PlaceMenu.refresUI');
    }

    init(place: SMapPlace) {
        this.m_place = place;
        this.search();

        const res = BaseSav.find('map_list', {}, 0, 20);
        this.initMapContent(res.list);
    }

    onNameChange(value: string) {
        this.m_search.name = value;
        this.search();
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.ESCAPE:
            case KeyCode.SPACE:
                {
                    BaseMenu.freeMenu(this.node);
                }
                break;
        }
    }

    search() {
        const res = BaseSav.find('map_list', { name: this.m_search.name }, 0, 20);
        this.initMapContent(res.list);
    }

    initMapContent(list: SMap[]) {
        if (list == null) return;

        this.m_mapContent.destroyAllChildren();
        this.m_mapContent.removeAllChildren();

        for (let index = 0; index < list.length; index++) {
            const map = list[index];
            const anchor = v2(0, 0.5);

            const spaceN = BaseSpace.load({
                size: size(580, 60),
                colorbg: BaseColor.value('BG_PANEL'),
                child: BaseLayout.loadH(
                    [
                        BaseSpace.load({ size: size(120, 50), anchor, child: BaseText.load({ text: `${map.zone}`, anchor }) }),
                        BaseSpace.load({ size: size(330, 50), anchor, child: BaseText.load({ text: `${map.name}`, anchor }) }),
                    ],
                    30,
                )
            });

            BaseUtil.setData(spaceN, map);
            spaceN.getComponent(BaseSpace).setClick(this.node, 'ME_SkipPickMenu', 'onBtnClickMap');

            this.m_mapContent.addChild(spaceN);
        }
    }

    setMapFocus(map: SMap) {

        for (let index = 0; index < this.m_mapContent.children.length; index++) {
            const spaceN = this.m_mapContent.children[index];
            const mapCurr = BaseUtil.getData(spaceN) as SMap;
            if (mapCurr._id == map._id) {
                spaceN.getComponent(BaseSpace).setColorbg(BaseColor.value('RED'));
            }
            else {
                spaceN.getComponent(BaseSpace).setColorbg(BaseColor.value('BG_PANEL'));
            }
        }
    }


    initPlaceContent(list: SMapPlace[]) {
        if (list == null) return;

        this.m_placeContent.destroyAllChildren();
        this.m_placeContent.removeAllChildren();

        for (let index = 0; index < list.length; index++) {
            const place = list[index];
            const anchor = v2(0, 0.5);

            const btnN = BaseText.load({ text: '选择', color: 'ffff00' });
            btnN.getComponent(BaseText).setClick(this.node, 'ME_SkipPickMenu', 'onBtnClickPlace');
            BaseUtil.setData(btnN, place);

            const spaceN = BaseSpace.load({
                size: size(580, 60),
                colorbg: BaseColor.value('BG_PANEL'),
                child: BaseLayout.loadH(
                    [
                        BaseSpace.load({ size: size(400, 50), anchor, child: BaseText.load({ text: `${place.name}`, anchor }) }),
                        btnN,
                    ],
                    30,
                )
            });
            this.m_placeContent.addChild(spaceN);
        }
    }


    // 点击地图
    onBtnClickMap(event: Event, cmd: string) {

        const spaceN = event.target as Node;
        const map = BaseUtil.getData(spaceN) as SMap;

        this.setMapFocus(map);

        this.m_selectMap = map;
        BCC.setLabel(this.m_skipName, map.name);
        this.initPlaceContent(map.places);
    }


    // 点击地点 
    onBtnClickPlace(event: Event, cmd: string) {

        const skipPlace = BaseUtil.getData(event.target) as SMapPlace;

        log('跳转地点', skipPlace);

        if (skipPlace._id == this.m_place._id) {
            BaseMenu.showError('跳转地点不能是当前位置');
            return;
        }

        this.m_place.skip = {
            map: this.m_selectMap.name,
            mapId: this.m_selectMap._id,
            place: skipPlace.name,
            placeId: skipPlace._id,
        };
        BaseMenu.freeMenu(this.node);
    }

}

