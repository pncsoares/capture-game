export default function renderScreen(screen, game, scoreTable, requestAnimationFrame, currentPlayerId) {
    const context = screen.getContext('2d');

    clearScreen(context);

    for (const playerId in game.state.players) {
        const player = game.state.players[playerId];
        context.fillStyle = 'rgba(252, 181, 52, 0.8)';
        context.fillRect(player.x, player.y, 1, 1);
        // drawPlayer(context, player, game);
    }

    for (const fruitId in game.state.fruits) {
        const fruit = game.state.fruits[fruitId];
        context.fillStyle = 'rgba(208, 74, 70, 0.9)';
        context.fillRect(fruit.x, fruit.y, 1, 1);
    }

    const currentPlayer = game.state.players[currentPlayerId];

    if (currentPlayer) {
        context.fillStyle = 'rgba(44, 195, 67, 0.8)';
        context.fillRect(currentPlayer.x, currentPlayer.y, 1, 1);
        // const isCurrentPlayer = true
        // drawPlayer(context, currentPlayer, game, isCurrentPlayer);
    }

    updateScoreTable(game, scoreTable, currentPlayerId);

    requestAnimationFrame(() => {
        renderScreen(screen, game, scoreTable, requestAnimationFrame, currentPlayerId);
    });
}

function drawPlayer(screenContext, player, game, isCurrentPlayer = false) {
    const { screen: { pixelsPerFields } } = game.state

    let eyeAndMouthColors = 'black'
    let faceColor = getColorFromScore(player.score)
    if (isCurrentPlayer) {
        eyeAndMouthColors = 'white'
    }

    let { x, y } = player
    x *= pixelsPerFields
    y *= pixelsPerFields

    // Draw face
    screenContext.fillStyle = faceColor
    screenContext.fillRect(x, y, pixelsPerFields, pixelsPerFields)

    // Draw eyes and mouth
    screenContext.fillStyle = eyeAndMouthColors
    screenContext.fillRect(x + 1, y + 1, 1, 1)
    screenContext.fillRect(x + 3, y + 1, 1, 1)
    screenContext.fillRect(x + 1, y + 3, 3, 1)
}

function clearScreen(context) {
    context.fillStyle = 'white';
    context.clearRect(0, 0, 30, 30);
}

function getColorFromScore(score) {
    score *= 10
    const red = score > 240 ? 240 : score
    const green = score > 219 ? 219 : score
    const blue = score > 79 ? 79 : score
    return `rgb(${red},${green},${blue})`
}

function updateScoreTable(game, scoreTable, currentPlayerId) {
    const maxResults = 15;

    let scoreTableInnerHTML = `
        <tr class="header">
            <td>Top ${maxResults} players</td>
            <td>Points</td>
        </tr>
    `;

    const playersArray = [];

    for (let socketId in game.state.players) {
        const player = game.state.players[socketId];

        playersArray.push({
            playerId: socketId,
            x: player.x,
            y: player.y,
            score: player.score,
        });
    }

    const playersSortedByScore = playersArray.sort((first, second) => {
        if (first.score < second.score) {
            return 1;
        }

        if (first.score > second.score) {
            return -1;
        }

        return 0;
    })

    const topScorePlayers = playersSortedByScore.slice(0, maxResults);

    scoreTableInnerHTML = topScorePlayers.reduce((stringFormed, player) => {
        return stringFormed + `
            <tr class="${player.playerId === currentPlayerId ? 'current-player' : ''}">
                <td>${player.playerId}</td>
                <td>${player.score}</td>
            </tr>
        `;
    }, scoreTableInnerHTML);

    let playerInTop10 = false;

    for (const player of topScorePlayers) {
        if (player.playerId === currentPlayerId) {
            playerInTop10 = true;
            break;
        }
    }

    if (!playerInTop10) {
        const currentPlayerFromTopScore = game.state.players[currentPlayerId];

        if (!currentPlayerFromTopScore) {
            return;
        }

        scoreTableInnerHTML += `
            <tr class="current-player">
                <td>${currentPlayerId}</td>
                <td>${currentPlayerFromTopScore.score}</td>
            </tr>
        `;
    }

    scoreTable.innerHTML = scoreTableInnerHTML;
}