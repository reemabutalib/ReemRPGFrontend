import logo from "@/assets/images/ReemRPGlogo.png";
import { useNavigate } from 'react-router';
import './Home.css';

export default function Home() {
    const navigate = useNavigate();
    return (
        <main className="home">
            <header className="home-header">
                <img
                    src={logo}
                    alt="Reem RPG Logo"
                    className="home-logo"
                    onClick={() => navigate('/')} // Navigate to the home page when clicked
                />
            </header>
            <div className="container">
                <h1>Reem RPG</h1>
                <p>
                    Welcome to Reem RPG, a game where you can create your own character and embark on an epic adventure!
                    Choose your class, customize your appearance, and set out to explore a vast world filled with quests, monsters, and treasures.
                </p>
                <button
                    onClick={() => {
                        navigate('/login');
                    }}>
                    Log In
                </button>
                <button
                    onClick={() => {
                        navigate('/register');
                    }}
                >
                    Sign Up
                </button>
            </div>
        </main>
    );
}