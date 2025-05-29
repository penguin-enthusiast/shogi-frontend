import type {Color, DropDests, Key, Piece, PieceName} from "shogiground/types";

export function getDrops(pieces: Map<Key, Piece>, sfen: string, color: Color): DropDests {
    const dests: DropDests = new Map();
    let piecesInHand: PieceName[];
    if (color == 'sente') {
        piecesInHand = getPiecesInHandFromSfen(sfen).sente;
    } else {
        piecesInHand = getPiecesInHandFromSfen(sfen).gote;
    }
    const pawnFiles: boolean[] = [false, false, false, false, false, false, false, false, false];
    for (const key of pieces.keys()) {
        const pieceOnBoard: Piece | undefined = pieces.get(key);
        if (pieceOnBoard?.role == 'pawn' && pieceOnBoard.color == color) {
            const file: number = 9 - +key[0];
            pawnFiles[file] = true;
        }
    }

    for (const piece of piecesInHand) {
        const drops: Key[] = [];
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                const key: Key = translateSquareToKey(x, y);
                if (!pieces.get(key) && islegalDrop(x, y, piece, pawnFiles)) {
                    drops.push(key);
                }
            }
        }
        dests.set(piece, drops);
    }

    return dests;
}

export function getPiecesInHandFromSfen(sfen: string): {sente: PieceName[], gote: PieceName[]} {
    const sente: PieceName[] = [];
    const gote: PieceName[] = [];

    for (let c of sfen) {
        if (!c.match(/[a-z]/i)) {
            continue;
        }
        const isSente = c == c.toUpperCase();
        c = c.toUpperCase();
        switch (c) {
            case 'P': if (isSente) sente.push('sente pawn'); else gote.push('gote pawn'); break;
            case 'L': if (isSente) sente.push('sente lance'); else gote.push('gote lance'); break;
            case 'N': if (isSente) sente.push('sente knight'); else gote.push('gote knight'); break;
            case 'S': if (isSente) sente.push('sente silver'); else gote.push('gote silver'); break;
            case 'G': if (isSente) sente.push('sente gold'); else gote.push('gote gold'); break;
            case 'B': if (isSente) sente.push('sente bishop'); else gote.push('gote bishop'); break;
            case 'R': if (isSente) sente.push('sente rook'); else gote.push('gote rook'); break;
        }
    }
    return {sente: sente, gote: gote};
}

export function getUnpromotedPieceRole(role: string) {
    switch (role) {
        case 'pawn':
        case 'tokin':
            return 'pawn';
        case 'lance':
        case 'promotedlance':
            return 'lance';
        case 'knight':
        case 'promotedknight':
            return 'knight';
        case 'silver':
        case 'promotedsilver':
            return 'silver';
        case 'gold':
            return 'gold';
        case 'bishop':
        case 'horse':
            return 'bishop';
        case 'rook':
        case 'dragon':
            return 'rook';
        case 'king':
            return 'king';
        default:
            return '';
    }
}

function islegalDrop(x: number, y: number, piece: PieceName, pawnFiles: boolean[]): boolean {
    const arr = piece.split(" ");
    const color: Color = arr[0] as Color;
    const role = arr[1];
    if (role == 'pawn' && pawnFiles[x]) {
        return false;
    }
    if (role == 'lance' || role == 'pawn') {
        if (color == "sente" ? y == 0 : y == 8) {
            return false;
        }
    }
    if (role == 'knight') {
        if (color == "sente" ? y <= 1 : y >= 7) {
            return false;
        }
    }
    return true;
}

function translateSquareToKey(x: number, y: number): Key {
    const rank = String.fromCodePoint(97 + y);
    const file = (9 - x).toString();
    return (file + rank) as Key;
}