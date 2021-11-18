import { RawData } from "ws";
import { ClientRequest } from "../message";

export default abstract class ServerMessageRouter {
    public onMessageRecieved(msg: RawData, isBinary?: boolean): boolean {
        try {
            const parsed = JSON.parse(msg.toString());
            return this.routeMessage(parsed);
        } catch (error) {
            throw error;
        }
    }

    protected abstract routeMessage(msg: ClientRequest): boolean;

}