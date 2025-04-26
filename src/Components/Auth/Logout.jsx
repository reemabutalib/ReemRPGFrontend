import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/userContext";
import './Logout.css';

// Export the handleLogout function so it can be used elsewhere
export const handleLogout = (navigate, clearUserData = null) => {
    // Get the token before removing it, to extract user ID
    const token = localStorage.getItem("authToken");

    // Clear auth token
    localStorage.removeItem("authToken");

    // Extract userId from token if possible, to clean up user-specific data
    if (token) {
        try {
            // Extract userId from JWT token
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            const userId = payload.nameid || payload.sub;

            if (userId) {
                console.log(`Cleaning up storage for user ${userId} during logout`);

                // Remove user-specific character data
                localStorage.removeItem(`selectedCharacter_${userId}`);

                // You might have other user-specific data to clean up
                // Add more cleanup here as needed
            }
        } catch (err) {
            console.error("Error extracting user ID during logout:", err);
        }
    }

    // Use the context's clearUserData function if provided
    if (typeof clearUserData === 'function') {
        console.log("Using context's clearUserData function");
        clearUserData();
    }

    // Also remove the legacy key for backward compatibility
    localStorage.removeItem("selectedCharacter");

    // Log all remaining character keys after logout
    console.log("Checking for remaining character data after logout:");
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('selectedCharacter')) {
            console.log(`WARNING: ${key} still exists after logout`);
        }
    }

    // Redirect to the login page
    navigate("/login");
};

const Logout = () => {
    const navigate = useNavigate();
    const { clearUserData } = useUser();

    // Use the exported function but pass the navigate function from this component
    const handleLogoutClick = () => {
        handleLogout(navigate, clearUserData);
    };

    return (
        <button className="logout-button" onClick={handleLogoutClick}>
            Log Out
        </button>
    );
};

export default Logout;