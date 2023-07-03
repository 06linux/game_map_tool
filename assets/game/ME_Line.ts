import { Component, Graphics, Node, size, UITransform, v2, _decorator } from 'cc';
import { ME_Place } from './ME_Place';
const { ccclass, property } = _decorator;

/**
 * 两个地点之间的连线
 */
@ccclass('ME_Line')
export class ME_Line extends Component {

    m_place1: Node = null;              // 地点（ME_Space)
    m_place2: Node = null;              // 地点（ME_Space)

    /**
     * 两个地点确定一条直线
     * @param place1  地图地点对象
     * @param place2 地图地点对象
     */
    init(place1: Node, place2: Node) {
        this.m_place1 = place1;
        this.m_place2 = place2;
        this.draw();
    }

    // 检测是否某个点的连线
    checkNode(place: Node) {

        if (this.m_place1.uuid == place.uuid || this.m_place2.uuid == place.uuid) {
            return true;
        }
        return false;
    }

    /**
     * 检测当前的线条是否是 node1 到 node2 的连线
     */
    check(place1: Node, place2: Node) {

        if (this.m_place1.uuid == place1.uuid && this.m_place2.uuid == place2.uuid) {
            return true;
        }

        if (this.m_place1.uuid == place2.uuid && this.m_place2.uuid == place1.uuid) {
            return true;
        }

        return false;
    }

    getPos(place1: Node, place2: Node) {

        const g = this.getComponent(Graphics);

        const data1 = place1.getComponent(ME_Place).getData();
        const data2 = place2.getComponent(ME_Place).getData();

        const placeSize = place1.getComponent(UITransform).contentSize;
        const uiSize = size(placeSize.width + g.lineWidth, placeSize.height + g.lineWidth);
        const pos = v2(place1.position.x, place1.position.y);

        if (data1.n == data2._id) {
            return pos.add(v2(0, uiSize.height / 2));
        }
        if (data1.s == data2._id) {
            return pos.add(v2(0, -uiSize.height / 2));
        }

        if (data1.w == data2._id) {
            return pos.add(v2(-uiSize.width / 2, 0));
        }

        if (data1.e == data2._id) {
            return pos.add(v2(uiSize.width / 2, 0));
        }


        if (data1.nw == data2._id) {
            return pos.add(v2(-uiSize.width / 2, uiSize.height / 2));
        }

        if (data1.ne == data2._id) {
            return pos.add(v2(uiSize.width / 2, uiSize.height / 2));
        }

        if (data1.sw == data2._id) {
            return pos.add(v2(-uiSize.width / 2, -uiSize.height / 2));
        }

        if (data1.se == data2._id) {
            return pos.add(v2(uiSize.width / 2, -uiSize.height / 2));
        }

        return pos;
    }


    refreshUI() {
        this.draw();
    }

    private draw() {
        if (this.m_place1 && this.m_place2) {
            // const pos1 = v2(this.m_place1.position.x, this.m_place1.position.y);
            // const pos2 = v2(this.m_place2.position.x, this.m_place2.position.y);

            const pos1 = this.getPos(this.m_place1, this.m_place2);
            const pos2 = this.getPos(this.m_place2, this.m_place1);

            const g = this.getComponent(Graphics);
            const radius = g.lineWidth;       // 圆圈半径

            g.clear();
            g.moveTo(pos1.x, pos1.y);
            g.lineTo(pos2.x, pos2.y);
            g.stroke();

            g.moveTo(pos1.x, pos1.y);
            g.circle(pos1.x, pos1.y, radius);
            g.fill();

            g.moveTo(pos2.x, pos2.y);
            g.circle(pos2.x, pos2.y, radius);
            g.fill();
        }
    }
}

