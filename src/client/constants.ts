export const INFO_EVENT_TAG ='_info_';

export function getSubscribeAckTag(eventName:string):string{
    return `_subscribe_ack_${eventName}`
}