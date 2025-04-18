import { useUser } from "@/context/userContext";
import axios from "axios";
import { useEffect, useState } from "react";
import "./Quests.css";

const QuestCard = ({ quest, onDoQuest }) => (
    <div className="quest-card">
        <h2>{quest.title}</h2>
        <p>{quest.description}</p>
        <button onClick={() => onDoQuest(quest)}>
            Attempt Quest
        </button>
    </div>
);

const Quests = () => {
    const { selectedCharacter, setSelectedCharacter } = useUser();
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchQuests = async () => {
            try {
                const response = await axios.get("http://localhost:5233/api/quest");
                setQuests(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching quests:", err);
                setError("Failed to load quests.");
                setLoading(false);
            }
        };

        fetchQuests();
    }, []);

    const handleQuestAttempt = async (quest) => {
        try {
            const response = await axios.post(
                `http://localhost:5233/api/quest/attempt`,
                {
                    characterId: selectedCharacter.characterId,
                    questId: quest.id,
                }
            );

            const { success, rewards } = response.data;
            if (success) {
                setResult(`Quest completed! Rewards: ${rewards}`);
                // Update character stats with rewards
                setSelectedCharacter((prev) => ({
                    ...prev,
                    level: prev.level + rewards.experience,
                    gold: prev.gold + rewards.gold,
                }));
            } else {
                setResult("Quest failed. Try again!");
            }
        } catch (err) {
            console.error("Error attempting quest:", err);
        }
    };

    if (loading) return <div>Loading quests...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="quests">
            <h1>Available Quests</h1>
            {result && <p>{result}</p>}
            {quests.map((quest) => (
                <QuestCard
                    key={quest.id}
                    quest={quest}
                    onDoQuest={handleQuestAttempt}
                />
            ))}
        </div>
    );
};

export default Quests;