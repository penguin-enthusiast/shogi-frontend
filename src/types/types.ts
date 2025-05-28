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
    sfen: string[];
    lastMove: Move | Drop;
}