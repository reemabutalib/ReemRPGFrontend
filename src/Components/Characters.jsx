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

    // Check if user is new
    useEffect(() => {
        const isNewUser = localStorage.getItem('newUser') === 'true';
        if (isNewUser) {
            setShowWelcomeMessage(true);
            localStorage.removeItem('newUser'); // Clear the flag after use
        }
    }, []);

    // Extract userId from token - used for storage and API calls
    const getUserIdFromToken = () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return null;

            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            return payload.nameid || payload.sub;
        } catch (err) {
            console.error('Error parsing token for userId:', err);
            return null;
        }
    };

    // Fetch characters
    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError('You must be logged in to view characters.');
                    setLoading(false);
                    return;
                }

                // Check for token validity before making request
                const userId = getUserIdFromToken();
                if (!userId) {
                    console.error("Invalid token - no user ID found");
                    setError("Your session has expired. Please login again.");
                    setLoading(false);
                    navigate('/login');
                    return;
                }

                const response = await axios.get('http://localhost:5233/api/character', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log("Characters loaded:", response.data);

                // Normalize character data to ensure consistent ID field
                const processedCharacters = response.data.map(char => {
                    // Use CharacterId as the primary ID field if it exists
                    const id = char.CharacterId || char.characterId ||
                        char.Id || char.id || char.ID;

                    // Create a consistent object structure
                    return {
                        ...char,
                        characterId: id, // Use consistent key for all code
                        id: id // Keep for backward compatibility
                    };
                });

                setCharacters(processedCharacters);
            } catch (err) {
                console.error('Error fetching characters:', err);

                // Handle specific error cases
                if (err.response) {
                    if (err.response.status === 401) {
                        setError('Your session has expired. Please login again.');
                        navigate('/login');
                    } else {
                        setError(`Error loading characters: ${err.response.data?.message || err.message}`);
                    }
                } else {
                    setError('Failed to load characters. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCharacters();
    }, [navigate]);

    const handleSelectCharacter = async (character) => {
        try {
            setLoading(true); // Show loading indicator

            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error("No auth token found");
                navigate('/login');
                return;
            }

            // Get userId for storage purposes
            const userId = getUserIdFromToken();
            if (!userId) {
                console.error("Could not extract user ID from token");
                setError("Authentication error. Please log in again.");
                navigate('/login');
                return;
            }

            // Get consistent character ID
            const characterId = character.characterId || character.CharacterId ||
                character.id || character.Id;

            if (!characterId) {
                console.error("No valid ID found in character object:", character);
                setError("Character has no valid ID. Please try again.");
                return;
            }

            console.log(`Selecting character: ${character.name} (ID: ${characterId})`);

            // Clear existing character data to prevent conflicts
            localStorage.removeItem('selectedCharacter');
            localStorage.removeItem(`selectedCharacter_${userId}`);

            try {
                // Call API to select character - use uppercase CharacterId for C# backend
                const response = await axios.post(
                    'http://localhost:5233/api/character/select-character',
                    { CharacterId: characterId },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log("Character selection API response:", response.data);

                // Create normalized character object with backend data
                let selectedCharacterData;

                // Use backend response if available (provides latest progression data)
                if (response.data && response.data.character) {
                    selectedCharacterData = {
                        ...response.data.character,
                        characterId: response.data.character.CharacterId ||
                            response.data.character.characterId ||
                            characterId
                    };
                } else {
                    // Fallback to normalized local data
                    selectedCharacterData = {
                        ...character,
                        characterId: characterId
                    };
                }

                // Update context state
                setSelectedCharacter(selectedCharacterData);

                // Store in localStorage with user-specific key for better security 
                localStorage.setItem(
                    `selectedCharacter_${userId}`,
                    JSON.stringify(selectedCharacterData)
                );

                // Also store in generic key for backward compatibility
                localStorage.setItem(
                    'selectedCharacter',
                    JSON.stringify(selectedCharacterData)
                );

                console.log("Character selection complete:", selectedCharacterData);
                navigate('/dashboard');

            } catch (apiError) {
                console.error("Error in character selection API call:", apiError);

                if (apiError.response) {
                    const statusCode = apiError.response.status;
                    const errorMessage = apiError.response.data?.message || apiError.message;

                    if (statusCode === 400) {
                        // Try again with lowercase characterId
                        try {
                            console.log("Retrying with lowercase characterId");
                            await axios.post( // Remove the variable declaration
                                'http://localhost:5233/api/character/select-character',
                                { characterId: characterId },
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    }
                                }
                            );

                            // If successful on retry, still use the character
                            const retryCharData = {
                                ...character,
                                characterId: characterId
                            };

                            setSelectedCharacter(retryCharData);
                            localStorage.setItem(`selectedCharacter_${userId}`, JSON.stringify(retryCharData));
                            localStorage.setItem('selectedCharacter', JSON.stringify(retryCharData));

                            console.log("Character selection successful on retry");
                            navigate('/dashboard');
                            return;
                        } catch (retryError) {
                            console.error("Retry also failed:", retryError);
                            setError(`Failed to select character: ${errorMessage}`);
                        }
                    } else if (statusCode === 401 || statusCode === 403) {
                        setError("Your session has expired. Please login again.");
                        navigate('/login');
                    } else {
                        setError(`Error selecting character: ${errorMessage}`);
                    }
                } else {
                    setError("Network error. Please check your connection and try again.");
                }
            }
        } catch (error) {
            console.error("Unexpected error in character selection:", error);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="characters-container loading">Loading characters...</div>;
    }

    if (error) {
        return (
            <div className="characters-container error">
                <p>{error}</p>
                <button onClick={() => navigate('/login')}>Back to Login</button>
            </div>
        );
    }

    return (
        <div className="characters-container">
            <h1>Your Characters</h1>

            {/* Welcome message for new users */}
            {showWelcomeMessage && (
                <div className="welcome-message">
                    <h2>Welcome to Reem RPG!</h2>
                    <p>Create your first character to begin your adventure in this exciting world.</p>
                    <button
                        className="dismiss-button"
                        onClick={() => setShowWelcomeMessage(false)}
                    >
                        Got it!
                    </button>
                </div>
            )}

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
                            key={character.characterId || character.id || Math.random()}
                            className="character-card"
                        >
                            <h2>{character.name}</h2>
                            <p>Class: {character.class || character.className}</p>
                            <p>Level: {character.level || 1}</p>
                            {character.experience !== undefined && (
                                <p>Experience: {character.experience}</p>
                            )}
                            {character.gold !== undefined && (
                                <p>Gold: {character.gold}</p>
                            )}
                            <button
                                onClick={() => handleSelectCharacter(character)}
                                className="select-button"
                            >
                                Select Character
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="character-actions">
                <button
                    onClick={() => navigate('/create-character')}
                    className="create-button"
                >
                    Create New Character
                </button>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="dashboard-button"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
}