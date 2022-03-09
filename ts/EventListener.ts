type Listeners = {
    [id: string]: {
        event: string
        element: HTMLElement
        handler: (e: Event) => void
    }
}

export class EventListener {
    private readonly listeners: Listeners = {}

    add(listnerId: string, event: string, element: HTMLElement, handler: (e: Event) => void){
        this.listeners[listnerId] = {
            event,
            element,
            handler,
        }
        element.addEventListener(event, handler)
    }

    remove(listnerId: string) {
        const listner = this.listeners[listnerId]
        if(!listner) return
        listner.element.removeEventListener(listner.event, listner.handler)
        delete this.listeners[listnerId]
    }
}