export const INFO_EVENT_TAG = Symbol('_info_');
export const HANDSHAKE_TAG = Symbol('_handshake_');
export const KILL_TAG = Symbol('_kill_')
export const RECONNECT_TAG = Symbol('_reconnect_')
export const SUBSCRIBE_ACK_TAG = Symbol('_subscribe_ack_');
export const BROADCAST_EVENT = 'broadcast';

export function getSubscribeAckTag(eventName: string): string {
    return `_subscribe_ack_${eventName}`
}

