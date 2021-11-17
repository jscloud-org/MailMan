import { AutoQueue } from "@js-cloud/flashq";
import MessageRouter from "../common/router/MessageRouter";
import { AckMessage, Message } from "../common/message";

export default class EventMessageRouter extends MessageRouter{
    ackQueue:AutoQueue<AckMessage>
    recieveQueue:AutoQueue<Message>

    constructor(aQ: AutoQueue<AckMessage>,rQ:AutoQueue<Message>){
        super();
        this.ackQueue=aQ;
        this.recieveQueue=rQ;
    }

    public routeMessage(msg: Message) :boolean{
        switch(msg.action){
            case 'subscribe_ack':
                this.ackQueue.enqueue(msg);
                break;
            default:
                this.recieveQueue.enqueue(msg);

        }
        return true;
    }

}