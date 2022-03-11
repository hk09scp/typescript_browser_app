import { v4 as uuid, validate } from 'uuid'  //id自動附番ライブラリ

//ステータス
export const statusMap = {
    todo: 'TODO',
    doing: 'DOING',
    done: 'DONE',
} as const

//ステータスの型
export type Status = typeof statusMap[keyof typeof statusMap]

//タスクの方
export type TaskObject = {
    id: string
    title: string
    status: Status
}

//タスク・クラス
export class Task {
    readonly id
    title
    status

    constructor(properties: { id?: string, title: string, status?: Status}){
        //this.id = uuid.v4()
        this.id = properties.id || uuid()
        this.title = properties.title
        this.status = properties.status || statusMap.todo
    }

    //タスクを更新
    update(properties: { title?: string, status?: Status }) {
        this.title = properties.title || this.title
        this.status = properties.status || this.status
    }

    static validate(value: any) {
        if (!value) return false
        if (!validate(value.id)) return false
        if (!value.title) return false
        if (!Object.values(statusMap).includes(value.status)) return false
        return true
    }
}
