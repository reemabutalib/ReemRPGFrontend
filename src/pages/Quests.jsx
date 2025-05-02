import "@/styles/Quests.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";

const QuestCard = ({ quest, onDoQuest, isDisabled, isCompleted }) => {
    return (
        <div className={`quest-card ${isCompleted ? 'completed' : ''}`}>
            <h2>{quest.title}</h2>
            <p>{quest.description}</p>
            <div className="quest-rewards">
                <p><span>Experience:</span> {quest.experienceReward}</p>
                <p><span>Gold:</span> {quest.goldReward}</p>
            </div>
            <button
                onClick={() => onDoQuest(quest)}
                disabled={isDisabled || isCompleted}
            >
                {isCompleted ? 'Already Completed' : 'Attempt Quest'}
            </button>
        </div>
    );
};

export default function Quests() {
    const navigate = useNavigate();
    const { selectedCharacter, setSelectedCharacter } = useUser();
    const [character, setCharacter] = useState(null);
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingQuest, setProcessingQuest] = useState(false);
    const [result, setResult] = useState(null);
    const [completedQuests, setCompletedQuests] = useState([]);

    // Load character and quests
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');

                if (!token) {
                    navigate('/login');
                    return;
                }

                // First try to use the character from context
                let characterData;
                if (selectedCharacter && selectedCharacter.characterId) {
                    characterData = selectedCharacter;
                    setCharacter(selectedCharacter);
                } else {
                    // Otherwise, fetch from API
                    const characterResponse = await axios.get('http://localhost:5233/api/usercharacter/selected', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (!characterResponse.data || !characterResponse.data.characterId) {
                        navigate('/characters');
                        return;
                    }

                    // Format the character data
                    characterData = {
                        characterId: characterResponse.data.characterId,
                        name: characterResponse.data.name,
                        class: characterResponse.data.class_,
                        level: characterResponse.data.level || 1,
                        experience: characterResponse.data.experience || 0,
                        gold: characterResponse.data.gold || 0,
                        imageUrl: characterResponse.data.imageUrl || ''
                    };

                    // Store the character
                    setCharacter(characterData);
                    setSelectedCharacter(characterData);
                }

                // Then load quests
                const questsResponse = await axios.get('http://localhost:5233/api/quest', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setQuests(questsResponse.data);

                // Also try to load completed quests for this character
                if (characterData?.characterId) {
                    try {
                        const completedResponse = await axios.get(
                            `http://localhost:5233/api/quest/character/${characterData.characterId}/completed`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        setCompletedQuests(completedResponse.data || []);
                    } catch (err) {
                        // Just log the error but continue - this isn't critical
                        console.warn("Could not load completed quests:", err.message);
                    }
                }

            } catch (err) {
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
    }, [navigate, selectedCharacter, setSelectedCharacter]);

    // Function to check if a quest is completed
    const isQuestCompleted = (questId) => {
        return completedQuests.some(q => q.questId === questId);
    };

    // Function to handle quest attempts
    const handleQuestAttempt = async (quest) => {
        if (processingQuest || !character) return;

        setProcessingQuest(true);
        setResult(null);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login');
                return;
            }

            const questId = quest.questId;
            const characterId = character.characterId;

            const response = await axios.post(
                'http://localhost:5233/api/quest/attempt',
                { questId, characterId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // If the quest was already completed
            if (response.data.alreadyCompleted) {
                setResult({
                    success: true,
                    alreadyCompleted: true,
                    message: response.data.message || "You've already completed this quest!"
                });

                // Add to completed quests if not already there
                if (!isQuestCompleted(questId)) {
                    setCompletedQuests(prev => [
                        ...prev,
                        {
                            questId,
                            title: quest.title
                        }
                    ]);
                }

                return;
            }

            // Process successful response
            if (response.data) {
                const questResult = {
                    success: response.data.success,
                    experience: response.data.experienceGained,
                    gold: response.data.goldGained,
                    message: response.data.message,
                    levelUp: response.data.levelUp,
                    newLevel: response.data.newLevel,
                    currentExp: response.data.currentExp,
                    expToNextLevel: response.data.expToNextLevel
                };

                setResult(questResult);

                // Update both local state and context with new values
                const updatedCharacter = {
                    ...character,
                    experience: response.data.currentExp,
                    gold: (character.gold || 0) + questResult.gold,
                    level: questResult.levelUp ? questResult.newLevel : character.level
                };

                setCharacter(updatedCharacter);
                setSelectedCharacter(updatedCharacter);

                // Add this quest to completed quests
                setCompletedQuests(prev => [
                    ...prev,
                    {
                        questId: quest.questId,
                        title: quest.title,
                        completedOn: new Date().toISOString(),
                        experienceGained: questResult.experience,
                        goldGained: questResult.gold
                    }
                ]);
            }
        } catch (err) {
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
                {result?.expToNextLevel && <p>XP to next level: {result.expToNextLevel}</p>}
            </div>

            {/* Quest Results */}
            {result && (
                <div className={`quest-result ${result.success ? 'success' : 'failure'}`}>
                    <h3>{result.success ? 'Quest Completed!' : 'Quest Failed'}</h3>
                    <p>{result.message}</p>
                    {result.success && !result.alreadyCompleted && (
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
                            key={quest.questId}
                            quest={quest}
                            onDoQuest={handleQuestAttempt}
                            isDisabled={processingQuest}
                            isCompleted={isQuestCompleted(quest.questId)}
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