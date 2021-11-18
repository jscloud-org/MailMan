import { MMClient, MMServer } from '../src'
import LogMessageRouter from '../src/client/routers/LogMessageRouter';
import { ClientRequest } from '../src/common/message';
import ServerMessageRouter from '../src/common/router/ServerMessageRouter';


class LogRouter extends ServerMessageRouter {
    protected routeMessage(msg: ClientRequest): boolean {
        console.log('server log', msg);
        return true;
    }

}

MMServer.init(4000, undefined, undefined, (req, cb) => {
    if (MMServer.getInstance().getClientCount() > 2)
        cb(new Error('Maximum client reached'));
    else
        cb(null, 'something');
}, [new LogRouter()]);


const client = new MMClient('ws://localhost:4000', undefined, [
    new LogMessageRouter()
]);

client.onStatusChanged((status,mClient)=>{

    if(status==='ACTIVE'){
        console.log('current id:', client.id)
       // setTimeout(() => MMServer.getInstance().dropConnection(client.id), 3000)

    }
})



client.subscribe('something', (payload, eventName) => {
    console.log('event recieved for (', eventName, ') ->', payload);

}).then(() => console.log('subscribed to topic'))
    .catch(console.error);


client.publish('something', {
    data: 'This is my first publish message'
})



client.connect();

//setTimeout(() => MMServer.getInstance().killAllClients(), 500);

//setInterval(() => MMServer.getInstance().reconnectAllClients(), 1000);

