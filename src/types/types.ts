import type {Key, Piece} from "shogiground/types";

export interface Move {
    orig: Key;
    dest: Key;
    prom: boolean;
    capturedPiece?: Piece;
}

export interface Drop {
    piece: Piece;
    key: Key;
    prom: false;
}

export interface Game {
    gameId: string;
    player1: string;
    player2: string;
    player1Ready: boolean;
    player2Ready: boolean;
    sfen: string[];
    lastMove: Move | Drop;
    status: GameStatus;
}

export type GameStatus = 'NO_GAME' | 'WAITING' | 'IN_PROGRESS' | 'FINISHED';