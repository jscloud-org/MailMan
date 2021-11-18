import { ServerResponse } from "common/message/ServerResponse";
import MessageRouter from "../../common/router/MessageRouter";

export default class LogMessageRouter extends MessageRouter {

    public routeMessage(msg: ServerResponse): boolean {
        console.log('Router log', msg);
        return false;
    }

}