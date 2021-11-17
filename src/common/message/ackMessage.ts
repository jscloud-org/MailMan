import { Message } from "./message"

export interface AckMessage extends Message {
    action: 'subscribe_ack',
    success: boolean,
    error?: any
}