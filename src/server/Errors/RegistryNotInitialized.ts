export default class RegistryNotInitialized extends Error {
    constructor() {
        super();
        this.message = 'Registry not initialized yet. Please make sure you are initializing Registry before calling getInstance() method';
        this.name = 'Registry Not Initialized';
    }
}