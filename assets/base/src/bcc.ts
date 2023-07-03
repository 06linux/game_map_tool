import { director, EditBox, EventMouse, EventTouch, instantiate, Label, log, Node, Prefab, resources, RichText, size, Sprite, sys, Tween, tween, UIOpacity, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { BaseColor } from './color';

/**
 * cocos 相关函数封装 
 * BCC (base cocos creator)
 */
export class BCC {


    static toV2(v3: Vec3) {
        return v2(v3.x, v3.y);
    }
    static toV3(v2: Vec2) {
        return v3(v2.x, v2.y, 0);
    }

    /**
    * 当前程序运行的平台
    */
    static platform() {
        return sys.platform as string;
    }

    // 检测鼠标是否点击到当前节点（鼠标点击位置是否在当前节点 contengSize 区域内）
    public static isClick(node: Node, event: EventMouse) {
        if (node) {
            const uiLoacation = event.getUILocation();
            // const location = event.getLocation();

            const transform = node.getComponent(UITransform);

            // 转换成当前节点坐标
            const posNode = transform.convertToNodeSpaceAR(v3(uiLoacation.x, uiLoacation.y));
            if (
                posNode.x >= 0 - transform.width * transform.anchorX &&
                posNode.x <= transform.width - transform.width * transform.anchorX &&
                posNode.y >= 0 - transform.height * transform.anchorY &&
                posNode.y <= transform.height - transform.height * transform.anchorY
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * 鼠标点击位置位置转换为节点坐标
     * @param node 
     * @param event 
     */
    public static clickToNode(node: Node, event: EventMouse) {
        const posClick = event.getUILocation();
        // const location = event.getLocation();

        const transform = node.getComponent(UITransform);
        const nodePos = transform.convertToNodeSpaceAR(v3(posClick.x, posClick.y));
        return nodePos;
    }

    public static clickPreviousToNode(node: Node, event: EventMouse) {
        const posClick = event.getUIPreviousLocation();
        const transform = node.getComponent(UITransform);
        const nodePos = transform.convertToNodeSpaceAR(v3(posClick.x, posClick.y));
        return nodePos;
    }

    // 屏幕触摸事件
    public static touchToNode(node: Node, event: EventTouch) {
        const posTouch = event.getUILocation();
        const transform = node.getComponent(UITransform);
        const nodePos = transform.convertToNodeSpaceAR(v3(posTouch.x, posTouch.y));
        return nodePos;
    }

    public static setSprite(node: Node, colorbg: string) {
        if (node) {
            const sprite = node.getComponent(Sprite);
            if (sprite) {
                sprite.color = BaseColor.init2(colorbg);
            }

        }
    }


    public static setLabel(node: Node, txt: string, color?: string) {
        if (node && txt) {
            const label = node.getComponent(Label);
            if (label) {
                label.string = txt;
                if (color) {
                    label.color = BaseColor.init2(color);
                }
            }
        }
    }

    public static setRichText(node: Node, txt: string) {
        if (node && txt) {
            const richText = node.getComponent(RichText);
            if (richText) {
                richText.string = txt;
            }
        }
    }

    // 设置输入框内容
    public static setEditBox(node: Node, txt: string) {
        if (node && txt) {
            const editBox = node.getComponent(EditBox);
            if (editBox) {
                editBox.string = txt;
            }
        }
    }

    public static clearEditBox(node: Node) {
        if (node) {
            const editBox = node.getComponent(EditBox);
            if (editBox) {
                editBox.string = '';
            }
        }
    }

    public static getEditStr(node: Node) {
        if (node) {
            const editBox = node.getComponent(EditBox);
            if (editBox) {
                return editBox.string;
            }
        }

        return '';
    }

    /**
     * 设置 transform
     * @param node 
     * @param width 
     * @param height
     * 
     * 注意： 
     *  获取 contentSize 需要更新一帧后才能获取正确的数值，需要在 update 函数中更新一帧后获取
        const transform = this.node.getChildByName('text').getComponent(UITransform);
        this.setBg(transform.width); 
     */
    public static setTransform(node: Node, width?: number, height?: number) {
        if (node) {
            const transform = node.getComponent(UITransform);       // 当前节点
            if (width) {
                transform.width = width;
            }
            if (height) {
                transform.height = height;
            }
        }
    }

    /**
     * 加载预制体资源 (resource 文件夹下)
     * @param resPrefeb 预制体资源名称（不需要后缀）
     * 
     * 注意： 所有的动态加载资源必放在 asserts/resource/ 目录下面
     * 
     * 举例： const node = await BCC.loadPrefab('panel/CmdInventory'); 对应 asserts/resource/panel/CmdInventory' 预制体 
     */
    public static async loadPrefab(resPrefeb: string): Promise<Node> {

        return new Promise(resolve => {

            // 加载 Prefab 
            resources.load(resPrefeb, Prefab, (err, prefab) => {
                if (err) {
                    log('Error!!, BCC.loadPrefab', err);
                    resolve(null);
                    return;
                }
                const newNode = instantiate(prefab);
                resolve(newNode);
            });

        });
    }





    /**
     * 获取画布大小 （屏幕大小）
     */
    public static canvasSize() {

        let retSize = size(1920, 1080);

        const scene = director.getScene();
        if (scene == null) {
            return retSize;
        }

        const canvasN = scene.getChildByName('Canvas');
        if (canvasN == null) {
            return retSize;
        }

        const transform = canvasN.getComponent(UITransform);
        retSize = transform.contentSize.clone();
        return retSize;

    }

    public static canvas() {

        const scene = director.getScene();
        if (scene == null) {
            return null;
        }

        const canvasN = scene.getChildByName('Canvas');
        return canvasN;
    }

    /**
     * 获取挂在得 canvas 下面的 node 对象
     * @param name 
     * @returns 
     */
    public static getNode(name: string) {

        const scene = director.getScene();
        if (scene == null) {
            return null;
        }

        const canvasN = scene.getChildByName('Canvas');
        return canvasN.getChildByName(name)
    }


    /**
     * 设置对象的透明度
     * @param node 
     * @param opacity 透明度 [0,255]
     */
    public static setOpacity(node: Node, opacity: number) {
        if (node == null) return;
        let uiOpacity = node.getComponent(UIOpacity);
        if (uiOpacity == null) {
            uiOpacity = node.addComponent(UIOpacity);
        }
        uiOpacity.opacity = opacity;
    }


    public static fade(node: Node, time: number, opacity: number) {
        if (node == null) return;

        let uiOpacity = node.getComponent(UIOpacity);
        if (uiOpacity == null) {
            uiOpacity = node.addComponent(UIOpacity);
            uiOpacity.opacity = 255;
        }

        tween(uiOpacity).to(time, { opacity }, { easing: 'fade' }).start();
    }

    /**
     * 淡入淡出
     * @param node 
     * @param time 
     * @param opacity1 
     * @param opacity2 
     * @returns 
     */
    public static fadeLoop(node: Node, time: number = 1.5, opacity1: number = 60, opacity2: number = 255) {
        if (node == null) return;

        let uiOpacity = node.getComponent(UIOpacity);
        if (uiOpacity == null) {
            uiOpacity = node.addComponent(UIOpacity);
        }

        const t1 = tween(uiOpacity)
            .to(time / 2, { opacity: opacity1 }, { easing: 'fade' })
            .to(time / 2, { opacity: opacity2 }, { easing: 'fade' });
        tween(uiOpacity).repeatForever(t1).start();
    }



    /**
     * 淡入
     */
    public static fadeIn(node: Node, time: number = 1) {
        if (node == null) return;

        let uiOpacity = node.getComponent(UIOpacity);
        if (uiOpacity == null) {
            uiOpacity = node.addComponent(UIOpacity);
        }

        uiOpacity.opacity = 0;
        tween(uiOpacity).to(time, { opacity: 255 }, { easing: 'fade' }).start();
    }



    /**
     * 淡出
     */
    public static fadeOut(node: Node, time: number = 1) {
        if (node == null) return;

        let uiOpacity = node.getComponent(UIOpacity);
        if (uiOpacity == null) {
            uiOpacity = node.addComponent(UIOpacity);
        }

        uiOpacity.opacity = 255;
        tween(uiOpacity).to(time, { opacity: 0 }, { easing: 'fade' }).start();
    }


    public static fadeStop(node: Node) {
        if (node == null) return;
        let uiOpacity = node.getComponent(UIOpacity);
        if (uiOpacity) {
            uiOpacity.opacity = 255;
            Tween.stopAllByTarget(uiOpacity);
        }
    }

    public static fadeValue(node: Node, time: number = 1) {
        if (node == null) return -1;

        let uiOpacity = node.getComponent(UIOpacity);
        if (uiOpacity == null) {
            return 255;
        }
        return uiOpacity.opacity;
    }

    /**
     * 移动到目标地址 
     * @param node 对象
     * @param time 移动时间，单位：秒
     * @param pos  目标地址
     * @param callback 移动完成后的回调函数
     * @returns 
     * 
     * 参考： 
     * https://github.com/cocos/cocos-test-projects/blob/v3.6/assets/cases/tween/script/tween-test.ts
     * https://docs.cocos.com/creator/3.0/manual/zh/tween/
     */
    public static move(node: Node, time: number, pos: Vec3, callback: () => void = null) {

        if (node == null) return;

        tween(node)
            .to(time, { position: pos }, { easing: 'smooth' })
            .call(() => {
                if (callback) {
                    callback();
                }
            })
            .start();
    }

    /**
     * 缩放动画 
     * @param node 对象
     * @param time 移动时间，单位：秒
     * @param pos  目标地址
     * @param callback 移动完成后的回调函数
     * @returns 
     */
    public static scale(node: Node, time: number, scale: Vec3, callback: () => void = null) {

        if (node == null) return;

        tween(node)
            .to(time, { scale: scale }, { easing: 'smooth' })
            .call(() => {
                if (callback) {
                    callback();
                }
            })
            .start();
    }


    /**
     *  循环旋转 (Z周旋转)
     */
    public static angleLoop(node: Node, time: number = 5) {
        if (node == null) return;

        const t1 = tween(node)
            .to(time / 2, { angle: 180 }, { easing: 'linear' })
            .to(time / 2, { angle: 360 }, { easing: 'linear' })
            .call(() => {
                node.angle = 0;
            });
        tween(node).repeatForever(t1).start();
    }

    public static angleTo(node: Node, time: number, angle: number) {
        if (node == null) return;
        tween(node).to(time, { angle: angle }, { easing: 'linear' }).start();
    }

}