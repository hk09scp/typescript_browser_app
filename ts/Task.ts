import { v4 as uuid } from 'uuid'  //id自動附番ライブラリ

//ステータス
export const statusMap = {
    todo: 'TODO',
    doing: 'DOING',
    done: 'DONE',
} as const

//ステータスの型
export type Status = typeof statusMap[keyof typeof statusMap]

//タスク・クラス
export class Task {
    readonly id
    title
    status: Status

    constructor(properties: {title: string}){
        this.id = uuid()
        this.title = properties.title
        this.status = statusMap.todo
    }

    //タスクを更新
    update(properties: { title?: string, status?: Status }) {
        this.title = properties.title || this.title
        this.status = properties.status || this.status
    }
}
