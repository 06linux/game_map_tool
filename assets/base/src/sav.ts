import { log } from "cc";
import { BaseConfig } from "./config";
import { BaseFile } from "./file";
import { BaseUtil } from "./util";

/**
 * 存档管理
 */
export class BaseSav {

    private static m_map = new Map<string, any[]>();

    /**
     * 加载存档
     * @param key 存档的key 值（存档名称）
     */
    public static load(key: string) {
        const str = BaseFile.read(key);
        if (!BaseUtil.isNull(str)) {
            const data = JSON.parse(str);
            this.m_map.set(key, data);
        }
    }

    // 保存存档
    public static save(key: string) {
        const list = this.m_map.get(key) as any[];
        if (list) {
            const str = JSON.stringify(list);
            BaseFile.write(key, str);
        }
    }

    // 保存所有存档
    public static saveAll() {
        this.m_map.forEach((value, key) => {
            const str = JSON.stringify(value);
            BaseFile.write(key, str);
        });
    }

    /**
     * 判断是否匹配
     * @param data 匹配的数据
     * @param query ,查询条件，例如： {id:'1111'}
     */
    public static match(data: any, query: object) {

        if (data == null) {
            return false;
        }

        // 如果查询条件不存在，则默认返回true
        const keys = BaseUtil.objKeys(query);
        if (keys == null || keys.length == 0) {
            return true;
        }

        for (let index = 0; index < keys.length; index++) {
            const key = keys[index];
            if (data[key] !== query[key]) {
                return false;
            }
        }

        return true;
    }

    /**
     * 匹配 id 是否相等
     * @param data 
     * @param id 
     * @returns 
     */
    public static matchID(data: any, id: string) {
        if (data['id'] === id || data['_id'] === id) {
            return true;
        }
        return false;
    }

    public static getOne(key: string, query: object) {
        const list = this.m_map.get(key) as any[];
        if (list && list.length > 0) {
            for (let index = 0; index < list.length; index++) {
                const data = list[index];
                if (this.match(data, query)) {
                    return data;
                }
            }
        }
    }

    /**
     * 获取多个数据
     * @param key 
     * @param query， 查询条件，例如：{age:11} 
     * @returns 
     */
    public static getMore(key: string, query: object) {

        const retList = [];
        const list = this.m_map.get(key) as any[];
        if (list && list.length > 0) {
            for (let index = 0; index < list.length; index++) {
                const data = list[index];
                if (this.match(data, query)) {
                    retList.push(data);
                }
            }
        }
        return retList;
    }

    public static getAll(key: string) {

        const list = this.m_map.get(key) as any[];
        if (list) {
            return list;
        }

        return [];
    }

    // 通过 id 获取数据
    public static getById(key: string, id: string) {

        const list = this.m_map.get(key) as any[];
        if (list && list.length > 0) {
            for (let index = 0; index < list.length; index++) {
                const data = list[index];
                if (this.matchID(data, id)) {
                    return data;
                }
            }
        }

        return null;
    }

    /**
     * 查找数据，分页显示
     * @param key 
     * @param query 
     * @param page 
     * @param pageSize 
     * @returns 
     */
    public static find(key: string, query: object, page = 0, pageSize = 10) {

        const retData = {
            list: [],
            total: 0,
        }

        const list = this.getMore(key, query);
        if (list) {
            retData.total = list.length;
            for (let i = 0; i < pageSize; i++) {
                const index = page * pageSize + i;
                if (index >= list.length || index < 0) {
                    break;
                }
                const data = list[index];
                retData.list.push(data)
            }
        }

        return retData;
    }

    /**
     * 设置一个存档
     * 备注：
     *  设置数据是只能通过 id 进行更新
     *  会改变一个数据索引位置，显示的时候可以进行排序然后再显示
     */
    public static set(key: string, id: string, newData: any) {

        let isSet = false;

        const list = this.m_map.get(key) as any[];
        if (list) {
            for (let index = 0; index < list.length; index++) {
                const data = list[index];
                if (this.matchID(data, id)) {
                    list[index] = newData;

                    log('BaseSav.set', newData, list);

                    isSet = true;
                    break;
                }
            }

            if (!isSet) {
                list.push(newData);
            }


            log('BaseSav.set 222', newData, list);
            this.m_map.set(key, list);
        }
        else {
            this.m_map.set(key, [newData]);
        }
    }

    /**
     * 通过 id 进行删除 
     * @param key 
     * @param id 
     * @returns 
     */
    public static del(key: string, id: string) {

        let isDel = false;

        const list = this.m_map.get(key) as any[];
        if (list && list.length > 0) {
            for (let index = 0; index < list.length; index++) {
                const data = list[index];
                if (this.matchID(data, id)) {
                    list.splice(index, 1);
                    isDel = true;
                    break;
                }
            }
        }

        if (isDel) {
            this.m_map.set(key, list);
        }

        return isDel;
    }

    /**
     * 删除当前 key下面的所有数据
     * @param key 
     */
    public static delAll(key: string) {
        this.m_map.delete(key);
        BaseFile.write(key, '');
    }

}