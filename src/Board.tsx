import { Shogiground } from 'shogiground';
import type { Config } from 'shogiground/config';
import type { Piece, Key } from "shogiground/types";
import './assets/css/base.css';
import './assets/css/shogiground.css';
import './assets/css/hands.css';
import './assets/css/themes/wood-grid.css';
import './assets/css/pieces/ryoko.css';
import {useEffect, useState} from "react";

function Board() {

    const [sg, setSg] = useState(Shogiground());

    const initBoard = () => {
        const config: Config = {
            sfen: {
                board: 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL',
            },
            orientation: 'sente',
            draggable: {
                enabled: true,
                deleteOnDropOff: false,
                addToHandOnDropOff: false,
            },
            selectable: {
                enabled: true,
                addSparesToHand: true,
            },
            drawable: {
                forced: false,
            },
            promotion: {
                promotesTo: (role: string) => {
                    if (role === 'bishop') return 'horse';
                    if (role === 'pawn') return 'tokin';
                    if (role === 'knight') return 'promotedKnight';
                    if (role === 'silver') return 'promotedSilver';
                    if (role === 'rook') return 'dragon';
                    if (role === 'lance') return 'promotedLance';
                },
            },
            events: {
                select: (s: Key) => {
                    console.log('SELECT', s, sg.state.selected);
                },
                move: (a: Key, b: Key) => {
                    console.log('MOVE', a, b);
                },
                pieceUnselect: (p: Piece) => {
                    console.log('pieceUnselect', p);
                },
                unselect: (s: Key) => {
                    console.log('unselect', s);
                },
            },
        };
        sg.set(config);
        sg.attach({
            board: document.getElementById('dirty')!,
        });
        sg.attach({
            hands: {
                bottom: document.getElementById('hand-bottom')!,
            },
        });
        sg.attach({
            hands: {
                top: document.getElementById('hand-top')!,
            },
        });
    }

    useEffect(() => {
        initBoard();
    }, []);


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

export default Board
