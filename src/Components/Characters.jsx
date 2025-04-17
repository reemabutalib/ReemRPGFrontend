import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '../context/userContext';
import './Characters.css';

const Characters = () => {
    const navigate = useNavigate();
    const { setSelectedCharacter } = useUser();
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const response = await axios.get('http://localhost:5233/api/characters');
                setCharacters(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching characters:', err);
                setError('Failed to load characters.');
                setLoading(false);
            }
        };

        fetchCharacters();
    }, []);

    const handleSelect = async (character) => {
        try {
            await axios.post("http://localhost:5233/api/character", {
                characterId: character.characterId,
            });
            setSelectedCharacter(character);
            localStorage.setItem("selectedCharacter", JSON.stringify(character)); // persist it
            navigate("/dashboard");
        } catch (err) {
            console.error("Error selecting character:", err);
        }
    };


    if (loading) return <div>Loading characters...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="characters">
            {characters.map((character) => (
                <div key={character.characterId} className="character-card">
                    <h2>{character.name}</h2>
                    <p>Class: {character.class}</p>
                    <button onClick={() => handleSelect(character)}>
                        Select {character.name}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Characters;