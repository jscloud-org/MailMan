import { v4 as uuid } from 'uuid'

export interface ClientRequest {
    id: string,
    issuer?: string,
    issuer_alias?: string
    action: 'publish' | 'info' | 'subscribe' | 'broadcast',
    event?: string,
    payload?: any,
    issuedAt: number
}



export function createPublishRequest(issuer: string, eventName: string, payload: any): ClientRequest {
    return {
        id: uuid(),
        issuer,
        action: 'publish',
        event: eventName,
        payload: payload,
        issuedAt: Date.now()
    }
}

export function createBroadcastRequest(issuer: string, payload: any): ClientRequest {
    return {
        id: uuid(),
        issuer,
        action: 'broadcast',
        payload: payload,
        issuedAt: Date.now()
    }
}

export function createSubscribeRequest(issuer: string, eventName: string): ClientRequest {
    return {
        id: uuid(),
        issuer,
        action: 'subscribe',
        event: eventName,
        issuedAt: Date.now()
    }
}

export function createInfoMessage(issuer: string): ClientRequest {
    return {
        id: uuid(),
        issuer,
        action: 'info',
        issuedAt: Date.now()
    }
}
