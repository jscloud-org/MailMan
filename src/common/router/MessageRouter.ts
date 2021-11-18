import { ServerResponse } from "common/message/ServerResponse";
import { RawData } from "ws";

export default abstract class MessageRouter{
    public onMessageRecieved(msg:RawData,isBinary?:boolean):boolean{
        try {
            const parsed = JSON.parse(msg.toString());
            return this.routeMessage(parsed);
        } catch (error) {
            throw error;
        }
    }

    protected abstract routeMessage(msg: ServerResponse): boolean;
    
}