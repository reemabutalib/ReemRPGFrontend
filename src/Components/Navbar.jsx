import logo from "@/assets/images/ReemRPGlogo.png";
import React from "react";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "./Auth/Logout"; // Import the handleLogout function
import './Navbar.css';

const Navbar = ({ showLogout }) => {
    const navigate = useNavigate();

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
                {showLogout && (
                    <button className="logout-button" onClick={() => handleLogout(navigate)}>
                        Log Out
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;