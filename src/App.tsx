import {useEffect, useRef, useState} from 'react';
import SockJS from 'sockjs-client';
import {Client} from '@stomp/stompjs';
import Board from "./Board.tsx";
import SidePanel from "./SidePanel.tsx";
import type {Game} from "./types/types.ts";
import {ClientContext, PlayerIdContext} from './Contexts.ts';

const App = () => {
    const [game, setGame] = useState<Game|null>(null);
    const stompClientRef = useRef<Client>(null!);
    const playerIdRef = useRef<string>('');

    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
            },
            onStompError: (frame) => {
                console.error('Error: ' + frame.headers['message'] + '\n' + frame.body);
            },
        });

        stompClient.activate();
        stompClientRef.current = stompClient;

        return () => {
            stompClient.deactivate();
        };
    }, []);

    return (
        <PlayerIdContext.Provider value={playerIdRef}>
            <ClientContext.Provider value={stompClientRef}>
                <div className="main">
                    <SidePanel game={game} setGame={setGame}/>
                    <Board game={game} setGame={setGame}/>
                </div>
            </ClientContext.Provider>
        </PlayerIdContext.Provider>
    );
};

export default App;