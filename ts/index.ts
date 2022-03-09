import { EventListener } from './EventListener'
import { Task } from './Task'
import { TaskCollection } from './TaskCollection'
import { TaskRenderer } from './TaskRenderer'

class Application {
    private readonly eventListner = new EventListener()
    private readonly taskCollection = new TaskCollection()
    private readonly taskRenderer = new TaskRenderer(
        document.getElementById('todoList') as HTMLElement
    )

    start() {
        console.log('hello world')
        /*
        const eventListener = new EventListener()
        const button = document.getElementById('deleteAllDoneTask')
        if(!button) return
        eventListener.add(
            'sample',
            'click',
            button,
            () => alert('clicked'),
        )

        eventListener.remove('sample')
        */
       const cerateForm = document.getElementById('createForm') as HTMLElement
       this.eventListner.add('submit-handler', 'submit', cerateForm, this.handleSubmit)
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
}

window.addEventListener('load', () => {
    const app = new Application()
    app.start()
})
