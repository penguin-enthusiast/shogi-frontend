import {useContext, useState} from "react";
import {ClientContext} from "./App.tsx";
import type {IMessage} from "@stomp/stompjs";
import type {Game} from "./types/types.tsx";

function getResponse (response: IMessage) {
    const message = JSON.parse(response.body);
    if (message.statusCodeValue === 404) {
        window.alert("Game not found")
        return;
    }
    const game = JSON.parse(response.body).body as Game;
    window.alert('Joined game with id:\n\n' + game.gameId);
}

function SidePanel() {
    const stompClientRef = useContext(ClientContext);
    const [gameId, setGameId] = useState('');

    const createGame = () => {
        const stompClient = stompClientRef.current;
        stompClient.subscribe('/user/topic/game', getResponse);
        if (stompClient && stompClient.connected) {
            console.log('Creating game');
            stompClient.publish({
                destination: '/app/create',
            });
        } else {
            console.error('Stomp client is not connected');
        }
    }

    const connectToRandom = () => {
        const stompClient = stompClientRef.current;
        stompClient.subscribe('/user/topic/game', getResponse);
        if (stompClient && stompClient.connected) {
            console.log('joining random game');
            stompClient.publish({
                destination: '/app/connect/random',
            });
        } else {
            console.error('Stomp client is not connected');
        }
    }

    const connectToSpecificGame = () => {
        if (gameId == null || gameId === '') {
            alert("Please enter a game id");
            return;
        }
        const stompClient = stompClientRef.current;
        stompClient.subscribe('/user/topic/game', getResponse);
        if (stompClient && stompClient.connected) {
            console.log('joining game with id: ' + gameId);
            stompClient.publish({
                destination: '/app/connect',
                body: JSON.stringify({
                    "gameId": gameId
                }),
            });
        } else {
            console.error('Stomp client is not connected');
        }
    }

    return (
        <div>
            <button name="createNewGameBtn" onClick={createGame}>Create a new game</button>
            <br/>
            <button onClick={connectToRandom}>Connect to random game</button>
            <br/>
            <br/>
            <button name="connectByGameIdBtn" onClick={connectToSpecificGame}>Connect by game id</button>
            <br/>
            <input id="game_id" placeholder="Paste game id"
                   value={gameId} onInput={e => setGameId(e.currentTarget.value)} />
            <br/>
        </div>
    )
}

export default SidePanel;
