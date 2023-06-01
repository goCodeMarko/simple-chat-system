
(async () => {
    const net = require('node:net');
    const readline = require('node:readline');
    const util = require('node:util');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
  

    const clearLine = async (dir) => {
        return new Promise((resolve, reject) => {
            process.stdout.clearLine( dir, () => {
                resolve();
            });
        })
    }
    const moveCursor = async (dx,dy) => {
        return new Promise((resolve, reject) => {
            process.stdout.moveCursor(dx,dy, () => {
                resolve();
            });
        })
    }
    const ask = async (question) => {
        return new Promise((resolve, reject) => {
            rl.question(question, async(answer) => {
                resolve(answer);
            });
        });
    }
 
    const username = await ask('Enter your username: ');
    let clientId;
    await moveCursor(0, -1);
    await clearLine(0);

    const socket = net.createConnection({ host: '127.0.0.1', port: 8080, });

    socket.setEncoding('utf-8');
    socket.on('data', async (message) => {
        const json = JSON.parse(message);
        const socketWrite = (sendType, message, rmThisClient = false) => {
            socket.write(`{
                "sendType":"${sendType}",
                "cid": ${clientId},
                "username": "${username}", 
                "message":"${message}",
                "rmThisClient": ${rmThisClient}
            }`);
        }

        const inputMessage = async() => {
            message = await ask('message: ');
            await moveCursor(0, -1);
            await clearLine(0);

            let checkCode = message.substring(0, 2);

            if (checkCode === '--' && ['--quit'].includes(message)){
                switch (message) {
                    case '--quit':
                        console.log('You left the group chat.');
                        socketWrite('group message', `${username} left the group chat.`, true);
                        process.exit();
                        break;
                }
            }else {
                console.log('You: ' + message);
                socketWrite('group message', `${username}: ${message}`);
                inputMessage();
            }
        };

        if (json.mode === 'new message'){
            await clearLine(0);
            await moveCursor(-10,0);
            console.log(json.message);
            inputMessage();
        }
        if (json.mode === 'register') {
            clientId = json.message;
            console.log('You joined the group chat.');
            socketWrite('group message', `${username} joined the group chat.`);
            inputMessage();
        } 

        rl.on('SIGINT', async () => {
            await clearLine(0);
            await moveCursor(-10, 0);
            console.log('You left the group chat.');
            socketWrite('group message', `${username} left the group chat.`, true);
            process.exit();
        });
    });

   

    socket.on('error', async () => {
    });
})()


