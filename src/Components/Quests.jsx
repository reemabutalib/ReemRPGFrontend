import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import "./Quests.css";

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
            >
                {isLevelTooLow ? `Requires Level ${quest.requiredLevel}` : 'Attempt Quest'}
            </button>
        </div>
    );
};

const QuestResult = ({ result, onClose }) => {
    if (!result) return null;

    return (
        <div className="quest-result">
            <div className="quest-result-content">
                <h2>{result.success ? 'Quest Completed!' : 'Quest Failed'}</h2>
                {result.success ? (
                    <div className="quest-rewards">
                        <p>Experience gained: <span>{result.rewards.experience}</span></p>
                        <p>Gold earned: <span>{result.rewards.gold}</span></p>
                        {result.rewards.item && (
                            <p>Item received: <span>{result.rewards.item.name}</span></p>
                        )}
                    </div>
                ) : (
                    <p>{result.message || 'Better luck next time!'}</p>
                )}
                <button onClick={onClose}>Continue</button>
            </div>
        </div>
    );
};

const Quests = () => {
    const navigate = useNavigate();
    const { selectedCharacter, setSelectedCharacter } = useUser();
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [processingQuest, setProcessingQuest] = useState(false);

    useEffect(() => {
        // Check if we have a character
        if (!selectedCharacter) {
            navigate('/characters');
            return;
        }

        const fetchQuests = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get("http://localhost:5233/api/quest", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log("Quests loaded:", response.data);
                setQuests(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching quests:", err);
                setError("Failed to load quests: " + (err.response?.data || err.message));
                setLoading(false);
            }
        };

        fetchQuests();
    }, [navigate, selectedCharacter]);

    // Modify the handleQuestAttempt function in your Quests.jsx component:

    const handleQuestAttempt = async (quest) => {
        if (processingQuest) return;

        setProcessingQuest(true);
        try {
            console.log(`Attempting quest: ${quest.title} (ID: ${quest.id})`);

            const token = localStorage.getItem('authToken');
            const characterId = selectedCharacter.characterId || selectedCharacter.id;

            console.log("Character attempting quest:", {
                characterId: characterId,
                questId: quest.id
            });

            // Match payload exactly to your C# model properties
            const payload = {
                CharacterId: characterId,
                QuestId: quest.id
            };

            console.log("Sending quest attempt payload:", payload);

            const response = await axios.post(
                `http://localhost:5233/api/quest/attempt`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("Quest attempt response:", response.data);

            // Process the response
            if (response.data) {
                // Parse response based on your backend's actual response structure
                const success = response.data.success;

                let questResult = {
                    success: success,
                    rewards: {}
                };

                if (success) {
                    // Backend seems to return the quest object as rewards
                    questResult.rewards = {
                        experience: quest.experienceReward,
                        gold: quest.goldReward
                    };

                    // Update character stats
                    const updatedCharacter = {
                        ...selectedCharacter,
                        experience: (selectedCharacter.experience || 0) + quest.experienceReward,
                        gold: (selectedCharacter.gold || 0) + quest.goldReward
                    };

                    // Check for level up (simple implementation)
                    const xpForLevel = (lvl) => lvl * 1000; // Simple formula
                    const currentLevel = selectedCharacter.level || 1;

                    if (updatedCharacter.experience >= xpForLevel(currentLevel)) {
                        updatedCharacter.level = currentLevel + 1;
                    }

                    // Update character in context and storage
                    setSelectedCharacter(updatedCharacter);
                    localStorage.setItem('selectedCharacter', JSON.stringify(updatedCharacter));
                    sessionStorage.setItem('selectedCharacter', JSON.stringify(updatedCharacter));

                    // Show result with rewards
                    setResult(questResult);
                } else {
                    // Quest failed
                    setResult({
                        success: false,
                        message: "You failed the quest. Try again when you're stronger."
                    });
                }
            }
        } catch (err) {
            console.error("Error attempting quest:", err);

            // Show more detailed error message for debugging
            let errorMessage = "Failed to complete quest";
            if (err.response) {
                errorMessage += `: ${err.response.status} - ${JSON.stringify(err.response.data)}`;
            } else if (err.request) {
                errorMessage += ": No response received from server";
            } else {
                errorMessage += `: ${err.message}`;
            }

            setResult({
                success: false,
                message: errorMessage
            });
        } finally {
            setProcessingQuest(false);
        }
    };

    const closeQuestResult = () => {
        setResult(null);
    };

    if (loading) return <div className="quests loading">Loading quests...</div>;
    if (error) return <div className="quests error">{error}</div>;

    return (
        <div className="quests">
            <h1>Available Quests</h1>

            <div className="character-status">
                <h3>{selectedCharacter.name}</h3>
                <p>Level: {selectedCharacter.level || 1}</p>
                <p>Experience: {selectedCharacter.experience || 0}</p>
                <p>Gold: {selectedCharacter.gold || 0}</p>
            </div>

            <div className="quest-list">
                {quests.map((quest) => (
                    <QuestCard
                        key={quest.id}
                        quest={quest}
                        onDoQuest={handleQuestAttempt}
                        isDisabled={processingQuest}
                        characterLevel={selectedCharacter.level || 1}
                    />
                ))}
            </div>

            <QuestResult result={result} onClose={closeQuestResult} />
        </div>
    );
};

export default Quests;