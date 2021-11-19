import { MMClient } from '../src'
import LogMessageRouter from '../src/client/routers/LogMessageRouter';



for (let i = 0; i < 10; i++) {
    const client = new MMClient('ws://localhost:4000', {
        autoReconnect: false
    });

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
