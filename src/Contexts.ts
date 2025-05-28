import {createContext, type RefObject} from 'react';
import type {Client} from "@stomp/stompjs";

export const ClientContext = createContext<RefObject<Client>>(null!);
export const PlayerContext = createContext<RefObject<'sente' | 'gote' | undefined>>(null!);