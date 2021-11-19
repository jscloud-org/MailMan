import { WebSocket } from 'ws';

export default abstract class RegistryAdapter {
    public abstract add(clientId: string, socket: WebSocket): void;
    public abstract remove(clientId: string): void;
    public abstract get(clientId: string): WebSocket | undefined;
    public abstract subscribe(clientId: string, topic: string): void;
    public abstract unSubscribe(clientId: string, topic: string): void;
    public abstract getSubscribersOf(topic: string): string[];
    public abstract getAllClients(): string[];
    public abstract getCount(): number;
    public abstract exists(clientId: string): boolean;
}
