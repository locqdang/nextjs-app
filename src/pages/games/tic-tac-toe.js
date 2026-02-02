import Navbar from "../../components/Navbar";
import Game from "../../components/Game";
import { fetchNavbar } from "../../lib/navbar";

export default function Home(props) {
  return (
    <>
        <div className="container">
            <h1>Tic-Tac-Toe</h1>
            <Game />
        </div>
    </>
  );
}

export async function getServerSideProps(){
  const navbarJson = await fetchNavbar();
  const navbar = navbarJson?.data;
  return {props: {navbar}};
}
