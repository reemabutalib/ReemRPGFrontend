import '@/styles/AddCharacter.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';

export function AddCharacter() {
    const [baseCharacters, setBaseCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();
    const { setSelectedCharacter } = useUser();

    // Fetch available base characters from the backend
    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setError('You must be logged in to view characters.');
                    setLoading(false);
                    return;
                }

                // Fetch available base characters from Characters controller
                const response = await axios.get('http://localhost:5233/api/character', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log("Raw character data:", response.data);

                setBaseCharacters(response.data);
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    setError('Your session has expired. Please login again.');
                    navigate('/login');
                } else {
                    setError('Failed to load available characters. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCharacters();
    }, [navigate]);

    // Handle adding a character to the user's collection
    const handleAddCharacter = async (characterId) => {
        try {
            setAdding(true);
            setSuccess(null);
            setError(null);

            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login');
                return;
            }

            // Add character to user's collection using UserCharacterController
            const response = await axios.post(
                'http://localhost:5233/api/usercharacter/create',
                { characterId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Show success message
            setSuccess(`Character added successfully!`);

            // Optionally set as selected character immediately
            if (response.data && response.data.characterId) {
                // Format the character data from API response
                const characterData = {
                    characterId: response.data.characterId,
                    name: response.data.name,
                    class: response.data.class_,
                    level: response.data.level || 1,
                    experience: response.data.experience || 0,
                    gold: response.data.gold || 0,
                    imageUrl: response.data.imageUrl || ''
                };

                setSelectedCharacter(characterData);

                // Auto-redirect to characters page after short delay
                setTimeout(() => {
                    navigate('/characters');
                }, 1500);
            }
        } catch (err) {
            let errorMessage = "Failed to add character";

            if (err.response) {
                // Check for specific error responses
                if (err.response.status === 409) {
                    errorMessage = "You already have this character";
                } else if (err.response.data?.message) {
                    errorMessage = err.response.data.message;
                }

                if (err.response.status === 401) {
                    localStorage.removeItem('authToken');
                    navigate('/login');
                    return;
                }
            }

            setError(errorMessage);
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="add-character-container loading">
                <h1>Available Characters</h1>
                <div className="loading-spinner">
                    Loading characters...
                </div>
            </div>
        );
    }

    if (error && !success) {
        return (
            <div className="add-character-container error">
                <h1>Available Characters</h1>
                <div className="error-message">
                    <p>{error}</p>
                    <button
                        onClick={() => navigate('/characters')}
                        className="back-button"
                    >
                        Back to My Characters
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="add-character-container">
            <h1>Add a Character</h1>

            {success && (
                <div className="success-message">
                    <p>{success}</p>
                </div>
            )}

            {error && success && (
                <div className="error-message small">
                    <p>{error}</p>
                </div>
            )}

            <div className="character-selection">
                <h2>Choose a Character to Add</h2>

                {baseCharacters.length === 0 ? (
                    <p className="no-characters">No characters available.</p>
                ) : (
                    // Inside your component's return statement, update the character card section:
                    <div className="base-character-grid">
                        {baseCharacters.map(character => (
                            <div key={character.characterId} className="base-character-card">
                                {/* Replace this div with a proper avatar container */}
                                <div className="character-avatar">
                                    {character.imageUrl ? (
                                        <img
                                            src={character.imageUrl}
                                            alt={character.name}
                                            className="character-image"
                                        />
                                    ) : (
                                        <div className="character-letter">
                                            {character.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <h3>{character.name}</h3>
                                <p className="character-class">{character.class_}</p>
                                <div className="character-stats">
                                    <div className="stat">
                                        <span className="stat-label">STR</span>
                                        <span className="stat-value">{character.baseStrength}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">INT</span>
                                        <span className="stat-value">{character.baseIntelligence}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">AGI</span>
                                        <span className="stat-value">{character.baseAgility}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAddCharacter(character.characterId)}
                                    disabled={adding}
                                    className="add-button"
                                >
                                    {adding ? 'Adding...' : 'Add Character'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="navigation-buttons">
                <button
                    onClick={() => navigate('/characters')}
                    className="back-button"
                    disabled={adding}
                >
                    Back to My Characters
                </button>
            </div>
        </div>
    );
}