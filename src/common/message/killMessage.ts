import { Message } from "./message";

export type KillTimeoutType='immediate'|number;

export default interface KillMessage extends Message {
    action: 'kill',
    issuedAt: number,
    reason:string,
    timeout:KillTimeoutType
}

export function createKillMessage(reason:string,timeout?:KillTimeoutType):KillMessage{
    return{
        action:'kill',
        issuedAt: Date.now(),
        reason,
        timeout
    }

}
