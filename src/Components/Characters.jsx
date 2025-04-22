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

    // Fetch characters when the component loads
    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const token = localStorage.getItem('authToken'); // Retrieve token from localStorage
                if (!token) {
                    setError('You must be logged in to view characters.');
                    setLoading(false);
                    return;
                }

                console.log('Fetching characters with token:', token); // Debugging: Log the token

                const response = await axios.get('http://localhost:5233/api/character', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include token in the request
                    },
                });

                console.log('Characters fetched successfully:', response.data); // Debugging: Log the response data
                setCharacters(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching characters:', err);
                setError('Failed to load characters. Please refresh the page or try again.');
                setLoading(false);
            }
        };

        fetchCharacters();
    }, []);

    // Handle character selection
    const handleSelect = async (character) => {
        try {
            const token = localStorage.getItem('authToken'); // Retrieve token from localStorage
            if (!token) {
                alert('You must be logged in to select a character.'); // Show alert if token is missing
                return;
            }

            console.log(`Selecting character: ${character.name} with token:`, token); // Debugging: Log the token and character

            // Make the POST request to the select-character endpoint
            const response = await axios.post(
                'http://localhost:5233/api/character/select-character',
                { characterId: character.characterId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include token in the request
                    },
                }
            );

            if (response.status === 200) {
                alert('Character selected successfully!');
                setSelectedCharacter(character); // Update the user context
                localStorage.setItem('selectedCharacter', JSON.stringify(character)); // Persist the selection
                navigate('/dashboard'); // Navigate to the dashboard
            } else {
                alert('Failed to select character. Please try again.');
            }
        } catch (err) {
            console.error('Error selecting character:', err);
            alert('An error occurred while selecting the character. Please try again.');
        }
    };

    // Handle loading and error states
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