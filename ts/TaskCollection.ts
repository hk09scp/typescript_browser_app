import { Status, Task, TaskObject } from './Task'

const STORAGE_KEY = 'TASKS'

//タスク・コレクション・クラス
export class TaskCollection {
    private readonly storage
    //private tasks: Task[] = []
    private tasks

    constructor() {
        this.storage = localStorage  //ブラウザのローカルストレージ
        this.tasks = this.getStoredTasks()
    }

    //タスクを追加
    add(task: Task) {
        this.tasks.push(task)
        this.updateStorage()
    }

    //タスクを削除
    delete(task: Task) {
        this.tasks = this.tasks.filter(({ id }) => id !== task.id)
        this.updateStorage()
    }

    //タスクを検索
    find(id: string) {
        return this.tasks.find((task) => task.id === id)
    }

    //タスクを更新
    update(task: Task) {
        this.tasks = this.tasks.map((item) => {
            if (item.id === task.id) return task
            return item
        })
    }

    //ステータスをキーにタスクを抽出
    filter(filterStatus: Status) {
        return this.tasks.filter(({ status }) => status === filterStatus)
    }

    //ストレージを更新
    private updateStorage() {
        this.storage.setItem(STORAGE_KEY, JSON.stringify(this.tasks))
    }

    //ストレージからデータを取得
    private getStoredTasks() {
        const jsonString = this.storage.getItem(STORAGE_KEY)
        if (!jsonString) return []

        try {
            const storedTasks = JSON.parse(jsonString)

            assertIsTaskObjects(storedTasks)

            const tasks = storedTasks.map((task) => new Task(task))
            console.log(tasks)
            return tasks
        } catch {
            this.storage.removeItem(STORAGE_KEY)
            return []
        }
    }

    //タスクリストの引数taskタスクを引数taregtタスクの前に移動
    moveAboveTarget(task: Task, target: Task) {
        const taskIndex = this.tasks.indexOf(task)
        const targetIndex = this.tasks.indexOf(target)
        console.log(`moveAboveTarget taskIndex = ${taskIndex}, targetIndex = ${targetIndex}`)
        this.changeOrder(task, taskIndex, taskIndex < targetIndex ? targetIndex -1 : targetIndex)
    }

    //引数taskをタスクリストの最後に移動
    moveToLast(task: Task) {
        const taskIndex = this.tasks.indexOf(task)
        console.log(`moveToLast taskIndex = ${taskIndex} targetIndex = ${this.tasks.length}`)
        this.changeOrder(task, taskIndex, this.tasks.length)
    }

    //タスクリストのタスクの並べ替え
    private changeOrder(task: Task, taskIndex: number, targetIndex: number) {
        console.log(this.tasks.length)
        this.tasks.splice(taskIndex, 1)
        console.log(this.tasks.length)
        this.tasks.splice(targetIndex, 0, task)
        console.log(this.tasks.length)
        this.updateStorage()
    }
}

//タスク・リストのなかの各タスクの型検証
function assertIsTaskObjects(value: any): asserts value is TaskObject[] {
    if (!Array.isArray(value) || !value.every((item) => Task.validate(item))){
        throw new Error('引数「value」は TaskObject[] 型と一致しません。')
    }
}
