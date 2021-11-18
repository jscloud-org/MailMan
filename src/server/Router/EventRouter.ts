import ClientRegistry from "../Registry/ClientRegistry";
import MessageRouter from "../../common/router/MessageRouter";
import { ClientRequest } from '../../common/message'
import ServerMessageRouter from '../../common/router/ServerMessageRouter'

export default class EventRouter extends ServerMessageRouter {

    protected routeMessage(msg: ClientRequest): boolean {
        switch (msg.action) {
            case 'handshake':
                this.handleHandshake(msg);
                break;
            case 'info':
                this.handleInfo(msg);
                break;
            case 'publish':
                this.handlePublish(msg);
                break;
            case 'subscribe':
                this.handleSubscribe(msg)
                break;

            default: return false;
        }
        return true;
    }

    handleSubscribe(msg: ClientRequest) {
        if (msg.issuer && msg.event)
            ClientRegistry.getInstance().subscribeTo(msg.issuer, msg.event);
        console.log('[subscribe]', msg);
    }

    handleHandshake(msg: ClientRequest) {
        console.log('[Handshake]',msg);
    }

    handleInfo(msg: ClientRequest) {
        console.log('[Info]', msg);
    }

    handlePublish(msg: ClientRequest) {
        console.log('[Publish]', msg);
    }

}