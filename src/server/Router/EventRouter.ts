import { ClientRequest } from '../../common/message';
import { createSubscribeAckResponse } from '../../common/message/ServerResponse';
import ServerMessageRouter from '../../common/router/ServerMessageRouter';
import ClientRegistry from "../Registry/ClientRegistry";
import { EventEmitter } from 'events'
import { SUBSCRIBE_ACK_TAG } from '../../common/constants';

export default class EventRouter extends ServerMessageRouter {

    emitter: EventEmitter

    constructor(emitter: EventEmitter) {
        super();
        this.emitter = emitter;
    }

    protected routeMessage(msg: ClientRequest): boolean {
        switch (msg.action) {
            case 'info':
                this.handleInfo(msg);
                break;
            case 'publish':
                this.handlePublish(msg);
                break;
            case 'subscribe':
                this.handleSubscribe(msg)
                break;
            case 'broadcast':
                this.handleBroadcast(msg);
                break;
            default: return false;
        }
        return true;
    }

    handleSubscribe(msg: ClientRequest) {
        if (msg.issuer && msg.event) {
            ClientRegistry.getInstance().subscribeTo(msg.issuer, msg.event);
            const response = createSubscribeAckResponse(msg.event);
            this.emitter.emit(SUBSCRIBE_ACK_TAG, msg.issuer, response);
        }

       // console.log('[subscribe]', msg);
    }

    handleInfo(msg: ClientRequest) {
       // console.log('[Info]', msg);
    }

    handlePublish(msg: ClientRequest) {
        if (msg.event && msg.payload) {
            console.log('Sending publish message to ', ClientRegistry.getInstance().getSubscribersList(msg.event).length, 'subscribers');
            ClientRegistry.getInstance().getSubscribersList(msg.event).forEach(id => {
                this.sendToClient(id, msg);
            })
        }
       // console.log('[Publish]', msg);
    }

    handleBroadcast(msg: ClientRequest) {
        if (msg.payload) {
            ClientRegistry.getInstance().getAllClients().forEach(id => {
                this.sendToClient(id, msg)
            })
        }
    }

    sendToClient(client: string, msg: ClientRequest) {
        const socket = ClientRegistry.getInstance().getClient(client);
        socket?.send(JSON.stringify(msg))
    }

}