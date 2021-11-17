import { IncomingMessage } from "http";

export default abstract class RequestAuthenticator {
    public abstract authenticate(request: IncomingMessage, cb: (error: Error | null, client: string | null) => void): void;
}