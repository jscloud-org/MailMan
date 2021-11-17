import MessageRouter from "../common/router/MessageRouter";
import { Message } from "../common/message";

export default class LogMessageRouter extends MessageRouter {
   
    public routeMessage(msg: Message):boolean {
        console.log('Router log',msg);
        return false;
    }

}