import '@/styles/Dashboard.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext'; // Make sure to import this

export default function Dashboard() {
    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { selectedCharacter, setSelectedCharacter } = useUser();

    // On component mount, fetch the user's character from API
    useEffect(() => {
        const fetchUserCharacter = async () => {
            try {
                // If we already have a character in context, use it
                if (selectedCharacter && selectedCharacter.characterId) {
                    setCharacter(selectedCharacter);
                    setLoading(false);
                    return;
                }

                const token = localStorage.getItem('authToken');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // Get the user's selected character from the API
                const response = await axios.get('http://localhost:5233/api/usercharacter/selected', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Process character data
                if (response.data && response.data.characterId) {
                    const characterData = {
                        characterId: response.data.characterId,
                        name: response.data.name,
                        class: response.data.class_,  // Note the underscore in API response
                        level: response.data.level,
                        experience: response.data.experience,
                        gold: response.data.gold,
                        imageUrl: response.data.imageUrl
                    };

                    setCharacter(characterData);
                    setSelectedCharacter(characterData);
                } else {
                    // User doesn't have a character, redirect to selection
                    navigate('/characters');
                }
            } catch (err) {
                // Handle 401 Unauthorized
                if (err.response?.status === 401) {
                    navigate('/login');
                    return;
                }

                // Handle 404 Not Found - no character selected
                if (err.response?.status === 404) {
                    navigate('/characters');
                    return;
                }

                // For other errors
                setError("Unable to load your character. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserCharacter();
    }, [navigate, selectedCharacter, setSelectedCharacter]);

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
                    <button onClick={() => window.location.reload()} className="primary-button">
                        Try Again
                    </button>
                    <button onClick={() => navigate('/characters')} className="secondary-button">
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
                    <div className="stat">
                        <span className="stat-label">Experience:</span>
                        <span className="stat-value">{character.experience}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Gold:</span>
                        <span className="stat-value">{character.gold}</span>
                    </div>
                </div>
            </div>

            <div className="action-cards">
                <div className="card">
                    <h3>Quests</h3>
                    <p>Embark on adventures to gain experience and gold.</p>
                    <button onClick={() => navigate('/quests')} className="card-action">
                        View Quests
                    </button>
                </div>

                <div className="card">
                    <h3>Character</h3>
                    <p>View or change your character.</p>
                    <button onClick={() => navigate('/characters')} className="card-action">
                        Change Character
                    </button>
                </div>
            </div>
        </div>
    );
}