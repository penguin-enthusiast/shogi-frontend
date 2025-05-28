import {pieceTypes} from "./constants.tsx";

export interface Square {
    x: number;
    y: number;
}

export interface Piece {
    inHand: boolean;
    lastMoved: number;
    promoted: boolean;
    sente: boolean;
    square: Square;
    symbol: string;
}

export interface Move {
    targetSquare: Square;
    isSente: boolean;
}

export interface BoardMove extends Move {
    capture: boolean;
    promotion: boolean;
}

export interface DropMove extends Move {
    pieceType: pieceTypes;
}

export interface Board {
    lastMove: Move;
    legalMoves: Move[];
    PiecesInHand: {pieces: number[][]};
    PiecesOnBoard: Piece[];
}

export interface Game {
    gameId: string;
    player1: string;
    player2: string;
    board: Board;
}