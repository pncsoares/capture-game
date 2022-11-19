import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import createGame from './src/game.js';

const app = express();
const server = http.createServer(app);
const sockets = new Server(server);

app.use(express.static('src'));

const game = createGame();
game.start();

game.subscribe((command) => {
    sockets.emit(command.type, command);
});

sockets.on('connection', (socket) => {
    const playerId = socket.id;
    console.log(`> Player connected: ${playerId}`);

    game.addPlayer({ playerId: playerId });

    socket.emit('setup', game.state);

    socket.on('disconnect', () => {
        game.removePlayer({ playerId: playerId });
        console.log(`> Player disconnected: ${playerId}`);
    });

    socket.on('move-player', (command) => {
        // validate that what the client send to server is not scam
        command.playerId = playerId;
        command.type = 'move-player';

        game.movePlayer(command);
    });
});

server.listen(3000, () => {
    console.log('> Server listening on port 3000');
});