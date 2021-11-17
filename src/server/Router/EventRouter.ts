import { Message } from "../../common/message/message";
import MessageRouter from "../../common/router/MessageRouter";

export default class EventRouter extends MessageRouter {

    protected routeMessage(msg: Message,isBinary?:boolean): boolean {
        switch(msg.action){
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

            default:return false;
        }
        return true;
    }

    handleSubscribe(msg: Message) {
        console.log('[subscribe]', msg);
    }

    handleHandshake(msg:Message){
        console.log('[Handshake]',msg);
    }

    handleInfo(msg:Message){
        console.log('[Info]', msg);
    }

    handlePublish(msg:Message){
        console.log('[Publish]', msg);
    }

}