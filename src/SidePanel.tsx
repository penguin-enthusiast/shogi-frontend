import {type Dispatch, type SetStateAction, useContext, useState} from "react";
import { ClientContext, PlayerContext } from './Contexts.ts';
import type {IMessage} from "@stomp/stompjs";
import type {Game} from "./types/types.ts";

function SidePanel({game, setGame}: {game: Game| null, setGame: Dispatch<SetStateAction<Game | null>>}) {
    const stompClientRef = useContext(ClientContext);
    const player = useContext(PlayerContext);
    const [gameId, setGameId] = useState('');

    const joinGame = (response: IMessage) => {
        const message = JSON.parse(response.body);
        if (message.statusCodeValue === 404) {
            window.alert("Game not found")
            player.current = undefined;
            return;
        }
        const game = message.body as Game;
        setGame(game);
        window.alert('Joined game with id:\n\n' + game.gameId);
        stompClientRef.current.unsubscribe('/user/topic/game');
    }

    const createGame = () => {
        if (!leaveGameConfirmation()) {
            return;
        }
        const stompClient = stompClientRef.current;
        stompClient.subscribe('/user/topic/game', joinGame);
        if (stompClient && stompClient.connected) {
            player.current = 'sente';
            stompClient.publish({
                destination: '/app/create',
            });
        } else {
            console.error('Stomp client is not connected');
        }
    }

    const connectToRandom = () => {
        if (!leaveGameConfirmation()) {
            return;
        }
        const stompClient = stompClientRef.current;
        stompClient.subscribe('/user/topic/game', joinGame);
        if (stompClient && stompClient.connected) {
            player.current = 'gote';
            stompClient.publish({
                destination: '/app/join/random',
            });
        } else {
            console.error('Stomp client is not connected');
        }
    }

    const connectToSpecificGame = () => {
        const stompClient = stompClientRef.current;
        stompClient.subscribe('/user/topic/game', joinGame);
        if (gameId == null || gameId === '') {
            alert("Please enter a game id");
            return;
        }
        if (!leaveGameConfirmation()) {
            return;
        }
        if (stompClient && stompClient.connected) {
            player.current = 'gote';
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

    const leaveGameConfirmation = (): boolean => {
        if (game != null && game.status != 'FINISHED') {
            if (window.confirm("Are you sure you want to leave your current game?")) {
                const stompClient = stompClientRef.current;
                if (stompClient && stompClient.connected) {
                    setGame({...game, status: 'FINISHED'});
                    stompClient.publish({
                        destination: '/app/game/' + game.gameId + '/disconnect',
                    });
                } else {
                    console.error('Stomp client is not connected');
                }
                return true;
            }
            return false;
        }
        return true;
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
