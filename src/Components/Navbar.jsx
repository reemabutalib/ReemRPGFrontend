import logo from "@/assets/images/ReemRPGlogo.png";
import { useUser } from "@/context/userContext";
import '@/styles/Navbar.css';
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { handleLogout } from "../pages/Auth/Logout";

const Navbar = ({ showLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearUserData, isAdmin } = useUser(); // Get clearUserData and isAdmin from context
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check if user is logged in
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        setIsLoggedIn(!!token);
    }, [location]); // Re-check when location changes

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
                {isLoggedIn ? (
                    // Links for logged-in users
                    <>
                        <span onClick={() => navigate('/dashboard')} className="navbar-link">Dashboard</span>
                        <span onClick={() => navigate('/characters')} className="navbar-link">Characters</span>
                        <span onClick={() => navigate('/quests')} className="navbar-link">Quests</span>
                        {isAdmin && (
                            <span onClick={() => navigate('/admin')} className="navbar-link admin-link">Admin</span>
                        )}
                        {showLogout && (
                            <button
                                className="logout-button"
                                onClick={handleLogoutClick}
                            >
                                Log Out
                            </button>
                        )}
                    </>
                ) : (
                    // Links for guests
                    <>
                        <span onClick={() => navigate('/register')} className="navbar-link">Sign Up</span>
                        <span onClick={() => navigate('/login')} className="navbar-link">Log In</span>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;