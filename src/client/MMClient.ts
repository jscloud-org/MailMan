import { AutoQueue } from "@js-cloud/flashq";
import { EventEmitter, WebSocket } from "ws";
import { getSubscribeAckTag } from './constants';
import EventMessagingRouter from './EventMessageRouter';
import HandshakeRouter from './HandshakeRouter';
import LogMessageRouter from './LogMessageRouter';
import MessageRouter from "../common/router/MessageRouter";
import { ClientOptions, createDefaultOptions } from "./index";
import KillMessage from '../common/message/killMessage'
import ReconnectMessage from '../common/message/reconnectMessage'
import { AckMessage,  createPublishMessage, createSubscribeMessage,createHandshakeMessage, 
    Message, HandshakeMessage } from '../common/message';

export type EventCallback = (payload:any,event?:string)=>void;
export type StatusChangeCallback = (status:ConnectionState,mmClient:MMClient)=>void;
export type SubscribeAcknowledgement = (error:any)=>void | (()=>void)
export const NOOP= ()=>{}

export type ConnectionState ="OPEN"|"ACTIVE"|"INACTIVE"|"CLOSED"

export class MMClient{
    
    private ws?:WebSocket   
    private alias?:string //user given names given to clients
    private id?:string    //id assigned by the server  
    private URL:string    //Server URL  
    private sendQueue: AutoQueue<Message>       //Queue for sending messages
    private recieveQueue: AutoQueue<Message>    //Queue for recieving messages
    private ackQueue: AutoQueue<AckMessage>     //Queue for recieving ack messages only
    private emitter:EventEmitter;               //Internal event emitter
    private connState: ConnectionState           //states -> "OPEN"|"ACTIVE"|"INACTIVE"|"CLOSED"
    private statusChangeCallback?:StatusChangeCallback  //called when status is changed
    private subscribedTopics:Map<string,EventCallback>  //Map of topics subscribed, used for re-subscribing when reconnecting 
    private eventRouter:MessageRouter                   //for routing event-based messages
    private handshakeRouter:MessageRouter               //for routing hand-shake messages
    private logRouter:MessageRouter;                    //for logging every message recieved
    private clientOptions:ClientOptions                 //options

    constructor(URL:string,clientOptions?:ClientOptions){
        this.URL=URL;
        this.sendQueue=new AutoQueue<Message>();
        this.sendQueue.pauseQueue();                    //send queue should be paused on start to deny all contact with server before handshake
        this.recieveQueue = new AutoQueue<Message>();
        this.ackQueue = new AutoQueue<AckMessage>();
        this.alias=this.id=undefined
        this.connState='CLOSED'
        this.emitter = new EventEmitter();
        this.eventRouter = new EventMessagingRouter(this.ackQueue,this.recieveQueue);
        this.subscribedTopics=new Map();
        this.logRouter=new LogMessageRouter()
        this.handshakeRouter=new HandshakeRouter(this.emitter);
        this.clientOptions=clientOptions || createDefaultOptions();
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
            const msg = createPublishMessage(eventName, payload);
            this.sendQueue.enqueue(msg);
            return true;
        } catch (error) {
            throw error;
        }
        
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
        if(this.connState!=='CLOSED' && this.ws){
            this.ws.terminate();
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
    public send(data:Message){
        this.sendQueue.enqueue(data);
    }

    /*Helper method to handle subscription, Sends subscribe message to server*/
    private subscribeToServer(eventName:string,ack?:SubscribeAcknowledgement){
        const tag=getSubscribeAckTag(eventName);
        this.emitter.on(tag, ack || NOOP);
        const subMsg=createSubscribeMessage(eventName);
        this.send(subMsg)
    }

    private reconnect(timeout:number=10){
        
        this.ws?.once('close',()=>{
            setTimeout(() => this.connect(),timeout);
        })

        this.disconnect();

    }
    //initial client handshake after connection and exchange client id
    private performHandshake(){

        //Registering an internal event before sending message
        this.emitter.on('_handshake_',(res:HandshakeMessage)=>{

            try {
                if (res.success) {
                    const { id } = res;
                    if(!id)
                        throw new Error('Invalid Client ID recieved');
                    this.id = id;
                    this.runAutoSubscribe();        //re-register subscriptions after re-connection
                    this.connState = 'ACTIVE';
                    this.sendQueue.resumeQueue();   //resume queue processing
                    this.statusChangeCallback && this.statusChangeCallback('ACTIVE', this);
                }
                else
                    throw res.error || new Error('Handshake was not successfull');
            } catch (error) {
                this.ws?.emit('error', error );
            }
            
        })

        //build handshake message 
        const msg=createHandshakeMessage();
        this.ws?.send(JSON.stringify(msg))
    }

    //default listeners 
    private attachDefaultListeners(){

        if(!this.ws)
            return;

        //Remote Kill command 
        this.emitter.on('_kill_',(data:KillMessage)=>{
            console.log('Killing client, reason',data.reason);
            if(data.timeout==='immediate'){
                this.disconnect();
            }
            else{
                setTimeout(()=>this.disconnect(),data.timeout || 10);
            }
        })

        //Remote reconnect command
        this.emitter.on('_reconnect_', (data: ReconnectMessage) => {
            console.log('reconnecting to server in', data.timeout,'ms');
            if (data.timeout === 'immediate') {
                this.reconnect();
            }
            else {
                this.reconnect(data.timeout);
            }
        })

        this.ws.on('open',()=>{
            console.log('Connection open');
            this.connState="OPEN";
            this.statusChangeCallback && this.statusChangeCallback('OPEN', this);
            this.performHandshake();
        })

        this.ws.on("close",()=>{
            console.log('Connection close');
            this.connState = 'CLOSED'
            this.sendQueue.pauseQueue();
            this.statusChangeCallback && this.statusChangeCallback('CLOSED', this);
        })

        this.ws.on('message',(data,isBinary)=>{
            let handled=false;
            handled=this.handshakeRouter.onMessageRecieved(data);
            if(!handled)
                this.eventRouter.onMessageRecieved(data);
        })

        this.ws.on("error", (err) => {
            console.log('error:',err);
            this.sendQueue.pauseQueue();
            this.statusChangeCallback && this.statusChangeCallback('CLOSED', this);
        })

        //handle items from send-queue
        this.sendQueue.onDequeue((msg)=>{
            this.ws?.send(JSON.stringify(msg));
        })

        //handle items from recieve-queue
        this.recieveQueue.onDequeue((item)=>{
            if (item && item.action === 'publish' && item.event) {
                this.emitter.emit(item.event, item.payload);
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