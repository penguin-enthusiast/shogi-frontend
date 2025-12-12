import {useCallback, useContext} from "react";
import {BoardMovesContext} from "./Contexts.ts";
import './assets/css/info-panel.css';

function InfoPanel() {
    const boardMoves = useContext(BoardMovesContext);

    const tableRows = useCallback(() => {
        return (
            <div>
                <table className="table-header">
                    <thead>
                    <tr>
                        <th className="index-col"></th>
                        <th className="side-col"></th>
                        <th className="move-col">Move</th>
                        <th className="time-col">Time</th>
                    </tr>
                    </thead>
                </table>
                <div className="move-table">
                    <table>
                        <tbody>
                        {boardMoves.map((move, index) => {
                            const i: number = move.lastIndexOf('-');
                            return (
                                <tr>
                                    <td className="index-col">{ index + 1 }</td>
                                    <td className="side-col">{ move[0] }</td>
                                    <td className="move-col">{ move.substring(1, i) }</td>
                                    <td className="time-col">{ move.substring(i + 1) }</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }, [boardMoves]);

    return tableRows();
}

export default InfoPanel;