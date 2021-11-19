import { MMClient, MMServer } from '../src';


MMServer.init(4000);



const number = 3;

for (let i = 0; i < number; i++) {
    const client = new MMClient('ws://localhost:4000', {
        autoReconnect: false,
    });

    client.onStatusChanged((status, mClient) => {

        if (status === 'ACTIVE') {
            console.log('current id:', client.id)
            // setTimeout(() => MMServer.getInstance().dropConnection(client.id), 3000)
        }
    })



  /*  client.subscribe('something', (payload, eventName) => {
        console.log('event recieved for (', eventName, ') ->', payload);

    }).then(() => console.log('subscribed to topic'))
        .catch(console.error);


    client.publish('something', {
        data: 'This is my first publish message'
    })

*/

    client.connect();
}


//setTimeout(() => MMServer.getInstance().killAllClients(), 500);

//setInterval(() => MMServer.getInstance().reconnectAllClients(), 1000);

