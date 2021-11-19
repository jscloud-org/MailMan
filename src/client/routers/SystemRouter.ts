import { ServerResponse } from "common/message/ServerResponse";
import { EventEmitter } from 'events';
import MessageRouter from "../../common/router/MessageRouter";
import { HANDSHAKE_TAG, KILL_TAG, RECONNECT_TAG } from "../../common/constants";

export default class SystemRouter extends MessageRouter {

    emitter: EventEmitter

    constructor(emitter: EventEmitter) {
        super()
        this.emitter = emitter;
    }

    protected routeMessage(msg: ServerResponse): boolean {
        if (msg.action === 'reconnect')
            this.emitter.emit(RECONNECT_TAG, msg);
        if (msg.action === 'kill')
            this.emitter.emit(KILL_TAG, msg);
        if (msg.action === 'handshake_ack')
            this.emitter.emit(HANDSHAKE_TAG, msg);
        return false;
    }

}