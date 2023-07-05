import { Component, director, Event, log, Node, size, _decorator } from 'cc';
import { MusicTool, BaseText, BaseStr, BaseFile, BaseHttp, BaseConfig, HttpRes, BaseMenu, BaseLayout, BaseMark, BaseSpace, BaseLoading, BCC, BaseSav } from '../base';

const { ccclass, property } = _decorator;

@ccclass('TestScene')
export class TestScene extends Component {


    @property({ type: Node })
    private m_bttton: Node = null;         // ui  层


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
        this.initButton();
    }

    initMusic() {
        MusicTool.freeAll();
        // MusicTool.load('sound_touch');
        // MusicTool.loadPlay('music_1');
    }


    private initButton() {

        {
            const textN = BaseText.load({ text: '回主界面', colorbg: 'ff0000', fontSize: 30, type: 'VERTICAL' });
            const textS = textN.getComponent(BaseText);
            textS.setClick(this.node, 'TestScene', 'onButtonClick', '主界面');
            this.m_bttton.addChild(textN);
        }

        {
            const textN = BaseText.load({ text: '菜单测试', colorbg: 'ff0000', fontSize: 30, type: 'VERTICAL' });
            const textS = textN.getComponent(BaseText);
            textS.setClick(this.node, 'TestScene', 'onButtonClick', '菜单测试');
            this.m_bttton.addChild(textN);
        }

        {
            const textN = BaseText.load({ text: '网络测试', colorbg: 'ff0000', fontSize: 30, type: 'VERTICAL' });
            const textS = textN.getComponent(BaseText);
            textS.setClick(this.node, 'TestScene', 'onButtonClick', '网络测试');
            this.m_bttton.addChild(textN);
        }

        {
            const textN = BaseText.load({ text: '网络请求', colorbg: 'ff0000', fontSize: 30, type: 'VERTICAL' });
            const textS = textN.getComponent(BaseText);
            textS.setClick(this.node, 'TestScene', 'onButtonClick', '网络请求');
            this.m_bttton.addChild(textN);
        }

        {
            const textN = BaseText.load({ text: '黑山老妖', colorbg: 'ff0000', fontSize: 30, type: 'VERTICAL' });
            const textS = textN.getComponent(BaseText);
            textS.setClick(this.node, 'TestScene', 'onButtonClick', '黑山老妖');
            this.m_bttton.addChild(textN);
        }

        {
            const textN = BaseText.load({ text: '粒子测试', colorbg: 'ff0000', fontSize: 30, type: 'VERTICAL' });
            const textS = textN.getComponent(BaseText);
            textS.setClick(this.node, 'TestScene', 'onButtonClick', '粒子测试');
            this.m_bttton.addChild(textN);
        }

        {
            const textN = BaseText.load({ text: '写存档', colorbg: 'ff0000', fontSize: 30, type: 'VERTICAL' });
            const textS = textN.getComponent(BaseText);
            textS.setClick(this.node, 'TestScene', 'onButtonClick', '写存档');
            this.m_bttton.addChild(textN);
        }

        {
            const textN = BaseText.load({ text: '读存档', colorbg: 'ff0000', fontSize: 30, type: 'VERTICAL' });
            const textS = textN.getComponent(BaseText);
            textS.setClick(this.node, 'TestScene', 'onButtonClick', '读存档');
            this.m_bttton.addChild(textN);
        }

    }

    private initInfo() {

    }


    async onButtonClick(event: Event, cmd: string) {

        log('onButtonClick', cmd);

        switch (cmd) {
            case '主界面':
                BaseLoading.load({ switchScene: 'MainScene' });
                break;
            case '菜单测试':
                {
                    const textN1 = BaseMark.load({ text: `$RED$$BHIY$三国演义11\n$BNOR$滚滚长江东逝水，\n浪花淘尽英雄，\n是非成败转头空，\n古今多少事，\n都付笑谈中！$滚滚长江东逝水，\n浪花淘尽英雄，\n是非成败转头空，\n古今多少事，\n都付笑谈中！$滚滚长江东逝水，\n浪花淘尽英雄，\n是非成败转头空，\n古今多少事，\n都付笑谈中！` });
                    const textN2 = BaseMark.load({ text: `$RED$$BHIY$三国演义11\n$BNOR$滚滚长江东逝水，\n浪花淘尽英雄，\n是非成败转头空，\n古今多少事，\n都付笑谈中！$滚滚长江东逝水，\n浪花淘尽英雄，\n是非成败转头空，\n古今多少事，\n都付笑谈中！$滚滚长江东逝水，\n浪花淘尽英雄，\n是非成败转头空，\n古今多少事，\n都付笑谈中！` });
                    const textN3 = BaseMark.load({ text: `$RED$$BHIY$三国演义11\n$BNOR$滚滚长江东逝水，\n浪花淘尽英雄，\n是非成败转头空，\n古今多少事，\n都付笑谈中！$滚滚长江东逝水，\n浪花淘尽英雄，\n是非成败转头空，\n古今多少事，\n都付笑谈中！$滚滚长江东逝水，\n浪花淘尽英雄，\n是非成败转头空，\n古今多少事，\n都付笑谈中！` });
                    const textN4 = BaseMark.load({ text: `$RED$$BHIY$三国演义11\n$BNOR$滚滚长江东逝水，\n浪花淘尽英雄，\n是非成败转头空，\n古今多少事，\n都付笑谈中！$滚滚长江东逝水，\n浪花淘尽英雄，\n是非成败转头空，\n古今多少事，\n都付笑谈中！$滚滚长江东逝水，\n浪花淘尽英雄，\n是非成败转头空，\n古今多少事，\n都付笑谈中！` });
                    const layoutN = BaseLayout.loadGrid(3);
                    layoutN.addChild(textN1);
                    layoutN.addChild(textN2);
                    layoutN.addChild(textN3);
                    layoutN.addChild(textN4);


                    BaseMenu.loadNode(layoutN, { lifetime: 5 });
                }
                break;
            case '网络测试':
                {
                    const res = await BaseHttp.fetchData('GET', `${BaseConfig.SERVER_HTTP}/api_v1/util/time`);
                    BaseMenu.showMsg(`网络数据:${res}`);
                }
                break;
            case '网络请求':
                {
                    const res = await BaseHttp.fetchData('POST', `${BaseConfig.SERVER_HTTP}/api_v1/test/test-parms`, { name: '张三', desc: '我是张三' })
                    log("网络请求", res);
                }
                break;
            case '粒子测试':
                {
                    BaseMenu.loadPrefab('TestLiZi', null, 'test');
                }
                break;
            case '写存档':
                {
                    const key = 'user';
                    BaseSav.load(key);

                    const user1 = { id: '111', name: '张三111', age: 11 };
                    const user2 = { id: '222', name: '张三222', age: 10 };
                    const user3 = { id: '333', name: '张三333', age: 10 };
                    const user4 = { id: '444', name: '张三444', age: 11 };

                    BaseSav.set(key, user1.id, user1);
                    BaseSav.set(key, user2.id, user2);
                    BaseSav.set(key, user3.id, user3);
                    BaseSav.set(key, user4.id, user4);

                    BaseSav.saveAll();
                }
                break;
            case '读存档':
                {
                    const key = 'user';
                    BaseSav.load(key);

                    log('getById', BaseSav.getById(key, '111'));
                    log('getMore', BaseSav.getMore(key, { age: 10 }));
                }
                break;
            case 'xxxx':
                {
                }
                break;
            default:
                break;
        }

    }

}

