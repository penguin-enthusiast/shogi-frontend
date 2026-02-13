import {useContext, useEffect, useState} from "react";
import type {Game} from "./types/types.ts";
import {ClientContext} from "./Contexts.ts";
import './assets/css/ready-panel.css';

function ReadyPanel ({game, playerId}: {game: Game | null, playerId: string}) {
    const stompClientRef = useContext(ClientContext);

    const [readyMessage, setReadyMessage] = useState("Click when ready");
    const [ready, setReady] = useState(false);
    const [buttonClass, setButtonClass] = useState("button-not-ready");
    const [opponentReady, setOpponentReady] = useState(false);

    useEffect(() => {
        resetPanel();
    }, []);

    useEffect(() => {
        if (game == null) {
            resetPanel();
            return;
        }
        if (game.status == "FINISHED") {
            resetPanel();
        }
        if (playerId == game.player1) {
            setOpponentReady(game.player2Ready);
        } else if (playerId == game.player2) {
            setOpponentReady(game.player1Ready);
        }
    }, [game, playerId])

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
        </div>
    );
}

export default ReadyPanel;
