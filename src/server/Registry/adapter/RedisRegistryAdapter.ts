import RegistryAdapter from "./RegistryAdapter";

export default class RedisRegistryAdapter extends RegistryAdapter {



    public add(clientId: string, socket: import("ws")): void {
        throw new Error("Method not implemented.");
    }
    public remove(clientId: string): void {
        throw new Error("Method not implemented.");
    }
    public get(clientId: string): import("ws") | undefined {
        throw new Error("Method not implemented.");
    }
    public subscribe(clientId: string, topic: string): void {
        throw new Error("Method not implemented.");
    }
    public unSubscribe(clientId: string, topic: string): void {
        throw new Error("Method not implemented.");
    }
    public getSubscribersOf(topic: string): String[] {
        throw new Error("Method not implemented.");
    }
    public getAllClients(): string[] {
        throw new Error("Method not implemented.");
    }
    public getCount(): number {
        throw new Error("Method not implemented.");
    }
    public exists(clientId: string): boolean {
        throw new Error("Method not implemented.");
    }

}