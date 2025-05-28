import {useEffect, useRef, createContext, type RefObject} from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import Board from "./Board.tsx";
import SidePanel from "./SidePanel.tsx";

export const ClientContext = createContext<RefObject<Client>>(null!);

const App = () => {
    const stompClientRef = useRef<Client>(null!);

    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('Connected to websocket');
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
        <ClientContext.Provider value={stompClientRef}>
            <div className="main">
                <SidePanel/>
                <Board/>
            </div>
        </ClientContext.Provider>
    );
};

export default App;