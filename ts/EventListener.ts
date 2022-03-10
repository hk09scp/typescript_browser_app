//リスナー配列の型定義
type Listeners = {
    [id: string]: {
        event: string
        element: HTMLElement
        handler: (e: Event) => void
    }
}

//イベントリスナー・クラス
export class EventListener {
    private readonly listeners: Listeners = {}

    //イベントリスナーを追加
    add(listnerId: string, event: string, element: HTMLElement, handler: (e: Event) => void){
        this.listeners[listnerId] = {
            event,
            element,
            handler,
        }
        element.addEventListener(event, handler)
    }

    //イベントリスナーを削除
    remove(listnerId: string) {
        const listner = this.listeners[listnerId]
        if(!listner) return
        listner.element.removeEventListener(listner.event, listner.handler)
        delete this.listeners[listnerId]
    }
}