
export type ServerResponseActions = 'subscribe_ack' | 'handshake_ack' | 'info_ack' | 'publish' | 'publish_ack' | 'kill' | 'reconnect'
export type TimeoutType = 'immediate' | number;

export interface ServerResponse {
    success: boolean,
    action: ServerResponseActions,
    event?: string,
    error?: any,
    clientId?: string,
    payload?: any,
    issuedAt: number
}

export interface KillMessage extends ServerResponse {
    action: 'kill',
    reason: string,
    timeout: TimeoutType
}

export interface ReconnectMessage extends ServerResponse {
    action: 'reconnect',
    timeout: TimeoutType
}

export function createSubscribeAckResponse(event: string): ServerResponse {
    return {
        success: true,
        action: 'subscribe_ack',
        event,
        issuedAt: Date.now()
    }
}

export function createErrorResponse(action: ServerResponseActions, msg: string): ServerResponse {
    const error = new Error(msg);
    return {
        success: false,
        action,
        error: error,
        issuedAt: Date.now()
    }
}

export function createHandshakeAckResponse(clientId: string): ServerResponse {
    return {
        success: true,
        action: 'handshake_ack',
        clientId,
        issuedAt: Date.now()
    }
}

export function createPubishAckResponse(event: string, payload: any): ServerResponse {
    return {
        success: true,
        action: 'publish_ack',
        event,
        payload,
        issuedAt: Date.now()
    }
}

export function createInfoAckResponse(payload: any): ServerResponse {
    return {
        success: true,
        action: 'info_ack',
        payload,
        issuedAt: Date.now()
    }
}

export function createKillResponse(reason: string, timeout: TimeoutType = 'immediate'): KillMessage {
    return {
        success: true,
        action: 'kill',
        reason,
        timeout,
        issuedAt: Date.now()
    }
}

export function createReconnectResponse(timeout: TimeoutType = 'immediate'): ReconnectMessage {
    return {
        success: true,
        action: 'reconnect',
        timeout,
        issuedAt: Date.now()
    }
}