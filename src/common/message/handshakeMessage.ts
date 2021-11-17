import { Message } from "./message";

export interface HandshakeMessage extends Message {
    action: 'handshake',
    success?: boolean,
    id?: string,
    error?: any
}

export function createHandshakeMessage():HandshakeMessage{
    return{
        action:'handshake',
        issuedAt:Date.now()
    }
}
export function createServerHandshakeMessage(id?:string): HandshakeMessage {
    return {
        action: 'handshake',
        id,
        success:id!==null,
        issuedAt: Date.now()
    }
}