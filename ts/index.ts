import { EventListener } from './EventListener'

class Application {
    start() {
        console.log('hello world')
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
    }
}

window.addEventListener('load', () => {
    const app = new Application()
    app.start()
})