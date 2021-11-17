export default class NotAuthorized extends Error {
    constructor() {
        super();
        this.message = 'This client is not authorized to connect to this server. This may happen when your access token expires or is not available. Please login again';
        this.name = 'Not Authorized';
    }
}