import {useContext, useEffect, useState} from "react";
import type {Game} from "./types/types.ts";
import {ClientContext} from "./Contexts.ts";
import './assets/css/ready-panel.css';
import type {Color} from "shogiground/types";

function ReadyPanel ({game, playerId, turn}: {game: Game | null, playerId: string, turn: Color}) {
    const stompClientRef = useContext(ClientContext);

    const [readyMessage, setReadyMessage] = useState("Click when ready");
    const [ready, setReady] = useState(false);
    const [buttonClass, setButtonClass] = useState("button-not-ready");
    const [opponentReady, setOpponentReady] = useState(false);
    const [player, setPlayer] = useState<Color>('sente');
    const [moveMessage, setMoveMessage] = useState('');

    useEffect(() => {
        resetPanel();
    }, []);

    useEffect(() => {
        if (game == null || game.status == "FINISHED") {
            resetPanel();
            return;
        }
        if (playerId == game.player1) {
            setPlayer('sente');
            setOpponentReady(game.player2Ready);
        } else if (playerId == game.player2) {
            setPlayer('gote');
            setOpponentReady(game.player1Ready);
        }
    }, [game, playerId])

    useEffect(() => {
        if (!game || game.status != "IN_PROGRESS") {
            setMoveMessage('');
            return;
        }
        setMoveMessage(player == turn ? "Your move." : "Waiting for opponent.");
    }, [game, player, turn]);

    const resetPanel = () => {
        setReady(false);
        setReadyMessage("Click when ready");
        setButtonClass("button-not-ready");
    }

    const updateReadyStatus = () => {
        if (!game) {
            return;
        }
        const stompClient = stompClientRef.current;
        if (stompClient && stompClient.connected) {
            setReadyMessage("Ready!");
            setReady(true);
            setButtonClass("button-ready")
            stompClient.publish({
                destination: '/app/game/' + game.gameId + '/setReadyStatus',
            });
        } else {
            console.error('Stomp client is not connected');
        }
    }

    const bothPlayersConnected = () => {
        if (!game) {
            return false;
        }
        return game.player1 != null && game.player2  != null;
    }

    const displayPanel = (): boolean => {
        if (!game) {
            return false;
        }
        return bothPlayersConnected() && (game.status == "WAITING" || game.status == "IN_PROGRESS");
    }

    return (
        <div className={displayPanel() ? 'ready-panel-container' : 'ready-panel-container-hidden'}>
            <button name='connectByGameIdBtn' className={buttonClass} disabled={ready} onClick={updateReadyStatus}>
                {readyMessage}
            </button>
            <p className={opponentReady ? 'text-ready' : ''}>
                {opponentReady? "Opponent is ready." : "Waiting for opponent..."}
            </p>
            <p>{moveMessage}</p>
        </div>
    );
}

export default ReadyPanel;
