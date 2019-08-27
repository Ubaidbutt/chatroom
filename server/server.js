const path = require ('path');
const http = require ('http');
const express = require ('express');
const socketIO = require ('socket.io');

const publicPath = path.join (__dirname, '../public');
const port = process.env.port || 3000;
const app = express();
const server = http.createServer (app);
const io = socketIO (server);


io.on ('connection', (socket) => {
    console.log ('New user connected! ');

    socket.on ('disconnect', () => {
        console.log ('User disconnected! ');
    });
});

app.use (express.static (publicPath));

server.listen(port, () => console.log (`The server is up and listening at Port ${port}.`));