import React from "react";
import { useNavigate } from "react-router-dom";
import './Logout.css';

// Export the handleLogout function so it can be used elsewhere
export const handleLogout = (navigate) => {
    // Only clear the authentication token, NOT the selected character
    localStorage.removeItem("authToken");

    // DON'T remove the selected character
    // localStorage.removeItem("selectedCharacter");

    // Redirect to the login page
    navigate("/login");
};

const Logout = () => {
    const navigate = useNavigate();

    // Use the exported function but pass the navigate function from this component
    const handleLogoutClick = () => {
        handleLogout(navigate);
    };

    return (
        <button className="logout-button" onClick={handleLogoutClick}>
            Log Out
        </button>
    );
};

export default Logout;