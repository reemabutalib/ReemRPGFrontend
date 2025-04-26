import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';

// Default context
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
  clearUserData: () => { }, // New function to clear user data on logout
};

// Mock data as fallback
const mockCharacters = [
  {
    characterId: 1,
    name: "Generic Warrior",
    class: "Warrior",
    level: 1,
    experience: 0,
    gold: 100,
    items: []
  }
];

// Create context
const UserContext = createContext(defaultContext);

// Hook to use context
export const useUser = () => useContext(UserContext);

// Provider
export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCharacter, setSelectedCharacterState] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Get user-specific storage key
  const getUserCharacterKey = (id) => {
    return `selectedCharacter_${id || userId}`;
  };

  // Extract userId from token when component mounts or token changes
  useEffect(() => {
    const extractUserId = () => {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (token) {
        try {
          // Extract userId from JWT token (simple parsing, not full validation)
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          const id = payload.nameid || payload.sub;

          setUserId(id);
          console.log('Extracted userId from token:', id);
          return id;
        } catch (err) {
          console.error('Error parsing token:', err);
          return null;
        }
      } else {
        console.log('No token found in localStorage');
        return null;
      }
    };

    const id = extractUserId();

    // If userId changed, load the correct character for this user
    if (id !== userId) {
      loadStoredCharacterForUser(id);
    }
  }, []);

  // Load stored character for specific user
  const loadStoredCharacterForUser = (id) => {
    if (!id) return;

    try {
      const userCharacterKey = getUserCharacterKey(id);
      const storedCharacter = localStorage.getItem(userCharacterKey);

      if (storedCharacter) {
        console.log(`Loading stored character for user ${id}:`, storedCharacter.substring(0, 50) + '...');
        setSelectedCharacterState(JSON.parse(storedCharacter));
      } else {
        console.log(`No stored character found for user ${id}`);
        setSelectedCharacterState(null);
      }
    } catch (err) {
      console.error('Error loading stored character:', err);
      setSelectedCharacterState(null);
    }
  };

  // Load characters from API when user ID changes
  useEffect(() => {
    if (!userId) {
      console.log('No userId available, skipping character fetch');
      setLoading(false);
      return;
    }

    const fetchCharacters = async () => {
      console.log('Fetching characters for user:', userId);
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) {
          console.log('No token available for API request');
          throw new Error('Authentication token not found');
        }

        const response = await axios.get('http://localhost:5233/api/character', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // If data is empty or not an array, use mock data
        if (Array.isArray(response.data) && response.data.length > 0) {
          console.log('Characters loaded from API:', response.data);
          setCharacters(response.data);

          // Try to recover selected character from USER-SPECIFIC localStorage first
          const userCharacterKey = getUserCharacterKey();
          const storedCharacter = localStorage.getItem(userCharacterKey);

          if (storedCharacter) {
            try {
              const parsedCharacter = JSON.parse(storedCharacter);
              console.log('Found stored character for current user:', parsedCharacter);

              // Find if this character exists in the returned list
              const matchingCharacter = response.data.find(
                c => String(c.characterId) === String(parsedCharacter.characterId)
              );

              if (matchingCharacter) {
                console.log('Character belongs to current user, selecting it:', matchingCharacter);
                setSelectedCharacterState(matchingCharacter);
              } else {
                console.log('Stored character not found in user\'s character list, selecting first character instead');
                setSelectedCharacterState(response.data[0]); // Default to first character
                localStorage.setItem(userCharacterKey, JSON.stringify(response.data[0]));
              }
            } catch (parseError) {
              console.error('Error parsing stored character:', parseError);
              // If the stored character is invalid, select the first available character
              setSelectedCharacterState(response.data[0]);
              localStorage.setItem(userCharacterKey, JSON.stringify(response.data[0]));
            }
          } else {
            // No stored character, just select the first one
            console.log('No stored character for current user, selecting first character:', response.data[0]);
            setSelectedCharacterState(response.data[0]);
            localStorage.setItem(userCharacterKey, JSON.stringify(response.data[0]));
          }
        } else {
          console.log('No characters returned from API, using mock data');
          setCharacters(mockCharacters);
        }
      } catch (err) {
        console.error('Error fetching characters:', err);
        setError('Failed to load characters. Using demo data instead.');

        // Fall back to mock data on error
        setCharacters(mockCharacters);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [userId]);

  // Store selected character in USER-SPECIFIC localStorage whenever it changes
  useEffect(() => {
    if (selectedCharacter && userId) {
      const userCharacterKey = getUserCharacterKey();
      console.log(`Storing selected character in localStorage for user ${userId}:`, selectedCharacter);
      localStorage.setItem(userCharacterKey, JSON.stringify(selectedCharacter));

      // Also update the regular key for backwards compatibility
      localStorage.setItem('selectedCharacter', JSON.stringify(selectedCharacter));
    }
  }, [selectedCharacter, userId]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const hasSelectedCharacter = () => !!selectedCharacter;

  // Improved character selection method with better type handling and fallbacks
  const setSelectedCharacter = (character) => {
    if (!character) {
      console.error('Attempted to select undefined/null character');
      return false;
    }

    console.log('Selecting character:', character);
    console.log('Available characters:', characters);

    // Compare as strings to avoid type mismatch issues
    const isUserCharacter = characters.some(c =>
      String(c.characterId) === String(character.characterId)
    );

    console.log('Character ownership validation result:', isUserCharacter);

    if (isUserCharacter) {
      console.log('Character validated, setting selected character');

      // Use user-specific storage key
      if (userId) {
        const userCharacterKey = getUserCharacterKey();
        localStorage.setItem(userCharacterKey, JSON.stringify(character));
      }

      setSelectedCharacterState(character);
      return true;
    } else {
      console.error('⚠️ Character ownership validation failed');
      console.error('Character ID:', character.characterId, 'Type:', typeof character.characterId);
      console.error('Available character IDs:', characters.map(c =>
        `${c.characterId} (${typeof c.characterId})`
      ));

      // IMPORTANT: Handle the validation failure gracefully
      // If we have any characters available, select the first one
      if (characters.length > 0) {
        console.log('⚠️ Selecting first available character instead:', characters[0]);

        // Use user-specific storage key
        if (userId) {
          const userCharacterKey = getUserCharacterKey();
          localStorage.setItem(userCharacterKey, JSON.stringify(characters[0]));
        }

        setSelectedCharacterState(characters[0]);
        return true;
      }

      // If we reach here, we have no valid characters
      return false;
    }
  };

  // Clear user-specific data (for logout)
  const clearUserData = () => {
    console.log('Clearing user-specific data');

    // Clear user-specific character data
    if (userId) {
      const userCharacterKey = getUserCharacterKey();
      localStorage.removeItem(userCharacterKey);
    }

    // Reset state
    setSelectedCharacterState(null);
    setCharacters([]);
    setUserId(null);

    // Also clear regular key for backwards compatibility
    localStorage.removeItem('selectedCharacter');
  };

  // Debug function to check all stored characters
  const debugStoredCharacters = () => {
    console.log('==== DEBUGGING STORED CHARACTERS ====');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('selectedCharacter')) {
        try {
          const value = localStorage.getItem(key);
          const character = JSON.parse(value);
          console.log(`${key}:`, character.name, `(ID: ${character.characterId})`);
        } catch (err) {
          // Handle parse error gracefully
          console.log(`${key}: [parse error - ${err.message}]`);
        }
      }
    }
    console.log('====================================');
  };

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
        userId,
        clearUserData,
        debugStoredCharacters
      }}
    >
      {children}
    </UserContext.Provider>
  );
};