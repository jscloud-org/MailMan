import { RawData } from "ws";
import { Message } from "../message/message";

export default abstract class MessageRouter{
    public onMessageRecieved(msg:RawData,isBinary?:boolean):boolean{
        try {
            const parsed = JSON.parse(msg.toString());
            return this.routeMessage(parsed);
        } catch (error) {
            throw error;
        }
    }

    protected abstract routeMessage(msg:Message):boolean;
    
}