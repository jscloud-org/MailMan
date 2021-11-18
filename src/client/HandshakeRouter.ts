import MessageRouter from "../common/router/MessageRouter";
import { HandshakeMessage, Message } from "../common/message";
import {EventEmitter} from 'events'
import { HANDSHAKE_TAG, KILL_TAG, RECONNECT_TAG } from "./constants";

export default class HandshakeRouter extends MessageRouter{

    emitter:EventEmitter

    constructor(emitter:EventEmitter){
        super()
        this.emitter=emitter;
    }

    protected routeMessage(msg: Message): boolean {
        if (msg.action === 'reconnect')
            this.emitter.emit(RECONNECT_TAG, msg);
        if(msg.action==='kill')
            this.emitter.emit(KILL_TAG, msg);
        if(msg.action==='handshake')
            this.emitter.emit(HANDSHAKE_TAG, msg);
        return false;
    }
    
}