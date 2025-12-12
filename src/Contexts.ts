import {createContext, type RefObject} from 'react';
import type {Client} from "@stomp/stompjs";

export const ClientContext = createContext<RefObject<Client>>(null!);
export const PlayerIdContext = createContext<RefObject<string>>(null!);
export const BoardMovesContext = createContext<string[]>([]);