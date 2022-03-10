import { Status, Task } from './Task'

//タスク・コレクション・クラス
export class TaskCollection {
    private tasks: Task[] = []

    //タスクを追加
    add(task: Task) {
        this.tasks.push(task)
    }

    //タスクを削除
    delete(task: Task) {
        this.tasks = this.tasks.filter(({id}) => id !== task.id)
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
}
