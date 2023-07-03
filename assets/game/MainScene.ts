import { Component, Event, Node, size, _decorator } from 'cc';
import { BaseButton, BaseColor, BaseConfig, BaseFontSize, BaseLayout, BaseLoading, BaseMark, BaseMask, BaseMenu, BaseSpace, BCC, MusicTool } from '../base';
const { ccclass, property } = _decorator;

/**
 * 登录页面
 */
@ccclass('MainScene')
export class MainScene extends Component {

    @property({ type: Node })
    private m_ui: Node = null;

    onLoad() {

        this.init();
        BCC.fadeIn(this.node, 1.5);
    }

    start() {
    }


    update(deltaTime: number) {
    }


    init() {
        this.initMusic();
        this.initUI();
    }


    initMusic() {
        MusicTool.freeAll();
        // MusicTool.load('sound_touch');
        // MusicTool.loadPlay('music_1');
    }

    initUI() {
        this.loadTitle();
        this.loadTips();
        this.loadButton();
    }



    // 游戏名称
    loadTitle() {
        const showSize = size(1000, 60);
        const text = `《地图编辑器》-- 文字类游戏地图工具！`;
        const textN = BaseMark.load({ text, fontSize: BaseFontSize.TITLE, type: 'HORIZONTAL' });
        const spaceN = BaseSpace.load({ size: showSize, colorbg: BaseColor.value('BG_NOR'), child: textN });
        const maskN = BaseMask.load({ size: showSize, child: spaceN });
        this.m_ui.addChild(maskN);
    }

    // 信息提示
    loadTips() {

        const showSize = size(1000, 320);
        const text = `$BRED$道德经$BNOR$\n\n道可道\n非常道\n名可名\n非常名\n无名天地之始\n有名万物之母\n故常无欲\n以观其妙\n常有欲\n以观其徼\n此两者\n同出而异名\n同谓之玄\n玄之又玄\n众妙之门`;
        const textN = BaseMark.load({ text, fontSize: BaseFontSize.TITLE, type: 'VERTICAL' });
        const spaceN = BaseSpace.load({ size: showSize, colorbg: BaseColor.value('BG_NOR'), child: textN });
        const maskN = BaseMask.load({ size: showSize, child: spaceN });
        const maskS = maskN.getComponent(BaseMask);

        this.m_ui.addChild(maskN);
        maskS.startAn('IN_RIGHT', 2.5);
    }


    loadButton() {

        const btnColor = BaseColor.value('BG_BTN');
        const btnList: Node[] = [];

        btnList.push(...[
            this.loadOneButton('功能测试', btnColor),
            this.loadOneButton('关于我们', btnColor),
            this.loadOneButton('工具介绍', btnColor),
            this.loadOneButton('地图工具', BaseColor.value('RED')),
        ]);

        const layoutN = BaseLayout.loadGrid(8, btnList, 60);
        const maskSize = size(1000, 260);
        const spaceN = BaseSpace.load({ size: maskSize, colorbg: BaseColor.value('BG_NOR'), child: layoutN });
        const maskN = BaseMask.load({ size: maskSize, child: spaceN });

        const maskS = maskN.getComponent(BaseMask);

        this.m_ui.addChild(maskN);
        maskS.startAn('IN_RIGHT', 2.5);
    }

    loadOneButton(text: string, colorbg: string, cmd?: string,) {
        const btnN = BaseButton.load({ text, type: 'VERTICAL', colorbg, size: size(70, 200), fontSize: BaseFontSize.BTN });
        btnN.getComponent(BaseButton).setClick(this.node, 'MainScene', 'onClickButton', cmd ? cmd : text);
        return btnN;
    }


    async onClickButton(event: Event, cmd: string) {

        console.log('onClickButton', cmd);
        // MusicTool.playSound('sound_touch');

        switch (cmd) {

            case '功能测试':
                {
                    BaseLoading.load({ switchScene: 'TestScene' });
                }
                break;
            case '地图工具':
                {
                    BaseLoading.load({ switchScene: 'ME_Scene' });
                }
                break;
            case '工具介绍':
                {
                    BaseMenu.showDialog('使用 cocos creator 开发的一款地图工具软件，适合文字游戏开发', '确定', null);
                }
                break;
            case '关于我们':
                {
                    BaseMenu.showDialog('作者：星河 \n\n QQ:605606385\n  Email:linux_wuliqiang@qq.com', '确定', null);
                }
                break;
            default:
                break;
        }

    }


}

