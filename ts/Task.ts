import { v4 as uuid } from 'uuid'

/*
enum Status {
    Todo = 'TODO',
    Doing = 'DOING',
    Done = 'DONE',
}
*/

export const statusMap = {
    todo: 'TODO',
    doing: 'DOING',
    done: 'DONE',
} as const
export type Status = typeof statusMap[keyof typeof statusMap]

export class Task {
    readonly id
    title
    status

    constructor(properties: {title: string}){
        this.id = uuid()
        this.title = properties.title
        //this.status = Status.Todo
        this.status = statusMap.todo
    }
}