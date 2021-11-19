import RegostryAdapter from "./RegistryAdapter";
import { WebSocket } from 'ws'

export default class HashMapRegostryAdapter extends RegostryAdapter {

    private clientMap: Map<string, WebSocket>
    private topicMap: Map<string, Set<string>>

    constructor() {
        super();
        this.clientMap = new Map();
        this.topicMap = new Map();
    }

    public add(clientId: string, socket: WebSocket): void {
        this.clientMap.set(clientId, socket);
    }

    public remove(clientId: string): void {
        this.clientMap.delete(clientId);
    }

    public get(clientId: string): WebSocket | undefined {
        return this.clientMap.get(clientId);
    }

    public subscribe(clientId: string, topic: string): void {
        let list = this.topicMap.get(topic) || new Set();
        list.add(clientId);
        this.topicMap.set(topic, list);
    }

    public unSubscribe(clientId: string, topic: string): void {
        let list = this.topicMap.get(topic) || new Set();
        list.delete(clientId);
        this.topicMap.set(topic, list);
    }

    public getSubscribersOf(topic: string): string[] {
        const list = this.topicMap.get(topic) || new Set();
        return Array.from(list);
    }

    public getAllClients(): string[] {
        return Array.from(this.clientMap.keys());
    }

    public getCount(): number {
        return this.clientMap.size;
    }

    public exists(clientId: string): boolean {
        return this.clientMap.has(clientId);
    }

}