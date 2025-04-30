import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';
import './Characters.css';

export default function Characters() {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
    const navigate = useNavigate();
    const { setSelectedCharacter } = useUser();

    // Check if user is new (unchanged)
    useEffect(() => {
        const isNewUser = localStorage.getItem('newUser') === 'true';
        if (isNewUser) {
            setShowWelcomeMessage(true);
            localStorage.removeItem('newUser'); // Clear the flag after use
        }
    }, []);

    // Fetch characters - UPDATED to use UserCharacterController
    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError('You must be logged in to view characters.');
                    setLoading(false);
                    return;
                }

                // Using the new UserCharacterController endpoint
                const response = await axios.get('http://localhost:5233/api/usercharacter', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Standardize the character objects
                const processedCharacters = response.data.map(char => ({
                    characterId: char.characterId,
                    name: char.characterName || char.name,
                    class: char.class_,
                    level: char.level || 1,
                    experience: char.experience || 0,
                    gold: char.gold || 0,
                    isSelected: char.isSelected || false
                }));

                setCharacters(processedCharacters);

                // Check if there's a selected character and pre-select it in the UI
                const selectedChar = processedCharacters.find(char => char.isSelected);
                if (selectedChar) {
                    setSelectedCharacter(selectedChar);
                }
            } catch (err) {
                console.error('Error fetching characters:', err);

                if (err.response && err.response.status === 401) {
                    setError('Your session has expired. Please login again.');
                    navigate('/login');
                } else {
                    setError('Failed to load characters. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCharacters();
    }, [navigate, setSelectedCharacter]);

    // Updated to use UserCharacterController
    const handleSelectCharacter = async (character) => {
        try {
            setLoading(true);
            console.log("Selecting character:", character);

            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login');
                return;
            }

            const characterId = character.characterId;
            console.log(`Selecting character ID: ${characterId}`);

            try {
                // Using the new UserCharacterController endpoint
                const response = await axios.post(
                    'http://localhost:5233/api/usercharacter/select',
                    { characterId: characterId },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log("Selection response:", response.data);

                // After successful selection, fetch the selected character details
                // to ensure we have the most up-to-date data
                const selectedResponse = await axios.get(
                    'http://localhost:5233/api/usercharacter/selected',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                console.log("Selected character details:", selectedResponse.data);

                // Format the character properly and store in context
                const selectedCharacter = {
                    characterId: selectedResponse.data.characterId,
                    name: selectedResponse.data.name,
                    class: selectedResponse.data.class_,
                    level: selectedResponse.data.level,
                    experience: selectedResponse.data.experience,
                    gold: selectedResponse.data.gold,
                    imageUrl: selectedResponse.data.imageUrl
                };

                setSelectedCharacter(selectedCharacter);
                navigate('/dashboard');
            } catch (err) {
                console.error("Character selection failed:", err);

                // Show a more specific error message if possible
                if (err.response) {
                    const errorMsg = err.response.data?.message || "Selection failed.";
                    setError(`Error: ${errorMsg}`);
                } else {
                    setError("Could not select character. Please try again.");
                }
            }
        } catch (err) {
            console.error("Error selecting character:", err);
            setError("Could not select character. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Show loading state if fetching characters
    if (loading && characters.length === 0) {
        return (
            <div className="characters-container loading">
                <h1>Your Characters</h1>
                <div className="loading-spinner">
                    Loading characters...
                </div>
            </div>
        );
    }

    // Show error message if there's an error
    if (error) {
        return (
            <div className="characters-container error">
                <h1>Your Characters</h1>
                <div className="error-message">
                    <p>{error}</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="back-button"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="characters-container">
            <h1>Your Characters</h1>

            {/* Welcome message (unchanged) */}
            {showWelcomeMessage && (
                <div className="welcome-message">
                    <h2>Welcome to Reem RPG!</h2>
                    <p>Create your first character to begin your adventure.</p>
                    <button
                        className="dismiss-button"
                        onClick={() => setShowWelcomeMessage(false)}
                    >
                        Got it!
                    </button>
                </div>
            )}

            {/* Loading overlay (unchanged) */}
            {loading && characters.length > 0 && (
                <div className="overlay-loading">
                    <div className="loading-spinner">Processing...</div>
                </div>
            )}

            {/* Empty state (unchanged) */}
            {characters.length === 0 ? (
                <div className="no-characters">
                    <p>You don't have any characters yet.</p>
                    <button
                        onClick={() => navigate('/create-character')}
                        className="create-character-btn"
                    >
                        Create Your First Character
                    </button>
                </div>
            ) : (
                <div className="character-list">
                    {characters.map(character => (
                        <div
                            key={character.characterId}
                            className={`character-card ${character.isSelected ? 'selected' : ''}`}
                        >
                            {character.isSelected && <div className="selected-badge">Selected</div>}
                            <h2>{character.name}</h2>
                            <p>Class: {character.class}</p>
                            <p>Level: {character.level || 1}</p>
                            <p>Experience: {character.experience}</p>
                            <p>Gold: {character.gold}</p>
                            <button
                                onClick={() => handleSelectCharacter(character)}
                                className="select-button"
                                disabled={loading || character.isSelected}
                            >
                                {loading ? 'Selecting...' :
                                    character.isSelected ? 'Current Character' : 'Select Character'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="character-actions">
                <button
                    onClick={() => navigate('/create-character')}
                    className="create-button"
                    disabled={loading}
                >
                    Create New Character
                </button>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="dashboard-button"
                    disabled={loading}
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
}