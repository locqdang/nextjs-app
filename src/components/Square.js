// using global styling className="square"
// using module styling for highligh
import styles from '../styles/Game.module.css';

function Square({ value, onSquareClick, highlight }) {
  return (
    <button
      className={`${styles.square} ${highlight ? styles.highlight : ''}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

export default Square;
