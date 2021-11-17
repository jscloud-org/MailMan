export default class ClientExists extends Error {
    constructor() {
        super();
        this.message = 'A client with same id is connected to the server. Please try connecting with a different id';
        this.name = 'Client Exists';
    }
}