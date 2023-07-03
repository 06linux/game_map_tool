import { _decorator, Component, Node, log } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TestLiZi')
export class TestLiZi extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    onClick() {
        log('TestLiZi.onClick, 按下测试...');
    }
}

