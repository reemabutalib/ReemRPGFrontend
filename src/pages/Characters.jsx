import '@/styles/Characters.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';

export default function Characters() {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
    const [deletingCharacter, setDeletingCharacter] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();
    const { selectedCharacter, setSelectedCharacter } = useUser();

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

                // Change this section in the fetchCharacters function
                const response = await axios.get('http://localhost:5233/api/usercharacter', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Instead of filtering by characterId, we should use userCharacterId
                // Each user-character combination should have a unique userCharacterId
                const processedCharacters = response.data.map(char => {
                    // Map character IDs to specific images (the same ones from AddCharacter.jsx)
                    const characterImages = {
                        1: '/assets/images/Arthas.JPG',
                        2: '/assets/images/Ezra.jpeg',
                        3: '/assets/images/Rogue.png',
                        4: '/assets/images/Archer.png',
                        5: '/assets/images/Simon.png',
                        6: '/assets/images/Elara.png',
                        7: '/assets/images/Grimm.png',
                        8: '/assets/images/Kaia.png'
                    };

                    // Get image based on characterId or use a fallback based on class
                    let imageUrl = characterImages[char.characterId];

                    console.log(`Character ${char.name} (ID: ${char.characterId}): Using image ${imageUrl}`);

                    return {
                        characterId: char.characterId,
                        userCharacterId: char.userCharacterId || char.id, // This should be unique per user
                        name: char.characterName || char.name,
                        class: char.class_,
                        level: char.level || 1,
                        experience: char.experience || 0,
                        gold: char.gold || 0,
                        isSelected: char.isSelected || false,
                        imageUrl: imageUrl // Use our mapped image URL instead of the one from API
                    };
                });


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

            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login');
                return;
            }

            const characterId = character.characterId;

            try {
                // Using the new UserCharacterController endpoint
                await axios.post(
                    'http://localhost:5233/api/usercharacter/select',
                    { characterId: characterId },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

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
                // Show a more specific error message if possible
                if (err.response) {
                    const errorMsg = err.response.data?.message || "Selection failed.";
                    setError(`Error: ${errorMsg}`);
                } else {
                    setError("Could not select character. Please try again.");
                }
            }
        } catch (err) {
            console.error('Error selecting character:', err);
            setError("Could not select character. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle character deletion - new function
    const handleDeleteCharacter = async () => {
        if (!deletingCharacter) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login');
                return;
            }

            // Use userCharacterId instead of characterId
            const userCharacterId = deletingCharacter.userCharacterId;

            // Call the delete endpoint with userCharacterId
            await axios.delete(
                `http://localhost:5233/api/usercharacter/${userCharacterId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // If the deleted character was selected, clear the selection
            if (selectedCharacter && selectedCharacter.userCharacterId === userCharacterId) {
                setSelectedCharacter(null);
            }

            // Update the characters list
            setCharacters(prev => prev.filter(c => c.userCharacterId !== userCharacterId));

            // Hide confirmation dialog
            setShowConfirmation(false);
            setDeletingCharacter(null);

        } catch (err) {
            let errorMessage = "Failed to delete character";

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Initiate deletion process
    const confirmDelete = (character) => {
        setDeletingCharacter(character);
        setShowConfirmation(true);
    };

    // Cancel deletion
    const cancelDelete = () => {
        setShowConfirmation(false);
        setDeletingCharacter(null);
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
                        onClick={() => setError(null)}
                        className="back-button"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="characters-container">
            <h1>Your Characters</h1>

            {/* Welcome message */}
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

            {/* Loading overlay */}
            {loading && characters.length > 0 && (
                <div className="overlay-loading">
                    <div className="loading-spinner">Processing...</div>
                </div>
            )}

            {/* Confirmation Dialog */}
            {showConfirmation && (
                <div className="confirmation-overlay">
                    <div className="confirmation-dialog">
                        <h3>Remove Character?</h3>
                        <p>
                            Are you sure you want to remove <strong>{deletingCharacter?.name}</strong>?
                        </p>
                        <p className="confirmation-note">
                            Your character progress will be lost, but you can add this character again later.
                        </p>
                        <div className="confirmation-buttons">
                            <button
                                onClick={cancelDelete}
                                className="cancel-button"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteCharacter}
                                className="delete-button"
                            >
                                Remove Character
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {characters.length === 0 ? (
                <div className="no-characters">
                    <p>You don't have any characters yet.</p>
                    <button
                        onClick={() => navigate('/add-character')}
                        className="create-character-btn"
                    >
                        Add Your First Character
                    </button>
                </div>
            ) : (
                <>
                    <h2>Choose a Character to Play</h2>
                    <div className="character-grid">
                        {characters.map(character => (
                            <div
                                key={character.userCharacterId}
                                className={`character-card ${character.isSelected ? 'selected' : ''}`}
                            >
                                {character.isSelected && <div className="selected-badge">Selected</div>}

                                <div className="character-avatar">
                                    {character.imageUrl ? (
                                        <img
                                            src={character.imageUrl}
                                            alt={`${character.name}`}
                                            className="character-image"
                                            onError={(e) => {
                                                // Prevent infinite loops - only set once
                                                if (!e.target.hasAttribute('data-error-handled')) {
                                                    e.target.setAttribute('data-error-handled', 'true');
                                                    e.target.onerror = null; // Remove handler to prevent loops

                                                    // Switch to letter fallback instead of loading another potentially 
                                                    // missing image which would cause a loop
                                                    const parent = e.target.parentNode;
                                                    e.target.style.display = 'none';

                                                    // Create letter fallback
                                                    const letterDiv = document.createElement('div');
                                                    letterDiv.className = 'character-letter';
                                                    letterDiv.textContent = character.name.charAt(0);
                                                    parent.appendChild(letterDiv);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="character-letter">
                                            {character.name.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                <h3>{character.name}</h3>
                                <p className="character-class">{character.class}</p>

                                <div className="character-stats">
                                    <div className="stat">
                                        <span className="stat-label">STR</span>
                                        <span className="stat-value">10</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">INT</span>
                                        <span className="stat-value">10</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">AGI</span>
                                        <span className="stat-value">10</span>
                                    </div>
                                </div>

                                <div className="character-info">
                                    <div className="info-row">
                                        <span>Level:</span>
                                        <span>{character.level || 1}</span>
                                    </div>
                                    <div className="info-row">
                                        <span>XP:</span>
                                        <span>{character.experience}</span>
                                    </div>
                                    <div className="info-row">
                                        <span>Gold:</span>
                                        <span>{character.gold}</span>
                                    </div>
                                </div>

                                <div className="character-buttons">
                                    <button
                                        onClick={() => handleSelectCharacter(character)}
                                        className="select-button"
                                        disabled={loading || character.isSelected}
                                    >
                                        {character.isSelected ? 'Current Character' : 'Select'}
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(character)}
                                        className="delete-button"
                                        disabled={loading}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Add Character Card */}
                        <div className="character-card add-character-card" onClick={() => navigate('/add-character')}>
                            <div className="add-character-icon">+</div>
                            <h3>Add Character</h3>
                            <p>Choose a new hero to add to your roster</p>
                        </div>
                    </div>
                </>
            )}

            <div className="character-actions">
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
