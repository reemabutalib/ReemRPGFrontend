import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';

// 1. Define the shape of the context
const defaultContext = {
  username: '',
  setUsername: () => { },
  password: '',
  setPassword: () => { },
  selectedCharacter: null,
  setSelectedCharacter: () => { },
  favorites: [],
  toggleFavorite: () => { },
  hasSelectedCharacter: () => false,
  characters: [],
  setCharacters: () => { },
  loading: true,
  error: null,
};




// 2. Create context with proper default value
const UserContext = createContext(defaultContext);

// 3. Hook to use context
export const useUser = () => useContext(UserContext);

// 4. Provider
export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [favorites, setFavorites] = useState([]);
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

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const hasSelectedCharacter = () => !!selectedCharacter;

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
        password,
        setPassword,
        selectedCharacter,
        setSelectedCharacter,
        favorites,
        toggleFavorite,
        hasSelectedCharacter,
        characters,
        setCharacters,
        loading,
        error,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
