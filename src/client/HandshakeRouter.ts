import MessageRouter from "../common/router/MessageRouter";
import { HandshakeMessage, Message } from "../common/message";
import {EventEmitter} from 'events'

export default class HandshakeRouter extends MessageRouter{

    emitter:EventEmitter

    constructor(emitter:EventEmitter){
        super()
        this.emitter=emitter;
    }

    protected routeMessage(msg: Message): boolean {
        if (msg.action === 'reconnect')
            this.emitter.emit('_reconnect_', msg);
        if(msg.action==='kill')
            this.emitter.emit('_kill_',msg);
        if(msg.action==='handshake')
            this.emitter.emit('_handshake_',msg);
        return false;
    }
    
}