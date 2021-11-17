import { Message } from "./message";

export type ReconnectTimeoutType = 'immediate' | number;

export default interface ReconnectMessage extends Message {
    action: 'reconnect',
    issuedAt: number,
    timeout: ReconnectTimeoutType
}

export function createReconnectMessage(timeout: ReconnectTimeoutType='immediate'): ReconnectMessage {
    return {
        action: 'reconnect',
        issuedAt: Date.now(),
        timeout
    }

}
