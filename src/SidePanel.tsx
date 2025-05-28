import {type Dispatch, type SetStateAction, useContext, useState} from "react";
import { ClientContext, PlayerContext } from './Contexts.ts';
import type {IMessage} from "@stomp/stompjs";
import type {Game} from "./types/types.ts";

function SidePanel({setGame}: {setGame: Dispatch<SetStateAction<Game | null>>}) {
    const stompClientRef = useContext(ClientContext);
    const player = useContext(PlayerContext);
    const [gameId, setGameId] = useState('');

    const joinCreatedGame = (response: IMessage) => {
        const game = JSON.parse(response.body).body as Game;
        player.current = 'sente';
        setGame(game);
        window.alert('Created game with id:\n\n' + game.gameId);
    }

    const joinExistingGame = (response: IMessage) => {
        const message = JSON.parse(response.body);
        if (message.statusCodeValue === 404) {
            window.alert("Game not found")
            return;
        }
        const game = message.body as Game;
        player.current = 'gote';
        setGame(game);
        window.alert('Joined game with id:\n\n' + game.gameId);
    }

    const createGame = () => {
        const stompClient = stompClientRef.current;
        stompClient.subscribe('/user/topic/game', joinCreatedGame);
        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: '/app/create',
            });
        } else {
            console.error('Stomp client is not connected');
        }
    }

    const connectToRandom = () => {
        const stompClient = stompClientRef.current;
        stompClient.subscribe('/user/topic/game', joinExistingGame);
        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: '/app/join/random',
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
        stompClient.subscribe('/user/topic/game', joinExistingGame);
        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: '/app/join',
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
