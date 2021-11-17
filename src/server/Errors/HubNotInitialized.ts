export default class HubNotInitialized extends Error {
    constructor() {
        super();
        this.message = 'Hub not initialized yet. Please make sure you are initializing hub before calling getInstance() method';
        this.name = 'Hub Not Initialized';
    }
}