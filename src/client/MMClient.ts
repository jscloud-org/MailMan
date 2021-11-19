import { AutoQueue } from "@js-cloud/flashq";
import { ServerResponse } from "common/message/ServerResponse";
import { WebSocket } from "ws";
import { createPublishRequest, createSubscribeRequest, ClientRequest, KillMessage, ReconnectMessage, createBroadcastRequest } from '../common/message/index'
import MessageRouter from "../common/router/MessageRouter";
import { BROADCASR_EVENT, BROADCAST_EVENT, getSubscribeAckTag, HANDSHAKE_TAG, KILL_TAG, RECONNECT_TAG } from '../common/constants';
import EventMessagingRouter from './routers/EventMessageRouter';
import { ClientOptions, createDefaultOptions } from "./index";
import LogMessageRouter from './routers/LogMessageRouter';
import SystemRouter from './routers/SystemRouter';
import { EventEmitter } from 'events'

export type EventCallback = (payload:any,event?:string)=>void;
export type StatusChangeCallback = (status:ConnectionState,mmClient:MMClient)=>void;
export type SubscribeAcknowledgement = (error:any)=>void | (()=>void)
export const NOOP= ()=>{}

export type ConnectionState ="OPEN"|"ACTIVE"|"INACTIVE"|"CLOSED"

export class MMClient{
    
    private ws?:WebSocket   
    private alias?:string //user given names given to clients
    public id: string    //id assigned by the server
    private URL:string    //Server URL  
    private sendQueue: AutoQueue<ClientRequest>       //Queue for sending messages
    private recieveQueue: AutoQueue<ServerResponse>    //Queue for recieving messages
    private ackQueue: AutoQueue<ServerResponse>     //Queue for recieving ack messages only
    private emitter:EventEmitter;               //Internal event emitter
    private connState: ConnectionState           //states -> "OPEN"|"ACTIVE"|"INACTIVE"|"CLOSED"
    private statusChangeCallback?:StatusChangeCallback  //called when status is changed
    private subscribedTopics:Map<string,EventCallback>  //Map of topics subscribed, used for re-subscribing when reconnecting 
    private eventRouter:MessageRouter                   //for routing event-based messages
    private systemRouter: MessageRouter               //for routing hand-shake messages
    private clientOptions:ClientOptions                 //options
    private forceDisconnect = false;
    private additionalRouters: MessageRouter[];
    private reconnectTimeout?: any = undefined;
    private reconnectionTrial = 0;
    private lastReconnectDelay = 0;

    constructor(URL: string, clientOptions?: ClientOptions, routers: MessageRouter[] = []) {
        this.URL=URL;
        this.sendQueue = new AutoQueue();
        this.sendQueue.pauseQueue();                    //send queue should be paused on start to deny all contact with server before handshake
        this.recieveQueue = new AutoQueue();
        this.ackQueue = new AutoQueue();
        this.alias = '';
        this.id = 'NOT_ASSIGNED';
        this.connState='CLOSED'
        this.emitter = new EventEmitter();
        this.additionalRouters = routers
        this.eventRouter = new EventMessagingRouter(this.ackQueue,this.recieveQueue);
        this.subscribedTopics = new Map();
        this.systemRouter = new SystemRouter(this.emitter);
        this.clientOptions = {
            ...createDefaultOptions(),
            ...clientOptions
        }
        this.attachDefaultListeners();
    }

    /**
     * Callback function invoked when status of the client changes.
     * @param {StatusChangeCallback} callback {StatusChangeCallback}
     */
    public onStatusChanged(callback:StatusChangeCallback){
        this.statusChangeCallback=callback;
    }


    /**
     * Publish a message payload to subscribers
     * @param {string} eventName Name of the event, should be unique
     * @param {object} payload Data to be sent
     * @returns {boolean} true if publish was successfull
     */
    public publish(eventName:string,payload:any):boolean{
        try {
            const msg = createPublishRequest(this.id, eventName, payload);
            this.send(msg);
            return true;
        } catch (error) {
            throw error;
        }
        
    }

    /**
     * Broadcast a msg to all clients connected to the host server
     * @param {Object} payload Any object
     */
    public broadcast(payload: any) {
        const msg = createBroadcastRequest(this.id, payload);
        this.send(msg);
    }

    /**
     * Subscribe to messages from clients
     * @param {string} eventName 
     * @param {EventCallback} callback 
     * @returns 
     */
    public subscribe(eventName:string, callback?:EventCallback):Promise<boolean>{

        return new Promise<boolean>((resolve,reject)=>{
            try{
                if (this.subscribedTopics.has(eventName))
                    return resolve(true);

                this.subscribeToServer(eventName, (err) => {
                    if(err)
                        reject(err);
                    this.emitter.on(eventName, (payload) => {
                        callback && callback(payload, eventName);
                    })
                    this.subscribedTopics.set(eventName,callback || NOOP);
                    return resolve(true);
                })
            }catch(e){
                reject(e);
            }
        })

        
    }

    private scheduleReconnection() {
        this.reconnectionTrial++;
        //@ts-ignore
        let delay = Math.max(this.lastReconnectDelay, this.clientOptions.reconnectTimeoutMs);
        if (this.clientOptions.reconnectStrategy === 'INCREMENTAL_INTERVAL') {
            delay *= 2;
            this.lastReconnectDelay = delay;
        }
        console.log('Reconnecting to server in', delay, '...')
        return setTimeout(() => this.connect(), delay);
    }

    //AutoSubscribe to registered events on reconnection
    private runAutoSubscribe(){
        this.subscribedTopics.forEach((cb,topic)=>{
            this.subscribe(topic,cb)
            .then(()=>console.log('Subscribed to',topic))
            .catch((error)=>console.error('Error subscribing to',topic,error));
        })
    }

    /**
     * Connect to server
     */
    public connect(){
        if(this.connState==='CLOSED'){
            this.ws=new WebSocket(this.URL);
            this.attachDefaultListeners();
        }
    }

    /**
     * Disconnect from server
     */
    public disconnect(){
        this.autoDisconnect(true);
    }

    private autoDisconnect(forceDisconnect = false) {
        if (this.connState !== 'CLOSED' && this.ws) {
            this.sendQueue.pauseQueue();
            this.connState = 'INACTIVE';
            this.forceDisconnect = forceDisconnect;
            this.statusChangeCallback && this.statusChangeCallback('INACTIVE', this);
            this.ws.close();
        }
    }



    /**
     * Number of backlog messages pending in the Queue
     * @returns {number} size of queue
     */
    public getBacklog():number{
        return this.sendQueue.size();
    }

    /**
     * Enqueue message to Queue for processing
     * @param {Message} data 
     */
    protected send(data: ClientRequest) {
        this.sendQueue.enqueue(data);
    }

    /*Helper method to handle subscription, Sends subscribe message to server*/
    private subscribeToServer(eventName:string,ack?:SubscribeAcknowledgement){
        const tag=getSubscribeAckTag(eventName);
        this.emitter.on(tag, ack || NOOP);
        const subMsg = createSubscribeRequest(this.id, eventName);
        this.send(subMsg)
    }

    private reconnect(timeout:number=10){
        
        this.ws?.once('close',()=>{
            setTimeout(() => this.connect(),timeout);
        })

        this.disconnect();

    }

    //default listeners 
    private attachDefaultListeners() {

        if (!this.ws)
            return;

        //Registering an internal handshake event for setting client variables
        this.emitter.once(HANDSHAKE_TAG, (res: ServerResponse) => {

            try {
                if (res.success) {
                    const { clientId } = res;
                    if (!clientId)
                        throw new Error('Invalid Client ID recieved');
                    this.id = clientId;
                    this.runAutoSubscribe();        //re-register subscriptions after re-connection
                    this.connState = 'ACTIVE';
                    this.sendQueue.resumeQueue();   //resume queue processing
                    this.statusChangeCallback && this.statusChangeCallback('ACTIVE', this);
                }
                else
                    throw res.error || new Error('Handshake was not successfull');
            } catch (error) {
                this.ws?.emit('error', error);
            }

        })

        //process only once when a remote kill command recieved and emiited by internal emiiter 
        this.emitter.once(KILL_TAG /* KILL event name */, (data: KillMessage) => {
            console.log('Killing client, reason',data.reason);
            if(data.timeout==='immediate'){
                this.disconnect();
            }
            else{
                setTimeout(()=>this.disconnect(),data.timeout || 10);
            }
        })

        //process only once when a remote reconnect command recieved and emiited by internal emiiter
        this.emitter.once(RECONNECT_TAG /* RECONNECT event name */, (data: ReconnectMessage) => {
            console.log('reconnecting to server in', data.timeout,'ms');
            if (data.timeout === 'immediate') {
                this.reconnect();
            }
            else {
                this.reconnect(data.timeout);
            }
        })

        this.ws.on('open', () => {
            console.log('Connection open');
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout);
            }

            this.connState="OPEN";
            this.statusChangeCallback && this.statusChangeCallback('OPEN', this);
        })

        this.ws.on("close", () => {
            console.log('Connection closed');
            this.connState = 'CLOSED'
            this.sendQueue.pauseQueue();
            this.statusChangeCallback && this.statusChangeCallback('CLOSED', this);

            console.log('AutoReconnect', this.clientOptions.autoReconnect, ' Force disconnect', this.forceDisconnect);
            //perform reconnection if autoDisconnect
            if (this.clientOptions.autoReconnect
                && !this.forceDisconnect /* Not disconnected manually */
                //@ts-ignore
                && this.reconnectionTrial <= this.clientOptions.reconnectLimit /*Retry limit not exceeded */) {

                this.reconnectTimeout = this.scheduleReconnection();
            }
        })

        this.ws.on('message',(data,isBinary)=>{
            let handled=false;
            handled = this.systemRouter.onMessageRecieved(data, isBinary);
            if(!handled)
                this.eventRouter.onMessageRecieved(data, isBinary);
            this.additionalRouters.forEach(router => {
                router.onMessageRecieved(data, isBinary);
            })
        })

        this.ws.on("error", (err) => {
            console.error(err);
            this.sendQueue.pauseQueue();
            this.statusChangeCallback && this.statusChangeCallback('CLOSED', this);
        })

        //handle items from send-queue
        this.sendQueue.onDequeue((msg)=>{

            /**
             * If the message was queued before connection was 'ACTIVE' (before id was assigned by server), the queued 
             * message will have 'NOT_ASSIGNED' tag. To overcome this issue, we will verify if all the msg sent to the server
             * has an id, if not, set current id.
             */
            if (msg?.issuer === 'NOT_ASSIGNED') {
                msg.issuer = this.id;
            }

            this.ws?.send(JSON.stringify(msg));
        })

        //handle items from recieve-queue
        this.recieveQueue.onDequeue((item) => {
            switch (item?.action) {
                case 'publish':
                    if (item.event && item.payload)
                        this.emitter.emit(item.event, item.payload);
                    break;
                case 'broadcast':
                    console.log('payload is ', item);
                    if (item.payload)
                        this.emitter.emit(BROADCAST_EVENT, item.payload);
                    break;
                default: return;
            }
        })

        //handle items from ack-queue
        this.ackQueue.onDequeue((ack)=>{
            if (ack && ack.event) {
                const tag=getSubscribeAckTag(ack.event);
                this.emitter.emit(tag,ack.error);
            }
        })
    }
}
