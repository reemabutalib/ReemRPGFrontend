import '@/styles/Logout.css';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthData } from "../../components/Utils/AuthUtils";
import { useUser } from "../../context/userContext";

// Export the handleLogout function so it can be used elsewhere
export const handleLogout = (navigate, clearUserData = null) => {
    // Get the token before removing it
    const token = localStorage.getItem("authToken");

    // Extract userId from token if possible
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
                // Remove user-specific character data
                localStorage.removeItem(`selectedCharacter_${userId}`);

                // Clear any other user-specific data
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.includes(userId)) {
                        localStorage.removeItem(key);
                        // Adjust index since we removed an item
                        i--;
                    }
                }
            }
        } catch (err) {
            console.error('Error parsing token:', err);
            // Silently handle token parsing errors
        }
    }

    // Use the context's clearUserData function if provided
    if (typeof clearUserData === 'function') {
        clearUserData();
    }

    // Clear ALL auth-related data using the helper function
    clearAuthData();

    // Also remove the legacy key for backward compatibility
    localStorage.removeItem("selectedCharacter");

    // Find and remove any remaining character data
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
    keysToRemove.forEach(key => localStorage.removeItem(key));

    navigate('/');

};

const Logout = () => {
    const navigate = useNavigate();
    const { clearUserData } = useUser();
    const [showConfirm, setShowConfirm] = useState(false);

    // Add confirmation step
    const handleLogoutClick = () => {
        setShowConfirm(true);
    };

    const confirmLogout = () => {
        handleLogout(navigate, clearUserData);
    };

    const cancelLogout = () => {
        setShowConfirm(false);
    };

    // If showing confirmation dialog
    if (showConfirm) {
        return (
            <div className="logout-confirm-container">
                <div className="logout-confirm">
                    <p>Are you sure you want to log out?</p>
                    <p className="small-text">Your game progress is saved automatically.</p>
                    <div className="logout-buttons">
                        <button className="cancel-button" onClick={cancelLogout}>
                            Cancel
                        </button>
                        <button className="confirm-button" onClick={confirmLogout}>
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <button className="logout-button" onClick={handleLogoutClick}>
            Log Out
        </button>
    );
};

export default Logout;