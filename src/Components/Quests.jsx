import { useUser } from "@/context/userContext";
import { quests } from "@/data/quests";
import { useState } from "react";
import "./Quests.css";

const QuestCard = ({ quest, onDoQuest }) => {
    return (
        <div className="quest-card">
            <h2>{quest.name}</h2>
            <p>{quest.description}</p>
            <button onClick={() => onDoQuest(quest.id)}>
                Do the Quest
            </button>
        </div>
    );
}

const Quests = () => {
    const [doingQuest, setDoingQuest] = useState(false);
    const { selectedCharacter, level } = useUser();

    // Filter quests based on the selected character and level
    const availableQuests = quests.filter(
        (quest) =>
            quest.requiredCharacter === selectedCharacter.name &&
            quest.requiredLevel <= level
    );

    console.log("Available quests:", availableQuests);

    const doQuest = (questId) => {
        const quest = availableQuests.find(q => q.id === questId);


        setDoingQuest(true);

        setTimeout(() => {
            setDoingQuest(false);
            alert(`You have completed the quest: ${quest.name}`);
        }
            , 2000); // Simulate a delay of 2 seconds
    }

    if (doingQuest) {
        return (
            <div className="quests">
                <div>Doing Quest....</div>
            </div>
        )
    }

    return (
        <div className="quests">
            <h1>Available Quests for {" "}
                {selectedCharacter.name} (Level {level})
            </h1>
            {availableQuests.length > 0 ? (
                <ul className="quests-container">
                    {availableQuests.map((quest) => (
                        <QuestCard quest={quest} key={quest.id} onDoQuest={doQuest} />
                    ))}
                </ul>
            ) : (
                <p>No quests available for your character and level.</p>
            )}
        </div>
    );
};

export default Quests;