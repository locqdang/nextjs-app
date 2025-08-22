import Square from "./Square";
import styles from "../styles/Game.module.css";

function Board({ xIsNext, squares, onPlay }) {
  const result = calculateWinner(squares);
  const winner = result ? result.winner : null;
  const winningLine = result ? result.winningLine : [];

  console.log(`result: ${result}`);

  function handleClick(i) {
    // if there is winner or the square at i is occupied, do nothing
    if (result || squares[i]) {
      return;
    }

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares);
  }

  let status = result
    ? "Winner: " + winner
    : "Next player: " + (xIsNext ? "X" : "O");

  return (
    <>
      <div className={styles.gameInfo}>{status}</div>
      <div className={styles.board}>
        {[0, 1, 2].map((row) => (
          <div key={row} className={styles.boardRow}>
            {[0, 1, 2].map((col) => {
              const index = row * 3 + col;
              return (
                <Square
                  key={index}
                  value={squares[index]}
                  onSquareClick={() => handleClick(index)}
                  highlight={winningLine.includes(index)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], // row 1
    [3, 4, 5], // row 2
    [6, 7, 8], // row3
    [0, 3, 6], // col 1
    [1, 4, 7], // col 2
    [2, 5, 8], // col 3
    [0, 4, 8], // diagonals
    [2, 4, 6], // diagonals
  ];

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], winningLine: [a, b, c] };
    }
  }
  return null; // no winner yet
}

export default Board;
