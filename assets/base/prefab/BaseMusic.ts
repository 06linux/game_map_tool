import { AudioClip, AudioSource, Component, director, instantiate, log, Node, resources, _decorator } from 'cc';
import { Base } from './Base';
const { ccclass, property } = _decorator;


/**
 * 音乐音效控制
 * 
 * 音乐： 只游戏的背景音乐，重复播放
 * 音效： 游戏中的爆照，打击剩余，一般只播放一次
 */
@ccclass('BaseMusic')
export class BaseMusic extends Component {

    private m_audio: AudioSource = null;

    init() {
        this.m_audio = this.node.getComponent(AudioSource)!;
    }

    stop() {
        this.m_audio.stop();
    }

    play(loop: boolean) {
        this.m_audio.loop = loop;
        this.m_audio.play();
    }

    setClip(sound: AudioClip) {
        this.m_audio.clip = sound;
    }

}

export class BaseMusicUtil {

    public static isOpenMusic = true;       // 是否开启音效
    public static isOpenSound = true;       // 是否开启音效

    public static playMusic(node: Node) {
        if (node == null) return;
        if (!this.isOpenMusic) return;

        const script = node.getComponent(BaseMusic);
        if (script) {
            script.play(true);
        }
    }

    public static playSound(node: Node) {
        if (node == null) return;
        if (!this.isOpenSound) return;

        const script = node.getComponent(BaseMusic);
        if (script) {
            script.play(false);
        }
    }

    public static stop(node: Node) {
        if (node == null) return;
        const script = node.getComponent(BaseMusic);
        if (script) {
            script.stop();
        }
    }


    /**
    * 加载一个音乐对象
    * @param resName 资源名称（不需要后缀） 必须是 resource/music 资源文目录中的资源文件 
    * 
    * 注意： 音乐文件必须放在 resource/music 目录中，统一通过名字加载
    */
    public static async load(resName: string, isPlay = false, loop = false): Promise<Node> {

        return new Promise(resolve => {

            const scene = director.getScene();
            if (scene == null) {
                resolve(null);
                return;
            }

            const baseN = scene.getChildByName("Base");
            if (baseN == null) {
                resolve(null);
                return;
            }

            const baseS = baseN.getComponent(Base) as Base;

            // 加载 Prefab 
            resources.load('music/' + resName, AudioClip, (err, clip) => {
                if (err) {
                    log('Error!!, MusicManager.load', err);
                    resolve(null);
                    return;
                }

                const objN = instantiate(baseS.BaseMusic);
                const objS = objN.getComponent(BaseMusic);
                objS.init();
                objS.setClip(clip);

                if (isPlay) {
                    objS.play(loop);
                }

                baseS.addMusic(objN)

                resolve(objN);
            });
        });
    }

}


/**
 * 音乐管理工具
 */
export class MusicTool {

    private static m_map = new Map<string, Node>();

    /**
     * 加载一个音乐对象
     * @param name 资源名称（不需要后缀） 必须是 resource/music/ 资源文目录中的资源文件 
     */
    public static async load(name: string) {
        const musicN = await BaseMusicUtil.load(name);
        if (musicN) {
            this.m_map.set(name, musicN);
        }
    }

    public static async loadPlay(name: string, loop = true) {
        const musicN = await BaseMusicUtil.load(name, true, loop);
        if (musicN) {
            this.m_map.set(name, musicN);
        }
    }

    public static free(name: string) {

        const objN = this.m_map.get(name);
        if (objN) {
            objN.destroy();
            this.m_map.delete(name);
        }
    }

    public static freeAll() {
        this.m_map.clear();

        const baseN = director.getScene().getChildByName("Base");
        if (baseN == null) {
            return;
        }
        const baseS = baseN.getComponent(Base) as Base;
        baseS.clearMusic();
    }


    public static playMusic(name: string) {
        BaseMusicUtil.playMusic(this.m_map.get(name));
    }

    public static playSound(name: string) {
        BaseMusicUtil.playSound(this.m_map.get(name));
    }

    public static stop(name: string) {
        BaseMusicUtil.stop(this.m_map.get(name));
    }
}