import { EventListener } from './EventListener'
import { Status, Task, statusMap } from './Task'
import { TaskCollection } from './TaskCollection'
import { TaskRenderer } from './TaskRenderer'

class Application {
    private readonly eventListner = new EventListener()
    private readonly taskCollection = new TaskCollection()
    private readonly taskRenderer = new TaskRenderer(
        document.getElementById('todoList') as HTMLElement,
        document.getElementById('doingList') as HTMLElement,
        document.getElementById('doneList') as HTMLElement,
    )

    start() {
        console.log('hello world')

        const cerateForm = document.getElementById('createForm') as HTMLElement
        const deleteAllDoneTaskButton  = document.getElementById('deleteAllDoneTask') as HTMLElement
        this.eventListner.add('submit-handler', 'submit', cerateForm, this.handleSubmit)
        this.eventListner.add('click-handler', 'click', deleteAllDoneTaskButton, this.handleClickDeleteAllDoneTask)
        this.taskRenderer.subscribeDragAndDrop(this.handleDropAndDorp)
    }

    private handleSubmit = (e: Event) => {
        e.preventDefault()
        console.log('submitted')

        const titleInput = document.getElementById('title') as HTMLInputElement

        if(!titleInput.value) return

        const task = new Task({ title: titleInput.value })
        this.taskCollection.add(task)
        //this.taskRenderer.append(task)
        const { deleteButtonEl } = this.taskRenderer.append(task)

        this.eventListner.add(
            task.id,
            'click',
            deleteButtonEl,
            () => this.handleClickDeleteTask(task),
        )

        titleInput.value = ''
    }

    private handleClickDeleteTask = (task: Task) => {
        if (!window.confirm(`「${task.title}」を削除してよろしいですか?`)) return
        console.log(task)
        this.eventListner.remove(task.id)
        this.taskCollection.delete(task)
        this.taskRenderer.remove(task)
    }

    private handleDropAndDorp = (el: Element, sibling: Element | null, newStatus: Status) => {
        const taskId = this.taskRenderer.getId(el)
        if (!taskId) return

        console.log('handleDropAndDrop')
        console.log(taskId)
        console.log(sibling)
        console.log(newStatus)

        const task = this.taskCollection.find(taskId)
        if (!task) return

        task.update({ status: newStatus })
        this.taskCollection.update(task)
    }

    private handleClickDeleteAllDoneTask = () => {
        if (!window.confirm('DONE のタスクを一括削除してよろしいですか?')) return

        const doneTasks = this.taskCollection.filter(statusMap.done)
        console.log(doneTasks)
    }
}

window.addEventListener('load', () => {
    const app = new Application()
    app.start()
})
