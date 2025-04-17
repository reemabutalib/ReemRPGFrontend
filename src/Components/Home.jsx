import { useNavigate } from 'react-router';
import './Home.css';
// @ts-ignore
import logo from "@/assets/images/ReemRPGlogo.png";

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
            <div className="container">
                <h1>Welcome to the Reem RPG Experience</h1>
            </div>
        </main>
    );
}