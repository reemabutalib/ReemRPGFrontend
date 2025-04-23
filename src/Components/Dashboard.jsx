import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useUser } from "../context/userContext";
import './Dashboard.css';

export default function Dashboard() {
    const { selectedCharacter, setSelectedCharacter } = useUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Import handleLogout from Logout component to ensure consistent logout behavior
    const handleLogout = () => {
        console.log("Logging out from Dashboard");
        // Clear user-related data from localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('selectedCharacter');

        // Redirect to login page
        navigate('/login');
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('authToken');
            console.log("Dashboard - Auth token exists:", !!token);

            if (!token) {
                console.log("No auth token found, redirecting to login");
                navigate('/login');
                return;
            }

            try {
                // First check if we have a character in local storage
                const storedCharacter = localStorage.getItem('selectedCharacter');
                console.log("Dashboard - Stored character:", storedCharacter ? "Found" : "Not found");

                if (storedCharacter) {
                    console.log("Using character from localStorage");
                    setSelectedCharacter(JSON.parse(storedCharacter));
                    setLoading(false);
                } else {
                    // If no character in localStorage, try to fetch from backend
                    console.log("No character in localStorage, fetching from backend");
                    const response = await axios.get('http://localhost:5233/api/character/select-character', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    console.log("Character API response:", response.data);

                    if (response.data && response.data.id) {
                        // Save the character both in context and localStorage
                        setSelectedCharacter(response.data);
                        localStorage.setItem('selectedCharacter', JSON.stringify(response.data));
                        console.log("Character saved from API");
                    } else {
                        console.log("No character selected on server, redirecting");
                        navigate('/characters');
                    }
                }
                setLoading(false);
            } catch (err) {
                console.error("Error checking character:", err);
                setError("Failed to load character data");
                setLoading(false);

                // If API call fails, check if we should redirect
                if (err.response && err.response.status === 401) {
                    console.log("Unauthorized, redirecting to login");
                    localStorage.removeItem('authToken');
                    navigate('/login');
                } else {
                    // For other errors, redirect to character selection
                    console.log("Error getting character, redirecting to character selection");
                    navigate('/characters');
                }
            }
        };

        checkAuth();
    }, [navigate, setSelectedCharacter]);

    // Show loading state while checking
    if (loading) {
        return <div className="dashboard loading">Loading dashboard...</div>;
    }

    // Show error if something went wrong
    if (error) {
        return <div className="dashboard error">{error}</div>;
    }

    // Once loaded, render the dashboard with character
    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <button className="logout-button" onClick={handleLogout}>
                    Log Out
                </button>
            </div>
            <h1>Dashboard</h1>
            {selectedCharacter ? (
                <div className="character-info">
                    <h2>Welcome, {selectedCharacter.name}!</h2>
                    <p>Class: {selectedCharacter.class}</p>
                    <button onClick={() => navigate('/quests')}>Start a Quest</button>
                    <button onClick={() => navigate('/characters')}>Change Character</button>
                </div>
            ) : (
                <div className="no-character">
                    <p>No character selected.</p>
                    <button onClick={() => navigate('/characters')}>Select a Character</button>
                </div>
            )}
        </div>
    );
}