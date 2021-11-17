import { IncomingMessage } from "http";
import { v4 as uid } from 'uuid';
import RequestAuthenticator from "./RequestAuthenticator";

export default class TokenAuthenticator extends RequestAuthenticator {

    public authenticate(request: IncomingMessage, cb: (error: Error | null, client: string | null) => void): void {
        const id = uid();
        cb(null, id)
    }

}