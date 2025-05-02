import logo from "@/assets/images/ReemRPGlogo.png";
import '@/styles/Navbar.css';
import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext"; // Import the useUser hook
import { handleLogout } from "./Auth/Logout"; // Import the handleLogout function

const Navbar = ({ showLogout }) => {
    const navigate = useNavigate();
    const { clearUserData } = useUser(); // Get clearUserData from context

    // Create a handler that uses both navigate and clearUserData
    const handleLogoutClick = () => {
        handleLogout(navigate, clearUserData);
    };

    return (
        <nav className="navbar">
            <div
                className="navbar-brand"
                onClick={() => navigate('/')}
            >
                <img
                    src={logo}
                    alt="Reem RPG Logo"
                    className="navbar-logo"
                />
            </div>
            <div className="navbar-links">
                <span onClick={() => navigate('/dashboard')} className="navbar-link">Dashboard</span>
                <span onClick={() => navigate('/characters')} className="navbar-link">Characters</span>
                <span onClick={() => navigate('/quests')} className="navbar-link">Quests</span>
                {showLogout && (
                    <button
                        className="logout-button"
                        onClick={handleLogoutClick} // Use the updated handler
                    >
                        Log Out
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;