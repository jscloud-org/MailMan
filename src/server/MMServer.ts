import { readFileSync } from 'fs';
import { createServer as createHttpServer, IncomingMessage, Server } from 'http';
import { createServer as createHttpsServer } from 'https';
import { v4 as uuid } from 'uuid';
import { WebSocket, WebSocketServer } from 'ws';
import Logger from '../common/Logger';
import MessageRouter from '../common/router/MessageRouter';
import HubNotInitialized from './Errors/HubNotInitialized';
import HashMapRegistryAdapter from './Registry/adapter/HashMapRegistryAdapter';
import RegistryAdapter from './Registry/adapter/RegistryAdapter';
import ClientRegistry from './Registry/ClientRegistry';
import EventRouter from './Router/EventRouter';
import SSLConfig from './SSLConfig';
import ServerMessageRouter from '../common/router/ServerMessageRouter';
import { createHandshakeAckResponse, createKillResponse, createReconnectResponse, TimeoutType, createErrorResponse } from '../common/message/ServerResponse'
import HandshakeError from './Errors/HandshakeError'
export type VerifyClientCallback = (request: IncomingMessage, cb: (error?: string, id?: string) => void) => void;


const defaultAuthenticator:VerifyClientCallback=(req,cb)=>{
    //success for all type of requests
    cb(undefined,uuid());
};

export class MMServer{

    private static mInstance: MMServer
    private socketServer: WebSocketServer
    private httpServer: Server
    private clientRegistry: ClientRegistry
    private authenticator: VerifyClientCallback;
    private router: ServerMessageRouter
    private additionalRouters: ServerMessageRouter[]
    private log: Function

    PORT: number

    private constructor(PORT: number, sslConfig: SSLConfig | undefined,
        adapter: RegistryAdapter,
        authenticator: VerifyClientCallback,
        additionalRouters: ServerMessageRouter[] = []) {
        this.PORT = PORT;
        this.log = new Logger("SERVER").log;
        this.log('Initializing new Hub Server');

        //build Http/s Server
        this.httpServer = (sslConfig && sslConfig.cert && sslConfig.key) ? createHttpsServer({
            cert: readFileSync(sslConfig.cert),
            key: readFileSync(sslConfig.key)
        }) : createHttpServer();

        //Connect Http/s server to socket
        this.socketServer = new WebSocketServer({
            noServer: true
        });

        this.router = new EventRouter();
        this.additionalRouters = additionalRouters;
        this.authenticator = authenticator;
        this.clientRegistry = ClientRegistry.init(adapter);
        this.attachDefaultListeners();
        this.httpServer.listen(PORT);

    }


    private attachDefaultListeners() {
        if (!this.socketServer)
            return;

        this.log('attaching default listeners...');

        this.httpServer.on('upgrade', (request, socket, head) => {
            this.authenticator(request, (error, client) => {
                if (error || !client) {
                    socket.write(`HTTP/1.1 401 ${error || 'Unauthorized'} \r\n\r\n`);
                    socket.destroy();
                    return;
                }
                this.log('Connection authorized for client ' + client, 'success');
                //@ts-ignore
                this.socketServer.handleUpgrade(request, socket, head, (webSocket) => {
                    this.socketServer.emit('connection', webSocket, request, client);
                })
            })
        })

        this.socketServer.on('connection', (socket: WebSocket, request: IncomingMessage, client: string) => {

            ClientRegistry.getInstance().addClient(client, socket);

            this.log('New Connection from ' + client, 'info');

            socket.on('message', (data, isBinary) => {
                
                //send all message to default router, so that we dont miss any messages
                this.router.onMessageRecieved(data, isBinary);

                //send to all registered routers
                this.additionalRouters.forEach((router)=>{
                    router.onMessageRecieved(data,isBinary);
                })
            })

            socket.on('close', (code: number, reason: Buffer) => {
                this.log('Client Disconnected', 'warn');
                this.log('code:' + code + ' reason: ' + reason.toString(), 'warn');
            })

            socket.on('error', (err) => {
                this.log(err, 'error');
            })

            socket.on('ping', (data) => {
                this.log('Ping Recieved, data: ' + data.toString(), 'success');
            })

        

            const handshakeMessage = createHandshakeAckResponse(client);

            socket.send(JSON.stringify(handshakeMessage));

        });


        this.socketServer.on('close', () => {
            this.log('Server Closed', 'warn')
        })

        this.socketServer.on('error', (error) => {
            this.log('Server Error' + error, 'error')
        })

        this.socketServer.on('listening', () => {
            this.log('WebSocket Server is Up and listening on PORT: ' + this.PORT, 'success')
        })

        this.log('all listeners attached', 'success')
    }

    public static getInstance(): MMServer {
        if (!this.mInstance)
            throw new HubNotInitialized();
        return this.mInstance;
    }

    public static init(PORT: number,
        sslConfig?: SSLConfig,
        handler: RegistryAdapter = new HashMapRegistryAdapter(),
        authenticator: VerifyClientCallback = defaultAuthenticator,
        routers?: ServerMessageRouter[]): MMServer {
        this.mInstance = new MMServer(PORT, sslConfig, handler, authenticator, routers);
        return this.mInstance;
    }

    public dropConnection(client: string) {
        const socket = ClientRegistry.getInstance().getClient(client);
        socket?.close();
    }

    public killClient(client: string, timeout?: TimeoutType, reason?: string) {
        const socket = ClientRegistry.getInstance().getClient(client);

        const msg = JSON.stringify(createKillResponse(reason || 'Reason not found', timeout));
        socket?.send(msg);
    }

    public killAllClients(timeout?: TimeoutType) {
        ClientRegistry.getInstance().getAllClients()
            .forEach((client) => this.killClient(client, timeout, 'reason'));
    }

    public reconnectClient(client: string, timeout?: TimeoutType) {
        const socket = ClientRegistry.getInstance().getClient(client);
        const msg = JSON.stringify(createReconnectResponse(timeout));
        socket?.send(msg);
    }

    public reconnectAllClients(timeout?: TimeoutType) {
        ClientRegistry.getInstance().getAllClients()
            .forEach((client) => this.reconnectClient(client, timeout))
    }

    public getClientCount(): number {
        return this.clientRegistry.getClientCount();
    }

}