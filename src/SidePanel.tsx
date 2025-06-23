import {type Dispatch, type SetStateAction, useContext} from "react";
import './assets/css/base.css';
import { ClientContext, PlayerIdContext } from './Contexts.ts';
import type {IMessage} from "@stomp/stompjs";
import type {Game} from "./types/types.ts";

function SidePanel({game, setGame}: {game: Game| null, setGame: Dispatch<SetStateAction<Game | null>>}) {
    const stompClientRef = useContext(ClientContext);
    const playerId = useContext(PlayerIdContext);

    const joinGame = (response: IMessage) => {
        const message = JSON.parse(response.body);
        if (message.statusCodeValue === 404) {
            window.alert("Game not found");
            playerId.current = '';
            setGame(null);
            return;
        }
        const game = message.body as Game;
        setGame(game);
        playerId.current = message.headers.playerId[0];
        stompClientRef.current.unsubscribe('/user/topic/game');
    }

    const createGame = () => {
        if (!leaveGameConfirmation()) {
            return;
        }
        const stompClient = stompClientRef.current;
        stompClient.subscribe('/user/topic/game', joinGame);
        if (stompClient && stompClient.connected) {
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
        if (!leaveGameConfirmation()) {
            return;
        }
        const gameId = prompt("Please enter the game ID");
        if (!gameId) {
            return;
        }
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

    const leaveGameConfirmation = (): boolean => {
        if (game != null && game.status != 'FINISHED') {
            if (window.confirm("Are you sure you want to leave your current game?")) {
                const stompClient = stompClientRef.current;
                if (stompClient && stompClient.connected) {
                    setGame({...game, status: 'FINISHED'});
                    stompClient.publish({
                        destination: '/app/game/' + game.gameId + '/disconnect',
                    });
                    setGame(null);
                } else {
                    console.error('Stomp client is not connected');
                }
                return true;
            }
            return false;
        }
        return true;
    }

    const createEngineGame = () => {
        if (!leaveGameConfirmation()) {
            return;
        }
        const stompClient = stompClientRef.current;
        stompClient.subscribe('/user/topic/game', joinGame);
        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: '/app/create-engine',
                body: JSON.stringify({
                    "engine": "random"
                }),
            });
        } else {
            console.error('Stomp client is not connected');
        }
    }

    return (
        <div>
            <button name="createNewGameBtn" onClick={createGame} className="button">Create a new game</button>
            <br/>
            <br/>
            <button name="connectRandomBtn" onClick={connectToRandom} className="button">Connect to random game</button>
            <br/>
            <br/>
            <button name="connectByGameIdBtn" onClick={connectToSpecificGame} className="button">Connect by game id</button>
            <br/>
            <br/>
            <button name="createEngineGameBtn" onClick={createEngineGame} className="button">Play against engine (makes random moves)</button>
            <br/>
            <br/>
            <br/>
            <button className="button" onClick={() => {if (leaveGameConfirmation()) window.location.replace("/help.html");}}>how to play</button>
        </div>
    )
}

export default SidePanel;
