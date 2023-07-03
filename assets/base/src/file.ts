

import { sys } from 'cc';
import { BaseConfig } from './config';

/**
 * 文件操作
 */
export class BaseFile {


    /**
     * 读取存档
     * @param name 存档名称
     * @returns 
     */
    public static read(name: string) {
        return sys.localStorage.getItem(`${BaseConfig.GAME_ID}_${name}`);
    }

    /**
    * 写存档
    * @param name 存档名称
    * @param text 要写入的内容  
    * @returns 
    */
    public static write(name: string, text: string) {
        sys.localStorage.setItem(`${BaseConfig.GAME_ID}_${name}`, text);
    }


    /**
     * 打开本地文件对话框
     * @param accept 文件后缀名称
     * 
     * 备注：仅支持 web ，主要是用来做一些工具，比如地图编辑器，关卡编辑，等等
     */
    public static async open(accept = '.json'): Promise<string> {

        return new Promise(resolve => {
            if (sys.isBrowser) {
                let input = document.createElement('input');
                input.type = 'file';
                input.accept = accept;
                input.onchange = _this => {
                    const files = input.files;
                    // console.log("open", files);
                    const reader = new FileReader();
                    reader.onload = () => {
                        // when the reader is done, the content is in reader.result.
                        console.log('open result：', reader.result);
                        resolve(reader.result as string);
                    };
                    reader.readAsText(files[0]);
                };
                input.click();
            }
            else {
                resolve('');
            }
        });
    }


    /**
     * 保存本地文件对话框
     * @param data 保存的文本数据
     * @param name 保存的文件名称
     * 
     * 备注：仅支持 web ，主要是用来做一些工具，比如地图编辑器，关卡编辑，等等
     */
    public static save(data: string, name: string) {
        if (sys.isBrowser) {
            const blob = new Blob([data], { type: 'application/json' });
            var url = window.URL.createObjectURL(blob)
            var link = document.createElement('a')
            link.href = url;
            link.setAttribute('download', name)
            link.click();
        }
    }

}