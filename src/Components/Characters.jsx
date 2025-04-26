import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';
import './Characters.css';

console.log("=== CHARACTERS COMPONENT LOADED ===");

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

                const response = await axios.get('http://localhost:5233/api/character', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log("Characters loaded:", response.data);

                // Process characters to ensure consistent ID field
                const processedCharacters = response.data.map(char => {
                    // Find the character ID regardless of property name
                    let id = char.id || char.Id || char.ID ||
                        char.characterId || char.CharacterId ||
                        char.characterID;

                    return { ...char, id: id };
                });

                setCharacters(processedCharacters);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching characters:', err);
                setError('Failed to load characters. Please try again later.');
                setLoading(false);
            }
        };

        fetchCharacters();
    }, []);

    const handleSelectCharacter = async (character) => {
        try {
            console.log("Selecting character:", character);

            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error("No auth token found");
                navigate('/login');
                return;
            }

            // Get user ID from token for user-specific storage
            const getUserIdFromToken = () => {
                try {
                    // Extract userId from JWT token (simple parsing, not full validation)
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const payload = JSON.parse(window.atob(base64));
                    const id = payload.nameid || payload.sub;

                    console.log('Extracted userId from token for character selection:', id);
                    return id;
                } catch (err) {
                    console.error('Error parsing token for userId:', err);
                    return null;
                }
            };

            const userId = getUserIdFromToken();
            if (!userId) {
                console.error("Could not extract user ID from token");
                setError("Authentication error. Please log in again.");
                navigate('/login');
                return;
            }

            // Find the character ID regardless of property name
            let characterId = character.id || character.Id || character.ID ||
                character.characterId || character.CharacterId ||
                character.characterID;

            if (!characterId) {
                console.error("No valid ID found in character object");
                setError("Character has no valid ID. Please try again.");
                return;
            }

            console.log("Using character ID:", characterId);

            // Clear existing storage first - both user-specific and legacy keys
            localStorage.removeItem('selectedCharacter');
            if (userId) {
                localStorage.removeItem(`selectedCharacter_${userId}`);
            }

            // Create a normalized character object
            const characterToSave = {
                ...character,
                id: characterId,
                characterId: characterId
            };

            // Save to user-specific localStorage
            if (userId) {
                const userCharacterKey = `selectedCharacter_${userId}`;
                localStorage.setItem(userCharacterKey, JSON.stringify(characterToSave));
                console.log(`Saved character to user-specific storage: ${userCharacterKey}`);
            }

            // Also save to legacy key for backward compatibility
            localStorage.setItem('selectedCharacter', JSON.stringify(characterToSave));

            // Update context (which may also handle user-specific storage)
            setSelectedCharacter(characterToSave);

            console.log("Character selection complete:", {
                character: characterToSave,
                userId: userId
            });

            // Debug check all stored characters
            console.log("=== CHECKING ALL CHARACTER STORAGE AFTER SELECTION ===");
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('selectedCharacter')) {
                    try {
                        const value = localStorage.getItem(key);
                        const parsedChar = JSON.parse(value);
                        console.log(`${key}:`, parsedChar.name, `(ID: ${parsedChar.characterId || parsedChar.id})`);
                    } catch (err) {
                        console.log(`${key}: [parse error - ${err.message}]`);
                    }
                }
            }
            console.log("====================================");

            // API call with correct ID
            try {
                await axios.post(
                    'http://localhost:5233/api/character/select-character',
                    { CharacterId: characterId },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log("Server updated with character selection");
            } catch (apiError) {
                console.error("API error during character selection:", apiError);
                // Try alternative payload format if needed
                if (apiError.response && apiError.response.status === 400) {
                    try {
                        await axios.post(
                            'http://localhost:5233/api/character/select-character',
                            { characterId: characterId },
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                    } catch (altError) {
                        console.error("Alternative format also failed:", altError.message);
                    }
                }
            }

            // Navigate to dashboard
            navigate('/dashboard');
        } catch (error) {
            console.error("Error selecting character:", error);
            setError("Failed to select character. Please try again.");
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
                        <div key={character.id || Math.random()} className="character-card">
                            <h2>{character.name}</h2>
                            <p>Class: {character.class || character.className}</p>
                            <p>Level: {character.level}</p>
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
                <button onClick={() => navigate('/dashboard')} className="dashboard-button">
                    Go to Dashboard
                </button>
                <button onClick={() => navigate('/login')} className="back-button">
                    Back to Login
                </button>
            </div>
        </div>
    );
}