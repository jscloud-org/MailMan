import { AutoQueue } from "@js-cloud/flashq";
import { ServerResponse } from "common/message/ServerResponse";
import MessageRouter from "../../common/router/MessageRouter";

export default class EventMessageRouter extends MessageRouter {
    ackQueue: AutoQueue<ServerResponse>
    recieveQueue: AutoQueue<ServerResponse>

    constructor(aQ: AutoQueue<ServerResponse>, rQ: AutoQueue<ServerResponse>) {
        super();
        this.ackQueue = aQ;
        this.recieveQueue = rQ;
    }

    public routeMessage(msg: ServerResponse): boolean {
        switch (msg.action) {
            case 'subscribe_ack':
                this.ackQueue.enqueue(msg);
                break;
            default:
                this.recieveQueue.enqueue(msg);

        }
        return true;
    }

}