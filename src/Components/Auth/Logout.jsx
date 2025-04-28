import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/userContext";
import { clearAuthData } from "../Utils/AuthUtils";
import './Logout.css';

// Export the handleLogout function so it can be used elsewhere
export const handleLogout = (navigate, clearUserData = null) => {
    // Get the token before removing it, to extract user ID
    const token = localStorage.getItem("authToken");

    // Extract userId from token if possible, to clean up user-specific data
    if (token) {
        try {
            // Extract userId from JWT token
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));

            // Try different claim types for maximum compatibility
            const userId = payload.nameid ||
                payload.sub ||
                payload.userId ||
                payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

            if (userId) {
                console.log(`Cleaning up storage for user ${userId} during logout`);

                // Remove user-specific character data
                localStorage.removeItem(`selectedCharacter_${userId}`);

                // Clear any other user-specific data
                // This loop finds and removes ALL items starting with userId
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.includes(userId)) {
                        console.log(`Removing user-specific data: ${key}`);
                        localStorage.removeItem(key);
                        // Adjust index since we removed an item
                        i--;
                    }
                }
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

    // Clear ALL auth-related data using the helper function
    clearAuthData();

    // Also remove the legacy key for backward compatibility
    localStorage.removeItem("selectedCharacter");

    // Find and remove any remaining character data (for complete cleanup)
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
            key.startsWith('selectedCharacter') ||
            key.includes('Character') ||
            key === 'authToken' ||
            key === 'userEmail' ||
            key === 'tempAuthPassword'
        )) {
            keysToRemove.push(key);
        }
    }

    // Remove all identified keys
    keysToRemove.forEach(key => {
        console.log(`Removing remaining auth data: ${key}`);
        localStorage.removeItem(key);
    });

    // Log all remaining character keys after logout for debugging
    console.log("Checking for remaining character data after logout:");
    let remainingData = false;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('selectedCharacter') || key.includes('Character'))) {
            console.log(`WARNING: ${key} still exists after logout`);
            remainingData = true;
        }
    }

    if (!remainingData) {
        console.log("✓ All character data successfully cleared");
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