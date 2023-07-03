import { Component, Event, EventKeyboard, Input, KeyCode, Node, _decorator, input, log, size } from 'cc';
import { BaseButton, BaseColor, BaseLayout, BaseMark, BaseMenu } from '../../base';
import { ME_MapEdit } from '../../game/ME_MapEdit';
import { ME_Place } from '../../game/ME_Place';
import { SMapDir, SMapUtil } from '../../src/s_map';
const { ccclass, property } = _decorator;


/**
 * 两个地点之间的连接菜单
 */
@ccclass('ME_ConnMenu')
export class ME_ConnMenu extends Component {

    @property({ type: Node })
    m_content: Node = null;

    m_src: Node = null;             // 连接的开始点(ME_Place)
    m_dist: Node = null;            // 连接的目标点(ME_Place)

    onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }


    init(src: Node, dist: Node) {

        this.m_src = src;
        this.m_dist = dist;

        this.initInfo();
        this.initBtns();
    }

    initInfo() {

        const dataSrc = this.m_src.getComponent(ME_Place).getData();
        const dataDist = this.m_dist.getComponent(ME_Place).getData();
        const markN = BaseMark.load({ text: `$HIY$${dataSrc.name} → ${dataDist.name}` })
        this.m_content.addChild(markN);

    }

    initBtns() {


        const btnSize = size(120, 120);
        const btns = [];
        {
            const btnN = BaseButton.load({ text: '西北', size: btnSize, colorbg: BaseColor.value('BG_MENU') });
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_ConnMenu', 'onButtonClick', SMapDir.NW);
            btns.push(btnN);
        }
        {
            const btnN = BaseButton.load({ text: '北', size: btnSize, colorbg: BaseColor.value('BG_MENU') });
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_ConnMenu', 'onButtonClick', SMapDir.N);
            btns.push(btnN);
        }
        {
            const btnN = BaseButton.load({ text: '东北', size: btnSize, colorbg: BaseColor.value('BG_MENU') });
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_ConnMenu', 'onButtonClick', SMapDir.NE);
            btns.push(btnN);
        }
        {
            const btnN = BaseButton.load({ text: '西', size: btnSize, colorbg: BaseColor.value('BG_MENU') });
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_ConnMenu', 'onButtonClick', SMapDir.W);
            btns.push(btnN);
        }
        {
            const btnN = BaseButton.load({ text: '断开', size: btnSize, colorbg: 'ff0000' });
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_ConnMenu', 'onButtonClick', '断开');
            btns.push(btnN);
        }
        {
            const btnN = BaseButton.load({ text: '东', size: btnSize, colorbg: BaseColor.value('BG_MENU') });
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_ConnMenu', 'onButtonClick', SMapDir.E);
            btns.push(btnN);
        }
        {
            const btnN = BaseButton.load({ text: '西南', size: btnSize, colorbg: BaseColor.value('BG_MENU') });
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_ConnMenu', 'onButtonClick', SMapDir.SW);
            btns.push(btnN);
        }
        {
            const btnN = BaseButton.load({ text: '南', size: btnSize, colorbg: BaseColor.value('BG_MENU') });
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_ConnMenu', 'onButtonClick', SMapDir.S);
            btns.push(btnN);
        }
        {
            const btnN = BaseButton.load({ text: '东南', size: btnSize, colorbg: BaseColor.value('BG_MENU') });
            btnN.getComponent(BaseButton).setClick(this.node, 'ME_ConnMenu', 'onButtonClick', SMapDir.SE);
            btns.push(btnN);
        }

        const layoutN = BaseLayout.loadGrid(3, btns);
        this.m_content.addChild(layoutN);
    }

    
    onButtonClick(event: Event, cmd: string) {
        log('ME_ConnMenu.onButtonClick', cmd);

        // 连接命令
        if (cmd == '断开') {

            ME_MapEdit.Instance.placeConnClose(this.m_src, this.m_dist);
        }
        else {

            ME_MapEdit.Instance.placeConnClose(this.m_src, this.m_dist);   // 先断开

            const dir = cmd as SMapDir;
            const dirReverse = SMapUtil.dirReverse(dir);

            // 先断开旧连接
            {
                const placeN = this.m_src.getComponent(ME_Place).getConnect(dir);
                if (placeN) {
                    ME_MapEdit.Instance.placeConnClose(this.m_src, placeN);
                }
            }

            {
                const placeN = this.m_dist.getComponent(ME_Place).getConnect(dirReverse);
                if (placeN) {
                    ME_MapEdit.Instance.placeConnClose(this.m_dist, placeN);
                }
            }
            
            ME_MapEdit.Instance.placeConnOpen(this.m_src, this.m_dist, dir);
        }

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

