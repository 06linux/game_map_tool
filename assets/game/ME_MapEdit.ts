import { Component, Event, EventKeyboard, EventMouse, Input, KeyCode, Node, Prefab, Vec3, _decorator, input, instantiate, log, sys, v2, v3 } from 'cc';
import { BCC, BaseButton, BaseColor, BaseEvent, BaseFile, BaseFontSize, BaseMenu, BaseSav, BaseSocket, BaseStr, BaseText, BaseUtil, SMsg, STag } from '../base';
import { ME_ConnMenu } from '../resources/menu/ME_ConnMenu';
import { ME_PlaceMenu } from '../resources/menu/ME_PlaceMenu';
import { SMap, SMapDir, SMapPlace, SMapPos, SMapUtil } from '../src/s_map';
import { ME_Line } from './ME_Line';
import { ME_Place } from './ME_Place';
const { ccclass, property } = _decorator;

/**
 * 地图列表显示
 */
@ccclass('ME_MapEdit')
export class ME_MapEdit extends Component {

    public static Instance: ME_MapEdit = null;          // 当前脚本对象

    @property({ type: Node })
    m_pageBar: Node = null;

    @property({ type: Node })
    m_menuBar: Node = null;

    @property({ type: Node })
    m_content: Node = null;

    @property({ type: Prefab })
    m_linePrefab: Prefab = null;

    @property({ type: Prefab })
    m_placePrefab: Prefab = null;

    private m_PosTips: Node = null;             // 坐标显示 （BaseText）

    private m_map: SMap = null;
    private m_places = [] as Node[];            // 位置列表
    private m_lines = [] as Node[];             // 连线列表

    // 按键状态
    private m_ctrl = false;                     // 是否按下 ctrl 按键
    private m_alt = false;                      // 是否按下 alt 按键
    private m_mouseDown = false;                // 鼠标是否按下

    private m_savKey = 'map_list';

    onLoad() {
        ME_MapEdit.Instance = this;

        BaseEvent.on('ME_MapEdit.refreshPageBar', this.refreshPageBar, this);

        // 键盘事件
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }

    onDestroy() {
        BaseEvent.off('ME_MapEdit.refreshPageBar', this.refreshPageBar, this);


        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);

        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);

    }

    init(map: SMap) {
        this.initMap(map);
    }

    free() {
        this.m_menuBar.destroyAllChildren();
        this.m_pageBar.destroyAllChildren();
        this.m_content.destroyAllChildren();
        this.m_lines = [];
        this.m_places = [];
        this.m_alt = false;
        this.m_ctrl = false;
    }

    initMap(map: SMap) {
        this.free();

        this.m_map = map;
        this.initMenuBar();
        this.initPageBar(map);
        this.initContent(map);
    }

    // 保存数据 (直接保存到服务器)
    save() {

        if (this.m_map == null) return;

        this.m_map.places = [];

        for (let index = 0; index < this.m_places.length; index++) {
            const placeN = this.m_places[index];
            const placeS = placeN.getComponent(ME_Place);
            const data = placeS.getData();
            this.m_map.places.push(data);
        }

        BaseSav.set(this.m_savKey, this.m_map._id, this.m_map);
        BaseSav.save(this.m_savKey);
        BaseMenu.showMsg('保存成功！');
    }

    // 导出 json 配置
    exportJson() {
        const str = JSON.stringify(this.m_map);
        BaseFile.save(str, `${this.m_map.zone}_${this.m_map.name}.json`);
    }

    // 退出界面
    async quit() {
        this.save();
        this.free();
        BaseEvent.emit('ME_Scene.showMapList');
    }


    initMenuBar() {

        {
            const btnN = BaseButton.load({ text: '新建', fontSize: BaseFontSize.NOR, colorbg: BaseColor.value('BG_NOR') });
            this.m_menuBar.addChild(btnN);
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_MapEdit', 'onMenuClick', '新建');
        }

        {
            const btnN = BaseButton.load({ text: '删除', fontSize: BaseFontSize.NOR, colorbg: BaseColor.value('BG_NOR') });
            this.m_menuBar.addChild(btnN);
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_MapEdit', 'onMenuClick', '删除');
        }

        {
            const btnN = BaseButton.load({ text: '放大', fontSize: BaseFontSize.NOR, colorbg: BaseColor.value('BG_NOR') });
            this.m_menuBar.addChild(btnN);
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_MapEdit', 'onMenuClick', '放大');
        }

        {
            const btnN = BaseButton.load({ text: '缩小', fontSize: BaseFontSize.NOR, colorbg: BaseColor.value('BG_NOR') });
            this.m_menuBar.addChild(btnN);
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_MapEdit', 'onMenuClick', '缩小');
        }

        {
            const btnN = BaseButton.load({ text: '重置', fontSize: BaseFontSize.NOR, colorbg: BaseColor.value('BG_NOR') });
            this.m_menuBar.addChild(btnN);
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_MapEdit', 'onMenuClick', '重置');
        }


        {
            const btnN = BaseButton.load({ text: '帮助', fontSize: BaseFontSize.NOR, colorbg: BaseColor.value('BG_NOR') });
            this.m_menuBar.addChild(btnN);
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_MapEdit', 'onMenuClick', '帮助');
        }

        {
            const btnN = BaseButton.load({ text: '编辑', fontSize: BaseFontSize.NOR, colorbg: BaseColor.value('BG_NOR') });
            this.m_menuBar.addChild(btnN);
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_MapEdit', 'onMenuClick', '编辑');
        }

        {
            const btnN = BaseButton.load({ text: '保存', fontSize: BaseFontSize.NOR, colorbg: BaseColor.value('BG_NOR') });
            this.m_menuBar.addChild(btnN);
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_MapEdit', 'onMenuClick', '保存');
        }

        {
            const btnN = BaseButton.load({ text: '导出', fontSize: BaseFontSize.NOR, colorbg: BaseColor.value('BG_NOR') });
            this.m_menuBar.addChild(btnN);
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_MapEdit', 'onMenuClick', '导出');
        }

        {
            const btnN = BaseButton.load({ text: '退出', fontSize: BaseFontSize.NOR, colorbg: BaseColor.value('RED') });
            this.m_menuBar.addChild(btnN);
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_MapEdit', 'onMenuClick', '退出');
        }
    }

    async onMenuClick(event: Event, cmd: string) {
        console.log('ME_MapEdit.onClickButton', cmd);

        switch (cmd) {
            case '新建':
                {
                    this.placeFocusClear();
                    this.placeLoad(null, true);
                }
                break;
            case '删除':
                {
                    const placeN = this.placeFocusGetOne();
                    if (placeN) {
                        this.placeDel(placeN);
                    }
                }
                break;
            case '放大':
                {
                    this.setContentScale('放大');
                }
                break;
            case '缩小':
                {
                    this.setContentScale('缩小');
                }
                break;
            case '重置':
                {
                    this.setContentScale('重置');
                }
                break;
            case '导出':
                {
                    this.exportJson();
                }
                break;
            case '帮助':
                {
                    this.showHelp();
                }
                break;
            case '编辑':
                {
                    BaseMenu.loadPrefab('ME_EditMenu', { name: 'ME_EditMenu', init: true, initArg: this.m_map });
                }
                break;
            case '保存':
                {
                    this.save();
                }
                break;
            case '退出':
                {
                    this.quit();
                }
                break;
            default:
                break;
        }
    }

    initPageBar(map: SMap) {

        {
            const textN = BaseText.load({ text: `地图：${map.zone}●${map.name}` });
            this.m_pageBar.addChild(textN);
        }

        {
            let color = 'F5FF00';
            if (map.type == '危险区') {
                color = 'FF0000';
            }
            if (map.type == '保护区') {
                color = '25F35F';
            }
            const textN = BaseText.load({ text: `${map.type}`, color });
            this.m_pageBar.addChild(textN);
        }


        {
            const textN = BaseText.load({ text: `坐标：[${this.m_content.position.x, this.m_content.position.y}]` });
            this.m_pageBar.addChild(textN);
            this.m_PosTips = textN;
        }

    }

    refreshPageBar() {

        this.m_pageBar.destroyAllChildren();
        this.m_pageBar.removeAllChildren();
        this.initPageBar(this.m_map);
    }


    setPosTips() {
        if (this.m_PosTips) {
            this.m_PosTips.getComponent(BaseText).init({ text: `地图坐标：[${this.m_content.position.x.toFixed(1)},${this.m_content.position.y.toFixed(1)}]` });
        }
    }


    // 主面板内容
    initContent(map: SMap) {

        this.setContentScale('重置');

        // 初始化所有地点
        for (let index = 0; index < map.places.length; index++) {
            const placeD = map.places[index];
            this.placeLoad(placeD);
        }

        // 初始化所有的连线
        for (let index = 0; index < this.m_places.length; index++) {
            const placeN = this.m_places[index];
            const placeD = placeN.getComponent(ME_Place).getData();
            {
                const distN = this.placeGet(placeD.n);
                if (distN) {
                    this.lineLoad(placeN, distN);
                }
            }

            {
                const distN = this.placeGet(placeD.s);
                if (distN) {
                    this.lineLoad(placeN, distN);
                }
            }

            {
                const distN = this.placeGet(placeD.w);
                if (distN) {
                    this.lineLoad(placeN, distN);
                }
            }

            {
                const distN = this.placeGet(placeD.e);
                if (distN) {
                    this.lineLoad(placeN, distN);
                }
            }

            {
                const distN = this.placeGet(placeD.nw);
                if (distN) {
                    this.lineLoad(placeN, distN);
                }
            }

            {
                const distN = this.placeGet(placeD.ne);
                if (distN) {
                    this.lineLoad(placeN, distN);
                }
            }


            {
                const distN = this.placeGet(placeD.sw);
                if (distN) {
                    this.lineLoad(placeN, distN);
                }
            }

            {
                const distN = this.placeGet(placeD.se);
                if (distN) {
                    this.lineLoad(placeN, distN);
                }
            }

        }

    }

    setContentScale(type: '放大' | '缩小' | '重置') {
        if (type == null || type == '重置') {
            this.m_content.setScale(v3(1, 1, 1));
            this.m_content.setPosition(v3(0, 0, 0));
            this.setPosTips();
        }

        const scale = this.m_content.getScale();
        if (type == '放大') {
            scale.x += 0.1;
            scale.y += 0.1;
        }
        if (type == '缩小') {
            scale.x -= 0.1;
            scale.y -= 0.1;
        }
        this.m_content.setScale(scale);

    }



    showHelp() {
        const texts = [
            '$HIY$快捷键说明$NOR$\n',
            '新建：n',
            '删除：x | delete',
            '放大：ctrl +',
            '缩小：ctrl -',
            '重置：ctrl 0',
            '保存：s',
            '退出：q',
            '多选：ctrl + 鼠标选中多个',
            '全选：ctrl a',
            '链接地点：选中一个地点，按住 alt 点击另外一个地点',
            '编辑地点：空格键，弹出地点编辑菜单',
            '取消选中：ESC 取消所有选中',
            '快速创建：先创建或选中一个地点，按方向键上下左右',
            '快速创建：先创建或选中一个地点，数字小键盘12346789',
            '移动地点：ctrl + 鼠标选中多个，然后鼠标拖动',
            '移动面板：alt，然后鼠标拖动',
            '传送跳转：仅仅选中对应的传送点位置，按TAB建进行跳转',
        ];

        let markText = '';

        for (let index = 0; index < texts.length; index++) {
            const text = texts[index];
            markText += text;
            markText += '\n';
        }

        BaseMenu.showDialog(markText, null, null);
    }

    async onKeyDown(event: EventKeyboard) {
        log('ME_MapEdit.onKeyDown', event.keyCode);

        if (!this.node.active) return;

        switch (event.keyCode) {

            case KeyCode.ESCAPE:  // 取消状态
                {
                    this.m_alt = false;
                    this.m_ctrl = false;
                    this.placeFocusClear();
                }
                break;
            case KeyCode.CTRL_LEFT:
            case KeyCode.CTRL_RIGHT:
                this.m_ctrl = true;
                break;
            case KeyCode.ALT_LEFT:
            case KeyCode.ALT_RIGHT:
                this.m_alt = true;
                break;
            case KeyCode.KEY_S:   // 保存数据
                {
                    this.save();
                }
                break;
            case KeyCode.TAB:   // 传送点跳转
                {
                    if (this.placeFocusCount() != 1) {
                        return;
                    }

                    const placeN = this.placeFocusGetOne();
                    if (placeN == null) {
                        return;
                    }

                    const placeD = placeN.getComponent(ME_Place).getData();
                    if (placeD.skip) {
                        this.save();
                        const data = BaseSav.getById(this.m_savKey, placeD.skip.mapId) as SMap;
                        this.initMap(data);
                    }
                }
                break;
            case KeyCode.KEY_Q:
                {
                    this.quit();
                }
                break;
            case KeyCode.KEY_N:   // 新建地点
                {
                    this.placeFocusClear();
                    this.placeLoad(null, true);
                }
                break;
            case KeyCode.EQUAL:    // +
                {
                    if (this.m_ctrl) {
                        this.setContentScale('放大');
                    }
                }
                break;
            case KeyCode.DASH:     // -
                {
                    if (this.m_ctrl) {
                        this.setContentScale('缩小');
                    }
                }
                break;
            case KeyCode.DIGIT_0:   // 0
                {
                    if (this.m_ctrl) {
                        this.setContentScale('重置');
                    }
                }
                break;
            case KeyCode.KEY_X:     // 删除
            case KeyCode.DELETE:    // 删除
                {
                    const placeN = this.placeFocusGetOne();
                    if (placeN) {
                        this.placeDel(placeN);
                    }
                }
                break;
            case KeyCode.SPACE:
                {
                    if (BaseMenu.getMenu('ME_PlaceMenu')) {
                        return;
                    }

                    const placeN = this.placeFocusGetOne();
                    if (placeN) {
                        const menuN = await BaseMenu.loadPrefab('ME_PlaceMenu', { name: 'ME_PlaceMenu' });
                        menuN.getComponent(ME_PlaceMenu).init(placeN);
                    }
                }
                break;
            case KeyCode.KEY_A:
                {
                    if (this.m_ctrl) {
                        this.placeFocusAll();
                    }
                }
                break;

            case KeyCode.NUM_1:
                {
                    const placeN = this.placeFocusGetOne();
                    if (placeN) {
                        this.placeLoadWithConnect(placeN, SMapDir.SW);
                    }
                }
                break;
            case KeyCode.NUM_2:
            case KeyCode.ARROW_DOWN:
                {
                    const placeN = this.placeFocusGetOne();
                    if (placeN) {
                        this.placeLoadWithConnect(placeN, SMapDir.S);
                    }
                }
                break;
            case KeyCode.NUM_3:
                {
                    const placeN = this.placeFocusGetOne();
                    if (placeN) {
                        this.placeLoadWithConnect(placeN, SMapDir.SE);
                    }
                }
                break;
            case KeyCode.NUM_4:
            case KeyCode.ARROW_LEFT:
                {
                    const placeN = this.placeFocusGetOne();
                    if (placeN) {
                        this.placeLoadWithConnect(placeN, SMapDir.W);
                    }
                }
                break;
            case KeyCode.NUM_6:
            case KeyCode.ARROW_RIGHT:
                {
                    const placeN = this.placeFocusGetOne();
                    if (placeN) {
                        this.placeLoadWithConnect(placeN, SMapDir.E);
                    }
                }
                break;
            case KeyCode.NUM_7:
                {
                    const placeN = this.placeFocusGetOne();
                    if (placeN) {
                        this.placeLoadWithConnect(placeN, SMapDir.NW);
                    }
                }
                break;
            case KeyCode.NUM_8:
            case KeyCode.ARROW_UP:
                {
                    const placeN = this.placeFocusGetOne();
                    if (placeN) {
                        this.placeLoadWithConnect(placeN, SMapDir.N);
                    }
                }
                break;
            case KeyCode.NUM_9:
                {
                    const placeN = this.placeFocusGetOne();
                    if (placeN) {
                        this.placeLoadWithConnect(placeN, SMapDir.NE);
                    }
                }
                break;
        }

    }

    onKeyUp(event: EventKeyboard) {
        // log('ME_MapEdit.onKeyUp', event.keyCode);

        if (!this.node.active) return;

        switch (event.keyCode) {
            case KeyCode.CTRL_LEFT:
            case KeyCode.CTRL_RIGHT:
                this.m_ctrl = false;
                break;
            case KeyCode.ALT_LEFT:
            case KeyCode.ALT_RIGHT:
                this.m_alt = false;
                break;
        }

    }


    async onMouseDown(event: EventMouse) {
        // const pos = BCC.clickToNode(this.node, event);
        // log('ME_MapEdit.onMouseDown', pos);

        if (!this.node.active) return;

        this.m_mouseDown = true;
        if (this.m_places.length == 0) return;

        // 连接状态
        if (this.m_alt) {

            // 确保只选中一个
            if (this.placeFocusCount() != 1) {
                this.placeFocusClear();
            }

            let placeDist: Node = null;
            for (let index = this.m_places.length - 1; index >= 0; index--) {
                const placeN = this.m_places[index];
                if (BCC.isClick(placeN, event)) {
                    placeDist = placeN;
                    break;
                }
            }

            const placeSrc = this.placeFocusGetOne();
            if (placeSrc && placeDist && placeSrc.uuid != placeDist.uuid) {
                const menuN = await BaseMenu.loadPrefab('ME_ConnMenu', { name: 'ME_ConnMenu' });
                menuN.getComponent(ME_ConnMenu).init(placeSrc, placeDist);
                this.placeFocusClear();
            }

            return;
        }


        // 多选状态
        if (this.m_ctrl) {
            for (let index = this.m_places.length - 1; index >= 0; index--) {
                const placeN = this.m_places[index];
                const placeS = placeN.getComponent(ME_Place);
                if (BCC.isClick(placeN, event)) {
                    placeS.setFocus(!placeS.getFocus());
                    break;
                }
            }
            return;
        }

        // 单选状态
        this.placeFocusClear();
        for (let index = this.m_places.length - 1; index >= 0; index--) {
            const placeN = this.m_places[index];
            const placeS = placeN.getComponent(ME_Place);
            if (BCC.isClick(placeN, event)) {
                placeS.setFocus(true);

                const placeD = placeS.getData();
                const pos: SMapPos = {
                    map: this.m_map.name,
                    mapId: this.m_map._id,
                    place: placeD.name,
                    placeId: placeD._id,
                }

                log('当前位置：', pos);   // 输出当前位置，测试用  

                break;
            }
        }

    }

    onMouseUp(event: EventMouse) {
        // const pos = BCC.clickToNode(this.node, event);
        // log('ME_MapEdit.onMouseUp', pos);

        if (!this.node.active) return;

        this.m_mouseDown = false;
    }

    onMouseMove(event: EventMouse) {

        // log('ME_MapEdit.onMouseMove');

        if (!this.node.active) return;


        // 移动 content 位置
        if (this.m_mouseDown && this.m_alt) {
            const pos = BCC.clickToNode(this.node, event);                 // 当前坐标
            const posPre = BCC.clickPreviousToNode(this.node, event);      // 上一次坐标
            const posOff = pos.subtract(posPre);                           // 坐标偏移

            const posNew = this.m_content.position.add(posOff);
            this.m_content.setPosition(posNew);
            this.setPosTips();
            return
        }



        if (this.m_mouseDown && this.m_ctrl) {

            const pos = BCC.clickToNode(this.m_content, event);                 // 当前坐标
            const posPre = BCC.clickPreviousToNode(this.m_content, event);      // 上一次坐标
            const posOff = pos.subtract(posPre);                                // 坐标偏移

            this.placeMove(posOff);
            this.lineRefresh();
        }
    }

    lineLoad(place1: Node, place2: Node) {

        // 两个点直接，只能有一条线，不能重复
        if (this.lineCheck(place1, place2)) {
            return;
        }

        const lineN = instantiate(this.m_linePrefab);
        lineN.getComponent(ME_Line).init(place1, place2);

        this.m_content.addChild(lineN);
        this.m_lines.push(lineN);

        return lineN;
    }


    lineFree(place1: Node, place2: Node) {
        for (let index = 0; index < this.m_lines.length; index++) {
            const lineN = this.m_lines[index];
            const lineS = lineN.getComponent(ME_Line);
            if (lineS.check(place1, place2)) {
                this.m_lines.splice(index, 1);
                lineN.destroy();
                break;
            }
        }
    }

    // 检测两个点的连线是否已经存在
    lineCheck(place1: Node, place2: Node) {

        for (let index = 0; index < this.m_lines.length; index++) {
            const lineN = this.m_lines[index];
            const lineS = lineN.getComponent(ME_Line);
            if (lineS.check(place1, place2)) {
                return true;
            }
        }

        return false;
    }

    lineRefresh() {
        for (let index = 0; index < this.m_lines.length; index++) {
            const lineN = this.m_lines[index];
            const lineS = lineN.getComponent(ME_Line);
            lineS.refreshUI();
        }
    }

    /**
     * 加载一个新的地点
     * @param data 
     */
    placeLoad(data?: SMapPlace, focus = false) {
        const placeN = instantiate(this.m_placePrefab);
        placeN.getComponent(ME_Place).init(data);

        this.m_content.addChild(placeN);
        this.m_places.push(placeN);

        if (focus) {
            placeN.getComponent(ME_Place).setFocus(true);
        }

        return placeN;
    }

    /**
     * 加载并且设置连接
     * @param src 当前选择的节点 (ME_Place)
     * @param dir 连接方向
     * @returns 
     */
    placeLoadWithConnect(src: Node, dir: SMapDir) {

        const distOwn = src.getComponent(ME_Place).getConnect(dir)
        if (distOwn) {
            // 目标节点已经存在则设置为选中状态
            src.getComponent(ME_Place).setFocus(false);
            distOwn.getComponent(ME_Place).setFocus(true);
            return;
        }

        const spaceW = this.m_map.spaceW ? this.m_map.spaceW : 180;
        const spaceH = this.m_map.spaceH ? this.m_map.spaceH : 120;
        const offset = v2(spaceW, spaceH);

        const srcData = src.getComponent(ME_Place).getData();
        const distData = { _id: BaseStr.uidInvite10(), name: srcData.name, desc: srcData.desc, color: srcData.color, colorbg: srcData.colorbg } as SMapPlace;

        const posSrc = v2(src.position.x, src.position.y);
        let posDist = v2(posSrc.x, posSrc.y);

        switch (dir) {
            case SMapDir.N:
                {
                    posDist = v2(posSrc.x, posSrc.y + offset.y)
                }
                break;
            case SMapDir.S:
                {
                    posDist = v2(posSrc.x, posSrc.y - offset.y)
                }
                break;
            case SMapDir.W:
                {
                    posDist = v2(posSrc.x - offset.x, posSrc.y)
                }
                break;
            case SMapDir.E:
                {
                    posDist = v2(posSrc.x + offset.x, posSrc.y)
                }
                break;
            case SMapDir.NW:
                {
                    posDist = v2(posSrc.x - offset.x, posSrc.y + offset.y)
                }
                break;
            case SMapDir.NE:
                {
                    posDist = v2(posSrc.x + offset.x, posSrc.y + offset.y)
                }
                break;
            case SMapDir.SW:
                {
                    posDist = v2(posSrc.x - offset.x, posSrc.y - offset.y)
                }
                break;
            case SMapDir.SE:
                {
                    posDist = v2(posSrc.x + offset.x, posSrc.y - offset.y)
                }
                break;
            default:
                break;
        }

        const dist = this.placeLoad(distData);
        dist.setPosition(v3(posDist.x, posDist.y, 0));

        // 连接两个点
        this.placeConnOpen(src, dist, dir);

        // 设置选择焦点为新的对象
        src.getComponent(ME_Place).setFocus(false);
        dist.getComponent(ME_Place).setFocus(true);

        // log({ dataSrc, dataDist, posSrc, posDist, src, dist });
    }


    // 清除所有焦点
    placeFocusClear() {

        // log('placeFocusClear 清除所有焦点');

        for (let index = 0; index < this.m_places.length; index++) {
            const placeN = this.m_places[index];
            const placeS = placeN.getComponent(ME_Place);
            if (placeS.getFocus()) {
                placeS.setFocus(false);
            }

        }
    }

    /**
     * 选中所有
     */
    placeFocusAll() {
        for (let index = 0; index < this.m_places.length; index++) {
            const placeN = this.m_places[index];
            const placeS = placeN.getComponent(ME_Place);
            if (!placeS.getFocus()) {
                placeS.setFocus(true);
            }
        }
    }

    /**
     * 获取一个选中的节点
     */
    placeFocusGetOne() {
        for (let index = this.m_places.length - 1; index >= 0; index--) {
            const placeN = this.m_places[index];
            const placeS = placeN.getComponent(ME_Place);
            if (placeS.getFocus()) {
                return placeN;
            }
        }

        return null;
    }

    // 选中的个数
    placeFocusCount() {
        let retCount = 0;
        for (let index = 0; index < this.m_places.length; index++) {
            const placeN = this.m_places[index];
            const placeS = placeN.getComponent(ME_Place);
            if (placeS.getFocus()) {
                retCount++;
            }
        }

        return retCount;
    }

    /**
     * 移动选中的地点
     * @param off 位置偏移
     */
    placeMove(off: Vec3) {
        for (let index = 0; index < this.m_places.length; index++) {
            const placeN = this.m_places[index];
            const placeS = placeN.getComponent(ME_Place);
            if (placeS.getFocus()) {
                const pos = placeN.position.add(off);
                placeN.setPosition(pos);
            }
        }
    }

    // 获取指定的节点对象
    placeGet(id: string) {
        if (id == null) return null;
        if (this.m_places == null) return null;

        for (let index = 0; index < this.m_places.length; index++) {
            const placeN = this.m_places[index];
            const placeS = placeN.getComponent(ME_Place);
            if (placeS.getId() == id) {
                return placeN;
            }
        }
        return null;
    }

    // 删除一个地点
    placeDel(place: Node) {

        const data = place.getComponent(ME_Place).getData();


        // 断开所有连接
        {
            const distN = this.placeGet(data.n);
            if (distN) {
                this.placeConnClose(place, distN);
            }
        }

        {
            const distN = this.placeGet(data.s);
            if (distN) {
                this.placeConnClose(place, distN);
            }
        }

        {
            const distN = this.placeGet(data.w);
            if (distN) {
                this.placeConnClose(place, distN);
            }
        }

        {
            const distN = this.placeGet(data.e);
            if (distN) {
                this.placeConnClose(place, distN);
            }
        }

        {
            const distN = this.placeGet(data.nw);
            if (distN) {
                this.placeConnClose(place, distN);
            }
        }

        {
            const distN = this.placeGet(data.ne);
            if (distN) {
                this.placeConnClose(place, distN);
            }
        }


        {
            const distN = this.placeGet(data.sw);
            if (distN) {
                this.placeConnClose(place, distN);
            }
        }

        {
            const distN = this.placeGet(data.se);
            if (distN) {
                this.placeConnClose(place, distN);
            }
        }


        // 从数组中删除
        for (let index = 0; index < this.m_places.length; index++) {
            const placeNode = this.m_places[index];
            if (placeNode.uuid == place.uuid) {
                this.m_places.splice(index, 1);
            }
        }

        // 删除节点
        place.destroy();

    }

    // 断开两个点的连线
    placeConnClose(place1: Node, place2: Node) {

        const data1 = place1.getComponent(ME_Place).getData();
        const data2 = place2.getComponent(ME_Place).getData();

        SMapUtil.connClose(data1, data2);
        place1.getComponent(ME_Place).setData(data1);
        place2.getComponent(ME_Place).setData(data2);

        this.lineFree(place1, place2);
    }

    // 连接两个点
    placeConnOpen(src: Node, dist: Node, dir: SMapDir) {

        const dataSrc = src.getComponent(ME_Place).getData();
        const dataDist = dist.getComponent(ME_Place).getData();

        SMapUtil.connOpen(dataSrc, dataDist, dir);
        src.getComponent(ME_Place).setData(dataSrc);
        dist.getComponent(ME_Place).setData(dataDist);

        this.lineLoad(src, dist);
    }


    placeDebug() {

        for (let index = 0; index < this.m_places.length; index++) {
            const placeN = this.m_places[index];
            const placeS = placeN.getComponent(ME_Place);
            log(`placeDebug: ${placeS.getId()} focus:${placeS.getFocus()}`);
        }
        return null;
    }

}

