import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // On component mount, fetch the user's character from API
    useEffect(() => {
        const fetchUserCharacter = async () => {
            try {
                setLoading(true);
                setError(null); // Reset any previous errors

                const token = localStorage.getItem('authToken');

                if (!token) {
                    console.log("No auth token found, redirecting to login");
                    navigate('/login');
                    return;
                }

                // Get the user's selected character directly from the API
                const response = await axios.get('http://localhost:5233/api/character/selected', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // If the user has a selected character, use it
                if (response.data && response.data.characterId) {
                    console.log("Found user's character:", response.data.name);
                    setCharacter(response.data);
                } else {
                    // User doesn't have a character, redirect to selection
                    console.log("No character found for this user");
                    navigate('/characters');
                }
            } catch (err) {
                console.error("Error fetching character:", err);

                // If 401 unauthorized, token is invalid
                if (err.response && err.response.status === 401) {
                    console.log("Authentication failed, redirecting to login");
                    navigate('/login');
                    return;
                }

                // Only show error for network issues or unexpected errors
                // Don't show errors for expected situations like missing character
                if (!err.response || (err.response.status !== 404 && err.response.status !== 400)) {
                    setError("Unable to load your character. Please try again later.");
                } else {
                    // For 404 or bad request, just redirect to character selection
                    console.log("Error or no character found, redirecting to character selection");
                    navigate('/characters');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserCharacter();
    }, [navigate]);

    if (loading) {
        return (
            <div className="dashboard-container loading">
                <div className="loading-spinner">Loading your adventure...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container error">
                <h2>Something went wrong</h2>
                <p>{error}</p>
                <div className="error-actions">
                    <button
                        onClick={() => window.location.reload()}
                        className="primary-button"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => navigate('/characters')}
                        className="secondary-button"
                    >
                        Select Character
                    </button>
                </div>
            </div>
        );
    }

    // If no character by this point, the useEffect will have redirected
    if (!character) {
        return null;
    }

    return (
        <div className="dashboard-container">
            <h1>{character.name}'s Dashboard</h1>

            {/* Rest of your dashboard remains the same */}
            <div className="character-banner">
                <div className="character-avatar">
                    {character.imageUrl ? (
                        <img src={character.imageUrl} alt={character.name} />
                    ) : (
                        <div className="avatar-placeholder">{character.name.charAt(0)}</div>
                    )}
                </div>

                <div className="character-stats">
                    <div className="stat">
                        <span className="stat-label">Class:</span>
                        <span className="stat-value">{character.class}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Level:</span>
                        <span className="stat-value">{character.level || 1}</span>
                    </div>
                    {character.experience !== undefined && (
                        <div className="stat">
                            <span className="stat-label">Experience:</span>
                            <span className="stat-value">{character.experience}</span>
                        </div>
                    )}
                    {character.gold !== undefined && (
                        <div className="stat">
                            <span className="stat-label">Gold:</span>
                            <span className="stat-value">{character.gold}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="action-cards">
                <div className="card">
                    <h3>Quests</h3>
                    <p>Embark on adventures to gain experience and gold.</p>
                    <button
                        onClick={() => navigate('/quests')}
                        className="card-action"
                    >
                        View Quests
                    </button>
                </div>

                <div className="card">
                    <h3>Character</h3>
                    <p>View or change your character.</p>
                    <button
                        onClick={() => navigate('/characters')}
                        className="card-action"
                    >
                        Change Character
                    </button>
                </div>
            </div>
        </div>
    );
}