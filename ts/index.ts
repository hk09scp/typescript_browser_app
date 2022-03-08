import { EventListener } from './EventListener'
import { Task } from './Task'

class Application {
    private readonly eventListner = new EventListener()

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

        const task = new Task({title: titleInput.value})
        console.log(task)
    }
}

window.addEventListener('load', () => {
    const app = new Application()
    app.start()
})