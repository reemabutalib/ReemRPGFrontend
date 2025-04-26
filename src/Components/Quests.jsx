import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import "./Quests.css";
import { checkAndRefreshToken } from "./Utils/AuthUtils.jsx";

const QuestCard = ({ quest, onDoQuest, isDisabled, characterLevel }) => {
    const isLevelTooLow = characterLevel < quest.requiredLevel;

    return (
        <div className={`quest-card ${isLevelTooLow ? 'disabled' : ''}`}>
            <h2>{quest.title}</h2>
            <p>{quest.description}</p>
            <div className="quest-rewards">
                <p><span>Experience:</span> {quest.experienceReward}</p>
                <p><span>Gold:</span> {quest.goldReward}</p>
                {quest.requiredLevel > 0 && (
                    <p className="level-requirement">Required Level: {quest.requiredLevel}</p>
                )}
            </div>
            <button
                onClick={() => onDoQuest(quest)}
                disabled={isDisabled || isLevelTooLow}
                className={isLevelTooLow ? 'disabled-button' : ''}
            >
                {isLevelTooLow ? `Requires Level ${quest.requiredLevel}` : 'Attempt Quest'}
            </button>
        </div>
    );
};

export default function Quests() {
    const navigate = useNavigate();
    const { selectedCharacter, setSelectedCharacter, userId, debugStoredCharacters } = useUser();
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingQuest, setProcessingQuest] = useState(false);
    const [result, setResult] = useState(null);

    // Get character from context or localStorage - now with user-specific storage
    const getCharacter = () => {
        // First try from context - this is already user-specific
        if (selectedCharacter) return selectedCharacter;

        try {
            // If no character in context, try from user-specific localStorage
            if (userId) {
                const userCharacterKey = `selectedCharacter_${userId}`;
                const storedCharacter = localStorage.getItem(userCharacterKey);
                if (storedCharacter) {
                    return JSON.parse(storedCharacter);
                }
            }

            // Fall back to the old non-user-specific key (for backward compatibility)
            const storedCharacter = localStorage.getItem('selectedCharacter');
            return storedCharacter ? JSON.parse(storedCharacter) : null;
        } catch (e) {
            console.error("Error parsing character from localStorage", e);
            return null;
        }
    };

    const character = getCharacter();

    // If no character, redirect to select one
    useEffect(() => {
        if (!character) {
            navigate('/characters');
        }
    }, [character, navigate]);

    // Log debug info on component mount
    useEffect(() => {
        console.log("Quest component - Current userId:", userId);
        console.log("Quest component - Current character:", character);

        // Use the debug function from context if available
        if (debugStoredCharacters) {
            debugStoredCharacters();
        }
    }, [userId, character, debugStoredCharacters]);

    // Fetch quests
    useEffect(() => {
        const fetchQuests = async () => {
            // First check if token is valid
            const isTokenValid = await checkAndRefreshToken();

            if (!isTokenValid) {
                console.error("Invalid or missing token");
                setError("Authentication required");
                setLoading(false);
                navigate('/login');
                return;
            }

            try {
                const token = localStorage.getItem('authToken');
                console.log("Fetching quests with token:", token.substring(0, 15) + "...");

                const response = await axios.get('http://localhost:5233/api/quest', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log("Quests loaded:", response.data);
                setQuests(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching quests:", err);
                setError("Failed to load quests");
                setLoading(false);

                // If unauthorized, redirect to login
                if (err.response?.status === 401) {
                    localStorage.removeItem('authToken');
                    navigate('/login');
                }
            }
        };

        fetchQuests();
    }, [navigate]);

    // Function to handle quest attempts 
    const handleQuestAttempt = async (quest) => {
        if (processingQuest) return;

        setProcessingQuest(true);
        setResult(null);

        // Check if token is valid before attempting quest
        const isTokenValid = await checkAndRefreshToken();

        if (!isTokenValid) {
            console.error("Invalid or missing token for quest attempt");
            setError("Authentication required");
            setProcessingQuest(false);
            navigate('/login');
            return;
        }

        try {
            // Get a fresh token each time
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error("No auth token found for quest attempt");
                setError("Authentication required");
                navigate('/login');
                return;
            }

            console.log("Attempting quest:", quest.title, "ID:", quest.id);

            const characterObj = getCharacter();
            if (!characterObj) {
                setError("No character selected");
                return;
            }

            // Get character ID with fallbacks for different property names
            let characterId = null;

            if (characterObj.characterId !== undefined) {
                characterId = characterObj.characterId;
            } else if (characterObj.id !== undefined) {
                characterId = characterObj.id;
            } else if (characterObj.CharacterId !== undefined) {
                characterId = characterObj.CharacterId;
            }

            if (!characterId) {
                console.error("Could not find character ID in:", characterObj);
                setError("Invalid character data");
                return;
            }

            const questId = quest.id || quest.questId || quest.QuestId;

            console.log("Character attempting quest:", {
                CharacterId: characterId,
                QuestId: questId
            });

            // IMPORTANT: Use PascalCase for C# backend
            const payload = {
                CharacterId: characterId,
                QuestId: questId
            };

            console.log("Sending quest attempt payload:", payload);

            const response = await axios.post(
                'http://localhost:5233/api/quest/attempt',
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("Quest attempt response:", response.data);

            // Process successful response
            if (response.data) {
                const questResult = {
                    success: response.data.success,
                    experience: response.data.experienceGained,
                    gold: response.data.goldGained,
                    message: response.data.message,
                    levelUp: response.data.levelUp,
                    newLevel: response.data.newLevel
                };

                setResult(questResult);

                // If successful, update character
                if (questResult.success) {
                    const updatedCharacter = {
                        ...characterObj,
                        experience: (characterObj.experience || 0) + questResult.experience,
                        gold: (characterObj.gold || 0) + questResult.gold
                    };

                    // Update level if leveled up
                    if (questResult.levelUp) {
                        updatedCharacter.level = questResult.newLevel;
                    }

                    // Use context's setSelectedCharacter which now handles user-specific storage
                    setSelectedCharacter(updatedCharacter);
                }
            }
        } catch (err) {
            console.error("Error attempting quest:", err);

            let errorMessage = "Failed to complete quest";
            if (err.response) {
                console.error("Server response:", err.response.status, err.response.data);
                errorMessage = err.response.data?.message || err.response.data || `Server error: ${err.response.status}`;

                // Handle unauthorized
                if (err.response.status === 401) {
                    console.error("Authentication failed. Token may be expired.");
                    localStorage.removeItem('authToken');
                    navigate('/login');
                    return;
                }

                // Handle "Character not found or doesn't belong to you"
                if (err.response.status === 400 &&
                    (typeof err.response.data === 'string' &&
                        err.response.data.includes("Character not found"))) {

                    console.error("Character ownership issue:", err.response.data);
                    errorMessage = "This character doesn't belong to your account or wasn't found";

                    // Use user ID-specific key if available
                    if (userId) {
                        localStorage.removeItem(`selectedCharacter_${userId}`);
                    }

                    // Also remove the legacy key for backward compatibility
                    localStorage.removeItem('selectedCharacter');

                    // Redirect after showing error
                    setTimeout(() => navigate('/characters'), 2000);
                }
            }

            setResult({
                success: false,
                message: errorMessage
            });
        } finally {
            setProcessingQuest(false);
        }
    };

    if (loading) {
        return (
            <div className="quests-container">
                <h1>Loading Quests...</h1>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="quests-container error">
                <h1>Error</h1>
                <p>{error}</p>
                <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
        );
    }

    if (!character) {
        return (
            <div className="quests-container">
                <h1>No Character Selected</h1>
                <p>Please select a character to view quests.</p>
                <button onClick={() => navigate('/characters')}>Select Character</button>
            </div>
        );
    }

    return (
        <div className="quests-container">
            <h1>Quests</h1>

            {/* Character Info */}
            <div className="character-info">
                <h2>{character.name}</h2>
                <p>Level: {character.level} | Gold: {character.gold} | XP: {character.experience}</p>
            </div>

            {/* Quest Results */}
            {result && (
                <div className={`quest-result ${result.success ? 'success' : 'failure'}`}>
                    <h3>{result.success ? 'Quest Completed!' : 'Quest Failed'}</h3>
                    <p>{result.message}</p>
                    {result.success && (
                        <div className="rewards">
                            <p>Rewards: {result.experience} XP, {result.gold} Gold</p>
                            {result.levelUp && (
                                <p className="level-up">Level Up! You are now level {result.newLevel}</p>
                            )}
                        </div>
                    )}
                    <button onClick={() => setResult(null)}>Continue</button>
                </div>
            )}

            {/* Quest List */}
            <div className="quests-list">
                {quests.length === 0 ? (
                    <p>No quests available.</p>
                ) : (
                    quests.map(quest => (
                        <QuestCard
                            key={quest.id}
                            quest={quest}
                            onDoQuest={handleQuestAttempt}
                            isDisabled={processingQuest}
                            characterLevel={character.level || 1}
                        />
                    ))
                )}
            </div>

            <button
                onClick={() => navigate('/dashboard')}
                className="back-button"
            >
                Back to Dashboard
            </button>

            {/* Debug info - only show during development */}
            <div className="debug-info">
                <details>
                    <summary>Debug Info</summary>
                    <p>User ID: {userId || "Unknown"}</p>
                    <p>Character ID: {character.characterId || character.id}</p>
                    <p>Character Storage Key: {userId ? `selectedCharacter_${userId}` : "No user ID available"}</p>
                    <button
                        onClick={() => {
                            if (debugStoredCharacters) {
                                debugStoredCharacters();
                                alert("Check console for stored character info");
                            } else {
                                alert("Debug function not available");
                            }
                        }}
                    >
                        Check All Stored Characters
                    </button>
                </details>
            </div>
        </div>
    );
}