import { MMClient, MMServer, ClientOptions } from '../src'
import LogMessageRouter from '../src/client/routers/LogMessageRouter';
import { VerifyClientCallback } from '../src/server/MMServer';
import SSLConfig from '../src/server/SSLConfig';
import { v4 as uuid } from 'uuid';

const options: ClientOptions = {
    alias: 'mm_server',
    reconnectStrategy: 'INCREMENTAL_INTERVAL',
    autoReconnect: true,
    reconnectLimit: 5,
    reconnectTimeoutMs: 1000,
    logEnabled: true,
}

const sslconfig: SSLConfig = {
    cert: 'path to cert',
    key: 'path to key'
}

const verifyClientCallback: VerifyClientCallback = (req, done) => {
    const newId = uuid();
    done(null, newId);
}

MMServer.init(4000, sslconfig, undefined, verifyClientCallback);




for (let i = 0; i < 1; i++) {
    const client = new MMClient('ws://localhost:4000', options);

    client.onStatusChanged((status, mClient) => {
        if (status === 'ACTIVE') {
            console.log('connection active:', client.id);
            // spawnClient();
        }
    })
    client.subscribe('broadcast', (data) => console.log(data))
    client.connect();
}

const client = new MMClient('ws://localhost:4000', {
    autoReconnect: false
});

client.onStatusChanged((status, mClient) => {
    if (status === 'ACTIVE') {
        console.log('connection active:', client.id);
        // spawnClient();
    }
})

client.connect();
client.broadcast({ data: 'data' })

/*
const publish = () => client.publish('something', {
    data: 'This is my first publish message'
})


client.connect();

const fireUpSubscribers = () => {
    for (let i = 0; i < 0; i++) {
        const client = new MMClient('ws://localhost:4000',);

        client.onStatusChanged((status, mClient) => {
            if (status === 'ACTIVE') {
                console.log('current id:', client.id)
            }
        })

        client.subscribe('something', (payload, eventName) => {
            console.log('event recieved for (', eventName, ') ->', payload);

        }).then(() => console.log('subscribed to topic'))
        .catch(console.error);

        client.connect();

    }
}



//setTimeout(() => MMServer.getInstance().killAllClients(), 500);

//setInterval(() => MMServer.getInstance().reconnectAllClients(), 1000);
*/
