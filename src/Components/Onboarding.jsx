import { useUser } from "@/context/userContext";
import "./Onboarding.css";

import { useNavigate } from "react-router";

const characters = [
    {
        name: "Warrior", description: "A brave and strong fighter.",
        abilities: ["Swordsmanship", "Shield Block", "Berserk"]
    },
    {
        name: "Archer", description: "A skilled marksman with a bow.",
        abilities: ["Archery", "Stealth", "Quick Shot"]
    },
    {
        name: "Mage", description: "A master of magical arts.",
        abilities: ["Fireball", "Teleportation", "Healing"]
    },
    {
        name: "Rogue", description: "A stealthy and agile character.",
        abilities: ["Backstab", "Pickpocket", "Shadow Step"]
    },

];

const Onboarding = () => {

    const navigate = useNavigate();


    const { setSelectedCharacter } = useUser();

    const selectCharacter = (character) => {
        // Handle character selection logic here
        console.log(`Selected character: ${character.name}`);
        // setSelectedCharacter(character);
        setSelectedCharacter(character);
        // navigate to quests 
        navigate('/quests');
    }

    return (
        <div className="onboarding">
            {
                characters.map((character, index) => (
                    <div key={index} className="character-card">
                        <h2>{character.name}</h2>
                        <p>{character.description}</p>
                        <h3>Abilities:</h3>
                        <ul>
                            {character.abilities.map((ability, idx) => (
                                <li key={idx}>{ability}</li>
                            ))}
                        </ul>
                        <button
                            onClick={() => selectCharacter(character)}>
                            Select {character.name}
                        </button>
                    </div>
                ))
            }
        </div>
    );
};

export default Onboarding;