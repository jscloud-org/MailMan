import { MMClient } from "../src/client";
import {MMServer} from '../src/server/MMServer'
import {WebSocketServer} from 'ws'
import { AckMessage, HandshakeMessage, Message } from '../src/common/message';


MMServer.init(4000);



/*
const wss=new WebSocketServer({
    port:4000
})

wss.on('connection',(ws,req)=>{
    console.log('Server','new connection')
    ws.on('open',()=>{
        console.log('Server','connection open to client');
    })

    ws.on('close', () => {
        console.log('Server','connection closed to client');
    })

    ws.on('error', (err) => {
        console.log('Server','connection error',err);
    })

    ws.on('message',(data,bin)=>{
        const msg:Message=JSON.parse(data.toString());
        if(msg.action==='subscribe'){
            
            const res:AckMessage={
                action:'subscribe_ack',
                event:msg.event,
                issuedAt:Date.now(),
                success:true
            }

            ws.send(JSON.stringify(res));
        }
        if (msg.action === 'publish') {
            const res: Message = {
                action: 'publish',
                event: msg.event,
                payload:msg.payload,
                issuedAt: Date.now()
            }

            ws.send(JSON.stringify(res));
        }
        if (msg.action === 'handshake') {
            const res: HandshakeMessage = {
                action: 'handshake',
                id:'r-a-n-d-o-m-i-d',
                issuedAt: Date.now(),
                success:false,
                error:{
                    error:'I dont like it'
                }
            }

            ws.send(JSON.stringify(res));
        }
        console.log('Server','Message recieved ->',data.toString())
    })
})

*/
const client = new MMClient('ws://localhost:4000');

client.onStatusChanged((status,mClient)=>{
    if(status==='ACTIVE'){
        setTimeout(()=>MMServer.getInstance().reconnectAllClients(),1000);
    }
})

client.subscribe('something',(payload,eventName)=>{
    console.log('event recieved for (',eventName,') ->',payload);

}).then(()=>console.log('subscribed to topic'))
.catch(console.error);


client.publish('something',{
    data:'This is my first publish message'
})

client.connect();

