import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Quests.css";

const QuestCard = ({ quest, onDoQuest, isDisabled }) => {
    return (
        <div className="quest-card">
            <h2>{quest.title}</h2>
            <p>{quest.description}</p>
            <div className="quest-rewards">
                <p><span>Experience:</span> {quest.experienceReward}</p>
                <p><span>Gold:</span> {quest.goldReward}</p>
            </div>
            <button
                onClick={() => onDoQuest(quest)}
                disabled={isDisabled}
            >
                Attempt Quest
            </button>
        </div>
    );
};

export default function Quests() {
    const navigate = useNavigate();
    const [character, setCharacter] = useState(null);
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingQuest, setProcessingQuest] = useState(false);
    const [result, setResult] = useState(null);

    // Load character and quests
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');

                if (!token) {
                    console.log("No auth token found, redirecting to login");
                    navigate('/login');
                    return;
                }

                // First, get the user's selected character
                const characterResponse = await axios.get('http://localhost:5233/api/character/selected', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // If no character is selected, redirect to character selection
                if (!characterResponse.data || !characterResponse.data.characterId) {
                    console.log("No character found for this user");
                    navigate('/characters');
                    return;
                }

                // Store the character
                setCharacter(characterResponse.data);
                console.log("Character loaded:", characterResponse.data.name);

                // Then load quests
                const questsResponse = await axios.get('http://localhost:5233/api/quest', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setQuests(questsResponse.data);
                console.log("Quests loaded:", questsResponse.data.length);

            } catch (err) {
                console.error("Error loading data:", err);

                // If unauthorized, redirect to login
                if (err.response?.status === 401) {
                    localStorage.removeItem('authToken');
                    navigate('/login');
                    return;
                }

                setError("Failed to load quests or character data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // Function to handle quest attempts
    const handleQuestAttempt = async (quest) => {
        if (processingQuest || !character) return;

        setProcessingQuest(true);
        setResult(null);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error("No auth token found for quest attempt");
                navigate('/login');
                return;
            }

            console.log("Attempting quest:", quest.title, "with character:", character.name);

            const questId = quest.questId || quest.id;
            const characterId = character.characterId;

            const response = await axios.post(
                'http://localhost:5233/api/quest/attempt',
                {
                    questId,
                    characterId
                },
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
                    // Update local character state with new values
                    setCharacter(prev => ({
                        ...prev,
                        experience: (prev.experience || 0) + questResult.experience,
                        gold: (prev.gold || 0) + questResult.gold,
                        level: questResult.levelUp ? questResult.newLevel : prev.level
                    }));
                }
            }
        } catch (err) {
            console.error("Error attempting quest:", err);

            let errorMessage = "Failed to complete quest";
            if (err.response) {
                errorMessage = err.response.data?.message || "Server error";

                // Handle unauthorized
                if (err.response.status === 401) {
                    localStorage.removeItem('authToken');
                    navigate('/login');
                    return;
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
                            key={quest.questId || quest.id}
                            quest={quest}
                            onDoQuest={handleQuestAttempt}
                            isDisabled={processingQuest}
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
        </div>
    );
}