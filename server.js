const net = require('node:net');

let clients = [];


const server = net.createServer((socket) => {
    console.log('new connection');
    const clientId = clients.length+1;

    clients.push({ cid: clientId, socket});
    socket.write(`{"mode": "register", "message": ${clientId}}`)

    socket.setEncoding('utf-8');
    socket.on('data', (data) => {
        const json = JSON.parse(data);

        if (json.rmThisClient){
            clients = clients.filter((client) => client.cid !== json.cid);
           
        }
        console.log('count',clients.length)
        if (json.sendType === 'group message'){
            const filteredClients = clients.filter((client) => client.cid !== json.cid);
    
            filteredClients.forEach(client => {
                client.socket.write(`{"mode": "new message", "message": "${json.message}"}`)
            })
        }
    })

    socket.on('error', async () => {
    })

});

server.listen(8080, '127.0.0.1', () => {
    console.log(`Server  is on `, server.address());
})