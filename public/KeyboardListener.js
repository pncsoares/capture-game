export default function createKeyboardListener() {
    const state = {
        observers: [],
        playerId: null
    }

    function registerPlayerId(playerId) {
        state.playerId = playerId;
    }

    function subscribe(observerFunction) {
        state.observers.push(observerFunction);
    }

    function notifyAll(command) {
        for (const observerFunction of state.observers) {
            observerFunction(command);
        }
    }

    document.addEventListener('keydown', handleKeyDown);

    function handleKeyDown(event) {
        const command = {
            type: 'move-player',
            playerId: state.playerId,
            keyPressed: event.key
        }
    
        notifyAll(command);
    }

    return {
        registerPlayerId,
        subscribe
    }
}