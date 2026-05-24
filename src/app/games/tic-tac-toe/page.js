import Game from '../../../components/Game';
import styles from '../../../styles/Game.module.css';

export default function TicTacToePage() {
  // Keep the game route presentational; core game state/logic lives in <Game />.
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tic-Tac-Toe</h1>
      <Game />
    </div>
  );
}
