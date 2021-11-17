import RegistryNotInitialized from "../Errors/RegistryNotInitialized";
import RegistryAdapter from "./adapter/RegistryAdapter";
import { WebSocket } from 'ws'
import ClientExists from "../Errors/ClientExists";


export default class ClientRegistry {

    private static mInstance: ClientRegistry
    private registryadapter: RegistryAdapter

    private constructor(adapter: RegistryAdapter) {
        this.registryadapter = adapter;
    }

    public static getInstance(): ClientRegistry {
        if (!this.mInstance)
            throw new RegistryNotInitialized();
        return this.mInstance;
    }

    public static init(handler: RegistryAdapter): ClientRegistry {
        this.mInstance = new ClientRegistry(handler);
        return this.mInstance;
    }

    public addClient(clientId: string, socket: WebSocket) {
        if (this.registryadapter.exists(clientId))
            throw new ClientExists();
        return this.registryadapter.add(clientId, socket);
    }

    public getClient(clientId: string) {
        return this.registryadapter.get(clientId);
    }

    public getAllClients(): string[] {
        return this.registryadapter.getAllClients();
    }

    public subscribeTo(clientId: string, topic: string) {
        return this.registryadapter.subscribe(clientId, topic);
    }

    public getClientCount(): number {
        return this.registryadapter.getCount();
    }

    public getSubscribersList(topic: string) {
        return this.registryadapter.getSubscribersOf(topic);
    }

}