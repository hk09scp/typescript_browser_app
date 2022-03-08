type Listeners = {
    [id: string]: {
        event: string
        element: HTMLElement
        handler: (e: Event) => void
    }
}

export class EventListener {
    private readonly listerners: Listeners = {}

    add(listnerId: string, event: string, element: HTMLElement, handler: (e: Event) => void){
        this.listerners[listnerId] = {
            event,
            element,
            handler,
        }
        element.addEventListener(event, handler)
    }

    remove(listnerId: string) {
        const lister = this.listerners[listnerId]
        if(!lister) return
        lister.element.removeEventListener(lister.event, lister.handler)
        delete this.listerners[listnerId]
    }
}