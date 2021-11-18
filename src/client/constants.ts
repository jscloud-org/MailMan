export const INFO_EVENT_TAG ='_info_';
export const HANDSHAKE_TAG = '_handshake_';
export const KILL_TAG = '_kill_'
export const RECONNECT_TAG = '_reconnect_'

export function getSubscribeAckTag(eventName:string):string{
    return `_subscribe_ack_${eventName}`
}

