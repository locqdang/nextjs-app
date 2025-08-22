import { useState } from "react";
import Board from "./Board";
import styles from "../styles/Game.module.css";

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const currentSquares = history[currentMove];
  const xIsNext = currentMove % 2 === 0;

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  return (
    <div className={styles.game}>
      <div>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className={styles.gameInfo}>
        {" "}
        <ol>
          {history.map((_, move) => (
            <li className={styles.history} key={move}>
              <button onClick={() => jumpTo(move)}>
                {move ? `Go to move #${move}` : "Go to start"}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
