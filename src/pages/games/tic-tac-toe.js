import Navbar from "../../components/Navbar";
import Game from "../../components/Game";

export default function Home() {
  return (
    <>
        < Navbar />
        <div className="container">
            <h1>Tic-Tac-Toe</h1>
            <Game />
        </div>
    </>
  );
}
