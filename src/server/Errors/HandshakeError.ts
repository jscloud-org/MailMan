export default class HandshakeError extends Error {
    constructor(msg: string) {
        super();
        this.message = msg;
        this.name = 'Handshake Error';
    }
}