import dragula from 'dragula'  //ドラッグ＆ドロップ・ライブラリ
import { Status, Task, statusMap } from './Task'
import { TaskCollection } from './TaskCollection'

//タスク描画クラス
export class TaskRenderer {
    constructor(
        private readonly todoList: HTMLElement,
        private readonly doingList: HTMLElement,
        private readonly doneList: HTMLElement,
    ) { }

    //TODOリストにタスク要素を追加
    append(task: Task) {
        const { taskEl, deleteButtonEl } = this.render(task)
        this.todoList.append(taskEl)
        return { deleteButtonEl }
    }

    //タスクのHTML要素を生成
    private render(task: Task) {
        const taskEl = document.createElement('div')
        const spanEl = document.createElement('span')
        const deleteButtonEl = document.createElement('button')

        taskEl.id = task.id
        taskEl.classList.add('task-item')

        spanEl.textContent = task.title
        deleteButtonEl.textContent = '削除'

        taskEl.append(spanEl, deleteButtonEl)

        return { taskEl, deleteButtonEl }
    }

    //タスクのHTML要素を削除
    remove(task: Task) {
        const taskEl = document.getElementById(task.id)
        if (!taskEl) return

        if (task.status === statusMap.todo) {
            this.todoList.removeChild(taskEl)
        }
        if (task.status === statusMap.doing) {
            this.doingList.removeChild(taskEl)
        }
        if (task.status === statusMap.done) {
            this.doneList.removeChild(taskEl)
        }
    }

    //タスクのドラッグ＆ドロップ
    subscribeDragAndDrop(onDrop: (el: Element, sibling: Element | null, newStatus: Status) => void) {
        dragula([this.todoList, this.doingList, this.doneList]).on('drop', (el, target, _source, sibling) => {
            let newStatus: Status = statusMap.todo

            if (target.id === 'doingList') newStatus = statusMap.doing
            if (target.id === 'doneList') newStatus = statusMap.done

            onDrop(el, sibling, newStatus)

            console.log('subscribeDragAndDrop')
            console.log(el)
            console.log(target)
            //console.log(source)
            console.log(sibling)
        })
    }

    //タスクのidを取得
    getId(el: Element) {
        return el.id
    }

    //タスク・コレクション・クラスから既存タスクの画面描画した後、配列にして返却
    renderAll(taskCollection: TaskCollection) {
        const todoTasks = this.renderList(taskCollection.filter(statusMap.todo), this.todoList)
        const doingTasks = this.renderList(taskCollection.filter(statusMap.doing), this.doingList)
        const doneTasks = this.renderList(taskCollection.filter(statusMap.doing), this.doneList)

        return [...todoTasks, ...doingTasks, ...doneTasks]
    }

    //引数tasksに格納されたタスクのHTML要素を引数listEl要素に描画
    private renderList(tasks: Task[], listEl: HTMLElement) {
        if (tasks.length === 0) return []

        const taskList: Array<{
            task: Task
            deleteButtonEl: HTMLButtonElement
        }> = []

        tasks.forEach((task) => {
            const { taskEl, deleteButtonEl } = this.render(task)
            listEl.append(taskEl)
            taskList.push({task, deleteButtonEl })
        })

        return taskList
    }
}
