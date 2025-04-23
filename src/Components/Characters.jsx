import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';
import './Characters.css';

console.log("=== CHARACTERS COMPONENT LOADED ===");
console.log("Local storage contents at load:", localStorage.getItem('selectedCharacter'));
console.log("Session storage contents at load:", sessionStorage.getItem('selectedCharacter'));

// Try to parse the character if it exists
const storedChar = localStorage.getItem('selectedCharacter');
if (storedChar) {
    try {
        const parsed = JSON.parse(storedChar);
        console.log("Parsed character at load:", parsed);
    } catch (e) {
        console.error("Failed to parse stored character:", e);
    }
}

export default function Characters() {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { setSelectedCharacter } = useUser();

    // Test if localStorage is working
    useEffect(() => {
        try {
            const testKey = "test-" + new Date().getTime();
            localStorage.setItem(testKey, "working");
            const result = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            console.log("localStorage test:", result === "working" ? "WORKING" : "FAILED");
        } catch (e) {
            console.error("localStorage test failed with error:", e);
        }
    }, []);

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

                // Debug to find the correct ID property
                if (response.data && response.data.length > 0) {
                    const firstChar = response.data[0];
                    console.log("First character structure:", JSON.stringify(firstChar, null, 2));
                    console.log("Available properties:", Object.keys(firstChar).join(", "));
                }

                // Ensure all characters have an id property
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

            // IMPORTANT: Clear existing storage first
            localStorage.removeItem('selectedCharacter');
            sessionStorage.removeItem('selectedCharacter');
            console.log("Cleared existing storage");

            // Create a normalized character object
            const characterToSave = {
                ...character,
                id: characterId,
                characterId: characterId
            };

            // Save to localStorage with explicit stringification
            const jsonString = JSON.stringify(characterToSave);
            console.log("Character JSON to save:", jsonString);

            // Try multiple storage methods for redundancy
            try {
                // Try localStorage first
                localStorage.setItem('selectedCharacter', jsonString);
                console.log("Saved to localStorage");

                // Also save to sessionStorage as backup
                sessionStorage.setItem('selectedCharacter', jsonString);
                console.log("Saved to sessionStorage");

                // Add timestamp for debugging
                localStorage.setItem('characterSelectedTime', new Date().toString());
                console.log("Saved selection timestamp");

                // Verify storage worked
                const storedValue = localStorage.getItem('selectedCharacter');
                console.log("Verification - localStorage contains:", storedValue ? "SUCCESS" : "FAILED");

                if (!storedValue) {
                    throw new Error("localStorage verification failed");
                }
            } catch (storageError) {
                console.error("Error saving to storage:", storageError);
                // Continue anyway - we can rely on context if storage fails
            }

            // Update context
            setSelectedCharacter(characterToSave);
            console.log("Character set in context");

            // API call with correct ID
            try {
                console.log("Sending selection to backend with payload:", { CharacterId: characterId });
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

                // Try alternative payload format if the first one failed
                if (apiError.response && apiError.response.status === 400) {
                    try {
                        console.log("Trying alternative payload format");
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
                        console.log("Alternative format succeeded");
                    } catch (altError) {
                        console.error("Alternative format also failed:", altError.message);
                    }
                }
            }

            // Final verification check
            const finalCheck = localStorage.getItem('selectedCharacter');
            const sessionCheck = sessionStorage.getItem('selectedCharacter');
            console.log("Final storage check:", {
                localStorage: finalCheck ? "PRESENT" : "MISSING",
                sessionStorage: sessionCheck ? "PRESENT" : "MISSING"
            });

            // Navigate to dashboard with a slight delay to ensure storage is completed
            console.log("Character selected successfully, navigating to dashboard");
            setTimeout(() => {
                navigate('/dashboard');
            }, 500);

        } catch (error) {
            console.error("Critical error selecting character:", error);
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
            <h1>Select Your Character</h1>

            {characters.length === 0 ? (
                <div className="no-characters">
                    <p>You don't have any characters yet.</p>
                    <button onClick={() => navigate('/create-character')}>Create a Character</button>
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