import {type Dispatch, type SetStateAction, useCallback, useContext, useEffect, useRef} from "react";
import {Shogiground} from 'shogiground';
import type {Key, Piece} from "shogiground/types";
import type {Drop, Game, Move} from "./types/types.ts";
import './assets/css/base.css';
import './assets/css/shogiground.css';
import './assets/css/hands.css';
import './assets/css/themes/wood-grid.css';
import './assets/css/pieces/ryoko.css';
import {ClientContext, PlayerContext} from "./Contexts.ts";
import type {IMessage, StompSubscription} from "@stomp/stompjs";
import {getDrops, getUnpromotedPieceRole} from "./boardLogic.ts";

function Board({game, setGame}: {game: Game | null, setGame: Dispatch<SetStateAction<Game | null>>}){
    const stompClientRef = useContext(ClientContext);
    const subscriptions = useRef<StompSubscription[]>([]);
    const player = useContext(PlayerContext);
    const madeMove = useRef<boolean>(false);
    const sg = useRef(Shogiground());

    const makeMove = useCallback((a: Key, b: Key, prom: boolean, capturedPiece?: Piece) => {
        if (capturedPiece) {
            const color = capturedPiece.color == 'gote' ? 'sente' : 'gote';
            const role: string = getUnpromotedPieceRole(capturedPiece.role);
            sg.current.addToHand({role: role, color: color})
        }
        if (sg.current.getHandsSfen() != '-') {
            const dests = getDrops(sg.current.state.pieces, sg.current.getHandsSfen(), player.current!);
            sg.current.set({ droppable: { dests: dests, } });
        }

        const stompClient = stompClientRef.current;
        if (stompClient && stompClient.connected) {
            if (sg.current.state.pieces.get(b)?.color == player.current) {
                madeMove.current = true;
                stompClient.publish({
                    destination: '/app/game/' + game?.gameId + '/move',
                    body: JSON.stringify({orig: a, dest: b, prom: prom, capturedPiece: capturedPiece}),
                });
            }
        } else {
            console.error('Stomp client is not connected');
        }
        sg.current.set( { turnColor: player.current, } );
    }, [game?.gameId, player, stompClientRef]);

    const makeDrop = useCallback((piece: Piece, key: Key) => {
        if (sg.current.getHandsSfen() != '-') {
            const dests = getDrops(sg.current.state.pieces, sg.current.getHandsSfen(), player.current!);
            sg.current.set({ droppable: { dests: dests, } });
        }

        const stompClient = stompClientRef.current;
        if (stompClient && stompClient.connected) {
            if (piece.color == player.current) {
                madeMove.current = true;
                stompClient.publish({
                    destination: '/app/game/' + game?.gameId + '/drop',
                    body: JSON.stringify({piece: piece, key: key}),
                });
            }
        } else {
            console.error('Stomp client is not connected');
        }
        sg.current.set( { turnColor: player.current, } );
    }, [game?.gameId, player, stompClientRef]);

    useEffect(() => {
        // initialize the page and board
        sg.current.attach({
            board: document.getElementById('dirty')!,
        });
        sg.current.attach({
            hands: { bottom: document.getElementById('hand-bottom')!, },
        });
        sg.current.attach({
            hands: { top: document.getElementById('hand-top')!, },
        });
        sg.current.set({
            movable: { free: false, },
            droppable: { free: false, },
            draggable: {
                enabled: true,
                deleteOnDropOff: false,
                addToHandOnDropOff: false,
            },
            selectable: {
                enabled: true,
                addSparesToHand: true,
            },
            drawable: { forced: false, },
            promotion: {
                promotesTo: (role: string) => {
                    if (role === 'bishop') return 'horse';
                    if (role === 'pawn') return 'tokin';
                    if (role === 'knight') return 'promotedknight';
                    if (role === 'silver') return 'promotedsilver';
                    if (role === 'rook') return 'dragon';
                    if (role === 'lance') return 'promotedlance';
                },
            },
        });
    }, []);

    useEffect(() => {
        if (!stompClientRef.current || !game) {
            return;
        }
        sg.current.set({
            sfen: {
                board: game?.sfen[0],
                hands: game?.sfen[1],
            },
            events: {
                move: makeMove,
                drop: makeDrop,
            },
            orientation: player.current,
            promotion: {
                movePromotionDialog: (orig: Key, dest: Key): boolean => {
                    if (player.current == 'sente') {
                        return orig[1] === 'a' || orig[1] === 'b' || orig[1] === 'c'
                            || dest[1] === 'a' || dest[1] === 'b' || dest[1] === 'c';
                    } else {
                        return orig[1] === 'g' || orig[1] === 'h' || orig[1] === 'i'
                            || dest[1] === 'g' || dest[1] === 'h' || dest[1] === 'i';
                    }
                },
            },
        });
        const stompClient = stompClientRef.current;
        subscriptions.current.push(stompClient.subscribe('/topic/game/' + game.gameId, (response: IMessage) => {
            const serverMessage = JSON.parse(response.body);
            setGame(serverMessage.body as Game);
            if (serverMessage.headers.winner) {
                let alertMessage = 'Game over';
                if (serverMessage.headers.method) {
                    if (serverMessage.headers.method[0] == 'disconnect') {
                        alertMessage += ', ' + serverMessage.headers.loser[0] + ' disconnected.';
                    } else if (serverMessage.headers.method[0] == 'normal') {
                        alertMessage += ', ' + serverMessage.headers.winner[0] + 'won!';
                    }
                }
                window.alert(alertMessage);
                sg.current.set({
                    movable: { dests: undefined, },
                    droppable: { dests: undefined, }
                })
            }
        }));
        subscriptions.current.push(stompClient.subscribe('/topic/game/' + game.gameId + '/move', (response: IMessage) => {
            const serverMessage = JSON.parse(response.body);
            if (madeMove.current) {
                madeMove.current =  false;
                return;
            }
            if (serverMessage.headers.moveType[0] == 'move') {
                const move: Move = serverMessage.body;
                sg.current.move(move.orig, move.dest, move.prom);
            } else if (serverMessage.headers.moveType[0] == 'drop') {
                const drop: Drop = serverMessage.body;
                sg.current.drop(drop.piece, drop.key, false, false);
            }
        }));
        subscriptions.current.push(stompClient.subscribe('/user/topic/game/'  + game.gameId + '/legalMoves', (response: IMessage) => {
            const moveMap = new Map<Key, Key[]>();
            Object.entries(JSON.parse(response.body).body).forEach(([key, value]) => {
                moveMap.set(key as Key, value as Key[]);
            })
            sg.current.set( { movable: { dests: moveMap, }} );
        }));
        if (game.status == 'FINISHED') {
            for (let i = 0; i < subscriptions.current.length; i++) {
                subscriptions.current[i].unsubscribe();
            }
        }
    }, [game, makeDrop, makeMove, player, setGame, stompClientRef]);

    return (
        <div className="wrap">
            <style>
                { `.wrap {display: flex;}` }
            </style>
            <div id="hand-top" className="sg-hand-wrap"></div>
            <div id="main-wrap" className="main-board">
                <div id="dirty" className="sg-wrap"></div>
            </div>
            <div id="hand-bottom" className="sg-hand-wrap"></div>
        </div>
    )
}

export default Board;
