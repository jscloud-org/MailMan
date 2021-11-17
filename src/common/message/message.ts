export interface Message {
    action: 'publish' | 'info' | 'subscribe' | 'subscribe_ack' | 'handshake' |'kill' | 'reconnect',
    event?: string,
    payload?: any,
    issuedAt: number
}

export function createPublishMessage(eventName: string, payload: any): Message {
    return {
        action: 'publish',
        event: eventName,
        payload: payload,
        issuedAt: Date.now()
    }
}
export function createSubscribeMessage(eventName: string): Message {
    return {
        action: 'subscribe',
        event: eventName,
        issuedAt: Date.now()
    }
}

export function createInfoMessage(): Message {
    return {
        action: 'info',
        issuedAt: Date.now()
    }
}
