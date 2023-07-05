import { Component, Event, log, Node, size, v2, _decorator } from 'cc';
import { BaseButton, BaseColor, BaseConfig, BaseEvent, BaseFile, BaseFontSize, BaseLayout, BaseLoading, BaseMenu, BaseSav, BaseSocket, BaseSpace, BaseStr, BaseText, BaseTime, BaseUtil, SMsg, STag } from '../base';
import { ME_EditMenu } from '../resources/menu/ME_EditMenu';
import { SMap } from '../src/s_map';
const { ccclass, property } = _decorator;

/**
 * 地图列表显示
 */
@ccclass('ME_MapList')
export class ME_MapList extends Component {

    @property({ type: Node })
    m_pageBar: Node = null;

    @property({ type: Node })
    m_menuBar: Node = null;

    @property({ type: Node })
    m_content: Node = null;


    public static SEARCH = {
        zone: '',
        name: '',
    };

    private m_page = 0;
    private m_pageMax = 0;
    private m_pageSize = BaseConfig.pageSize;
    private m_total = 0;
    private m_list = [] as SMap[];
    private m_textN: Node = null;

    private m_savKey = 'map_list';

    onLoad() {
        // 当前UI定义的事件
        BaseEvent.on('ME_MapList.refresh', this.refresh, this);
        BaseEvent.on('ME_MapList.refreshHome', this.refreshHome, this);
        BaseEvent.on('ME_MapList.refreshUI', this.refreshUI, this);
        BaseEvent.on('ME_MapList.add', this.add, this);   // 添加一个地图
        BaseEvent.on('ME_MapList.set', this.set, this);   // 更新一个地图
        BaseEvent.on('ME_MapList.del', this.del, this);   // 删除一个地图

        BaseSav.load(this.m_savKey);
    }

    onDestroy() {

        BaseEvent.off('ME_MapList.refresh', this.refresh, this);
        BaseEvent.off('ME_MapList.refreshHome', this.refreshHome, this);
        BaseEvent.off('ME_MapList.refreshUI', this.refreshUI, this);

        BaseEvent.off('ME_MapList.add', this.add, this);
        BaseEvent.off('ME_MapList.set', this.set, this);   // 更新一个地图
        BaseEvent.off('ME_MapList.del', this.del, this);   // 删除一个地图

    }

    start() {
        this.initMenuBar();
        this.initPageBar();
        this.refreshHome();
    }

    initMenuBar() {

        {
            const btnN = BaseButton.load({ text: '新建', fontSize: BaseFontSize.NOR, colorbg: BaseColor.value('BG_NOR') });
            this.m_menuBar.addChild(btnN);
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_MapList', 'onMenuClick', '新建');
        }

        {
            const btnN = BaseButton.load({ text: '搜索', fontSize: BaseFontSize.NOR, colorbg: BaseColor.value('BG_NOR') });
            this.m_menuBar.addChild(btnN);
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_MapList', 'onMenuClick', '搜索');
        }

        {
            const btnN = BaseButton.load({ text: '首页', fontSize: BaseFontSize.NOR, colorbg: BaseColor.value('BG_NOR') });
            this.m_menuBar.addChild(btnN);
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_MapList', 'onMenuClick', '首页');
        }

        {
            const btnN = BaseButton.load({ text: '刷新', fontSize: BaseFontSize.NOR, colorbg: BaseColor.value('BG_NOR') });
            this.m_menuBar.addChild(btnN);
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_MapList', 'onMenuClick', '刷新');
        }

        {
            const btnN = BaseButton.load({ text: '导入', fontSize: BaseFontSize.NOR, colorbg: BaseColor.value('BG_NOR') });
            this.m_menuBar.addChild(btnN);
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_MapList', 'onMenuClick', '导入');
        }

        {
            const btnN = BaseButton.load({ text: '导出', fontSize: BaseFontSize.NOR, colorbg: BaseColor.value('BG_NOR') });
            this.m_menuBar.addChild(btnN);
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_MapList', 'onMenuClick', '导出');
        }

        {
            const btnN = BaseButton.load({ text: '退出', fontSize: BaseFontSize.NOR, colorbg: BaseColor.value('RED') });
            this.m_menuBar.addChild(btnN);
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_MapList', 'onMenuClick', '退出');
        }

    }

    async onMenuClick(event: Event, cmd: string) {
        console.log('ME_MapList.onClickButton', cmd);

        switch (cmd) {
            case '新建':
                {
                    BaseMenu.loadPrefab('ME_NewMenu', { name: 'ME_NewMenu' });
                }
                break;
            case '首页':
                {
                    this.refreshHome();
                }
                break;
            case '刷新':
                {
                    this.refresh();
                }
                break;
            case '导出':
                {
                    this.exportJson();
                }
                break;
            case '导入':
                {
                    this.importJson();
                }
                break;
            case '搜索':
                {
                    BaseMenu.loadPrefab('ME_FindMenu', { name: 'ME_FindMenu' });
                }
                break;
            case '退出':
                {
                    const res = await BaseMenu.showDialog('确认退出么？');
                    if (res == '确定') {
                        BaseLoading.load({ switchScene: 'MainScene' });
                    }
                }
                break;
            default:
                break;
        }
    }

    initPageBar() {

        {
            const btnN = BaseButton.load({ text: '上一页', colorbg: BaseColor.value('BG_NOR') });
            const btnS = btnN.getComponent(BaseButton);
            this.m_pageBar.addChild(btnN)
            btnS.setClick(this.node, 'ME_MapList', 'onBtnClick', '上一页');
        }

        {
            const btnN = BaseButton.load({ text: '下一页', colorbg: BaseColor.value('BG_NOR') });
            const btnS = btnN.getComponent(BaseButton);
            this.m_pageBar.addChild(btnN)
            btnS.setClick(this.node, 'ME_MapList', 'onBtnClick', '下一页');
        }

        {
            this.m_textN = BaseText.load({ text: `【页数】` });
            this.m_pageBar.addChild(this.m_textN);
        }
    }


    // 主面板内容
    initContent() {

        this.m_content.destroyAllChildren();

        for (let index = 0; index < this.m_list.length; index++) {
            const map = this.m_list[index];

            const list = [];
            const textAnchor = v2(0, 0.5);

            {
                const textN = BaseText.load({ text: `${map.zone}`, anchor: textAnchor });
                const spaceN = BaseSpace.load({ size: size(200, 50), anchor: textAnchor, child: textN });
                list.push(spaceN);
            }

            {
                const textN = BaseText.load({ text: `${map.name}`, anchor: textAnchor });
                const spaceN = BaseSpace.load({ size: size(300, 50), anchor: textAnchor, child: textN });
                list.push(spaceN);

                textN.getComponent(BaseText).setClick(this.node, 'ME_MapList', 'onBtnClick', '详情');
                BaseUtil.setData(textN, map);
            }


            // {
            //     const textN = BaseText.load({ text: `作者：${map.uname.substring(0, 5)}`, anchor: textAnchor });
            //     const spaceN = BaseSpace.load({ size: size(200, 50), anchor: textAnchor, child: textN });
            //     list.push(spaceN);
            // }

            {
                let color = 'F5FF00';
                if (map.type == '危险区') {
                    color = 'FF0000';
                }
                if (map.type == '保护区') {
                    color = '25F35F';
                }

                const textN = BaseText.load({ text: `类型：${map.type}`, anchor: textAnchor, color });
                list.push(textN);
            }

            {
                const textN = BaseText.load({ text: `${map.timeStr}`, size: size(300, 50), anchor: textAnchor });
                list.push(textN);
            }

            {
                const btnN = BaseText.load({ text: '详情' });
                btnN.getComponent(BaseText).setClick(this.node, 'ME_MapList', 'onBtnClick', '详情');
                BaseUtil.setData(btnN, map);
                list.push(btnN);
            }


            {
                const btnN = BaseText.load({ text: '编辑' });
                btnN.getComponent(BaseText).setClick(this.node, 'ME_MapList', 'onBtnClick', '编辑');
                BaseUtil.setData(btnN, map);
                list.push(btnN);
            }

            {
                const btnN = BaseText.load({ text: '删除', color: 'ff0000' });
                btnN.getComponent(BaseText).setClick(this.node, 'ME_MapList', 'onBtnClick', '删除');
                BaseUtil.setData(btnN, map);
                list.push(btnN);
            }


            const layoutH = BaseLayout.load({ type: 'HORIZONTAL', spacingX: 40, resizeMode: 'NONE', size: size(1700, 80), childs: list });
            const spaceN = BaseSpace.load({ size: size(1760, 80), child: layoutH, colorbg: (index % 2 == 0) ? '#45474B' : '#3D4352' })
            this.m_content.addChild(spaceN);
        }
    }

    update(deltaTime: number) {

    }

    // 初始化当前页面数据
    initPage() {
        const retData = BaseSav.find(this.m_savKey, {}, this.m_page, this.m_pageSize);

        log('initPage', retData);


        this.m_list = retData.list;
        this.m_total = retData.total;

        if (this.m_total % this.m_pageSize == 0) {
            this.m_pageMax = Math.floor(this.m_total / this.m_pageSize);
        }
        else {
            this.m_pageMax = Math.floor(this.m_total / this.m_pageSize) + 1;
        }

        if (this.m_textN) {
            const textS = this.m_textN.getComponent(BaseText);
            textS.init({ text: `【页数：${this.m_page + 1}/${this.m_pageMax}  数量：${this.m_list.length}  总数：${this.m_total}】` });
        }

        this.refreshUI();
    }

    private async onBtnClick(event: Event, cmd: string) {

        if (cmd == '上一页') {
            this.m_page--;
            if (this.m_page < 0) {
                this.m_page = 0;
                BaseMenu.showMsg('前面没有数据了！');
            }
            else {
                this.refresh();
            }
        }

        if (cmd == '下一页') {
            this.m_page++;
            if (this.m_page >= this.m_pageMax) {
                this.m_page = this.m_pageMax;
                BaseMenu.showMsg('后面没有数据了');
            }
            else {
                this.refresh();
            }
        }

        if (cmd == '删除') {
            const map = BaseUtil.getData(event.target) as SMap;
            const res = await BaseMenu.showDialog(`是否删除【${map.name}】?`, '删除', '取消');
            if (res == '删除') {
                this.del(map._id);
            }
        }

        if (cmd == '编辑') {
            const map = BaseUtil.getData(event.target) as SMap;
            const menuN = await BaseMenu.loadPrefab('ME_EditMenu');
            const menuS = menuN.getComponent(ME_EditMenu);
            menuS.init(map);
        }

        if (cmd == '详情') {
            const map = BaseUtil.getData(event.target) as SMap;
            BaseEvent.emit('ME_Scene.showMapEdit', map);
        }

    }

    // 刷新当前页面
    private refresh() {
        this.initPage();
    }

    // 刷新首页
    private refreshHome() {
        this.m_page = 0;
        this.initPage();
    }

    private refreshUI() {
        this.initContent();
    }

    // 添加一个地图
    private add(data: SMap) {
        BaseSav.set(this.m_savKey, data._id, data);
        this.refresh();
        BaseSav.save(this.m_savKey);
        BaseMenu.showSuccess('添加成功');
    }

    private set(data: SMap) {
        BaseSav.set(this.m_savKey, data._id, data);
        this.refresh();
        BaseSav.save(this.m_savKey);
        BaseMenu.showSuccess('修改成成功');
    }

    private del(id: string) {
        BaseSav.del(this.m_savKey, id);
        this.refresh();
        BaseSav.save(this.m_savKey);
        BaseMenu.showSuccess('删除成功');
    }

    exportJson() {
        const list = BaseSav.getAll(this.m_savKey);
        if (list && list.length > 0) {
            const str = JSON.stringify(list);
            BaseFile.save(str, `地图列表_${BaseTime.dateStr()}_${BaseStr.uidInvite8()}.json`);
        }
    }

    async importJson() {

        const res = await BaseFile.open('.json');
        if (BaseUtil.isNull(res)) {
            return;
        }

        const obj = JSON.parse(res);
        if (Array.isArray(obj)) {
            const list = obj as any[];
            for (let index = 0; index < list.length; index++) {
                const data = list[index];
                if (data['id']) {
                    BaseSav.set(this.m_savKey, data['id'], data);
                }
                else if (data['_id']) {
                    BaseSav.set(this.m_savKey, data['_id'], data);
                }
            }
        }
        else {
            const data = obj
            if (data['id']) {
                BaseSav.set(this.m_savKey, data['id'], data);
            }
            else if (data['_id']) {
                BaseSav.set(this.m_savKey, data['_id'], data);
            }
        }

        BaseSav.save(this.m_savKey);

        this.refreshHome();
    }
}

