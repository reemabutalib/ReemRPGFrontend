import { useNavigate } from 'react-router';
import './Home.css';
// @ts-ignore
import logo from "@/assets/images/ReemRPGlogo.png";
import home_header from "@/assets/images/home_header.jpg";

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
                <div className="header-links">
                    <span
                        onClick={() => navigate('/login')}
                        className="header-link"
                    >
                        Log In
                    </span>
                    <span
                        onClick={() => navigate('/register')}
                        className="header-link"
                    >
                        Sign Up
                    </span>
                </div>
            </header>
            {/* Add the header image */}
            <img
                src={home_header}
                alt="Header"
                className="header-image"
            />
            <section className="welcome-section">
                <h1>Welcome to the Reem RPG Experience</h1>
                <p>Embark on an epic journey, create your character, and explore a world full of quests and adventures.</p>
            </section>
        </main>
    );
}