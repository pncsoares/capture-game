export default function createGame() {
    const state = {
        players: {},
        fruits: {},
        screen: {
            width: 30,
            height: 30
        }
    }

    const observers = [];

    function start() {
        const frequency = 2000;

        setInterval(addFruit, frequency);
    }

    function subscribe(observerFunction) {
        observers.push(observerFunction);
    }

    function notifyAll(command) {
        for (const observerFunction of observers) {
            observerFunction(command);
        }
    }
    
    function setState(newState) {
        Object.assign(state, newState);
    }

    function addPlayer(command) {
        const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width);
        const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height);
        const score = 0

        state.players[command.playerId] = {
            x: playerX,
            y: playerY,
            score
        }

        notifyAll({
            type: 'add-player',
            playerId: command.playerId,
            playerX: playerX,
            playerY: playerY,
            score
        });
    }

    function removePlayer(command) {
        delete state.players[command.playerId];

        notifyAll({
            type: 'remove-player',
            playerId: command.playerId
        });
    }

    function addFruit(command) {
        const fruitId = command ? command.fruitId : Math.floor(Math.random() * 10000000);
        const fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width);
        const fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height);

        state.fruits[fruitId] = {
            x: fruitX,
            y: fruitY
        }

        notifyAll({
            type: 'add-fruit',
            fruitId: fruitId,
            fruitX: fruitX,
            fruitY: fruitY,
        });
    }

    function removeFruit(command) {
        delete state.fruits[command.fruitId];

        notifyAll({
            type: 'remove-fruit',
            fruitId: command.fruitId
        });
    }

    function movePlayer(command) {
        notifyAll(command);

        const acceptedMoves = {
            ArrowUp(player) {
                if (player.y - 1 >= 0) {
                    player.y = player.y - 1;
                }
            },
            ArrowRight(player) {
                if (player.x + 1 < state.screen.width) {
                    player.x = player.x + 1;
                    return;
                }
            },
            ArrowDown(player) {
                if (player.y + 1 < state.screen.height) {
                    player.y = player.y + 1;
                }
            },
            ArrowLeft(player) {
                if (player.x - 1 >= 0) {
                    player.x = player.x - 1;
                }
            }
        }

        const keyPressed = command.keyPressed;
        const playerId = command.playerId;
        const player = state.players[command.playerId];
        const moveFunction = acceptedMoves[keyPressed];

        if (player && moveFunction) {
            moveFunction(player);
            checkFruitCollision(playerId);
        }
    }

    function checkFruitCollision(playerId) {
        const player = state.players[playerId];

        for (const fruitId in state.fruits) {
            const fruit = state.fruits[fruitId];

            if (player.x === fruit.x && player.y === fruit.y) {
                removeFruit({ fruitId: fruitId });
                player.score += 1;
            }
        }
    }

    return {
        start,
        subscribe,
        notifyAll,
        setState,
        addPlayer,
        removePlayer,
        addFruit,
        removeFruit,
        movePlayer,
        state
    }
}