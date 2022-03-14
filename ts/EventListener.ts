import { v4 as uuid } from 'uuid'

type Handler<T> = T extends keyof HTMLElementEventMap
    ? (e: HTMLElementEventMap[T]) => void
    : (e: Event) => void

//リスナー配列の型定義
type Listeners = {
    [id: string]: {
        event: string
        element: HTMLElement
        //handler: (e: Event) => void
        handler: Handler<string>
    }
}

//イベントリスナー・クラス
export class EventListener {
    private readonly listeners: Listeners = {}

    //イベントリスナーを追加
    //add(listenerId: string, event: string, element: HTMLElement, handler: (e: Event) => void){
    //add(event: string, element: HTMLElement, handler: (e: Event) => void, listenerId = uuid()){
    add<T extends string>(event: T, element: HTMLElement, handler: Handler<T>, listenerId = uuid()){
        this.listeners[listenerId] = {
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
