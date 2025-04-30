import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';

// Create the context with default values
const UserContext = createContext({
  selectedCharacter: null,
  setSelectedCharacter: () => { },
  characters: [],
  loading: true,
  error: null,
  userId: null,
  clearUserData: () => { }
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [selectedCharacter, setSelectedCharacterState] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Extract user ID from token
  const getUserIdFromToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      // Try different possible claim names
      return payload.nameid || payload.sub ||
        payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null;
    } catch (err) {
      console.error('Error extracting user ID from token:', err);
      return null;
    }
  };

  // Check authentication and set userId on component mount
  useEffect(() => {
    const checkAuth = () => {
      const id = getUserIdFromToken();

      if (id) {
        setUserId(id);
      } else {
        setUserId(null);
        setSelectedCharacterState(null);
      }
    };

    checkAuth();
  }, []);

  // Load characters when userId changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');

        // Updated endpoint: usercharacter instead of character
        const response = await axios.get('http://localhost:5233/api/usercharacter', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (Array.isArray(response.data)) {
          // Add userCharacterId to each character object
          const processedCharacters = response.data.map(char => ({
            characterId: char.characterId,
            userCharacterId: char.userCharacterId || char.id, // Add userCharacterId
            name: char.characterName || char.name,
            class: char.class_ || char.class,
            level: char.level || 1,
            experience: char.experience || 0,
            gold: char.gold || 0,
            isSelected: char.isSelected || false,
            imageUrl: char.imageUrl || ''
          }));

          setCharacters(processedCharacters);

          // Load user's selected character from API if available
          try {
            // Updated endpoint: usercharacter/selected instead of character/selected
            const selectedResponse = await axios.get('http://localhost:5233/api/usercharacter/selected', {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (selectedResponse.data) {
              // Format the character data from API response - include userCharacterId
              const characterData = {
                characterId: selectedResponse.data.characterId,
                userCharacterId: selectedResponse.data.userCharacterId || selectedResponse.data.id, // Add userCharacterId
                name: selectedResponse.data.name,
                class: selectedResponse.data.class_,
                level: selectedResponse.data.level || 1,
                experience: selectedResponse.data.experience || 0,
                gold: selectedResponse.data.gold || 0,
                imageUrl: selectedResponse.data.imageUrl || ''
              };

              setSelectedCharacterState(characterData);
            } else if (processedCharacters.length > 0) {
              // Fall back to first character if no selection saved
              setSelectedCharacterState(processedCharacters[0]);
            }
          } catch (err) {
            console.error('Error fetching selected character:', err);
            // If no selected character endpoint or error, use first character
            if (processedCharacters.length > 0) {
              setSelectedCharacterState(processedCharacters[0]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching characters:', err);
        setError('Failed to load characters. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Handle character selection with proper guard against infinite loops
  const setSelectedCharacter = async (character) => {
    if (!character) {
      setSelectedCharacterState(null);
      return;
    }

    // Add a check to prevent selecting the same character repeatedly
    if (selectedCharacter && selectedCharacter.userCharacterId === character.userCharacterId) {
      console.log('Character is already selected, skipping');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      // Get the appropriate ID to use
      const characterId = character.characterId;
      const userCharacterId = character.userCharacterId;

      console.log('Selecting character with:', { characterId, userCharacterId });

      // Set loading state to prevent additional calls
      setLoading(true);

      // Send both IDs to make the backend more flexible
      await axios.post(
        'http://localhost:5233/api/usercharacter/select',
        {
          characterId: characterId,
          userCharacterId: userCharacterId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Set the selected character first
      setSelectedCharacterState(character);

      // After selection, refresh the character list to update isSelected flags
      const response = await axios.get('http://localhost:5233/api/usercharacter', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (Array.isArray(response.data)) {
        const processedCharacters = response.data.map(char => ({
          characterId: char.characterId,
          userCharacterId: char.userCharacterId || char.id,
          name: char.characterName || char.name,
          class: char.class_ || char.class,
          level: char.level || 1,
          experience: char.experience || 0,
          gold: char.gold || 0,
          isSelected: char.isSelected || false,
          imageUrl: char.imageUrl || ''
        }));

        // Update characters without triggering a loop
        setCharacters(processedCharacters);
      }
    } catch (err) {
      console.error('Error selecting character:', err);

      if (err.response) {
        console.error('Server responded with:', {
          status: err.response.status,
          data: err.response.data
        });
      }

      setError('Failed to select character. Please try again.');
    } finally {
      // Always make sure to turn off loading state
      setLoading(false);
    }
  };

  // Check if user has a character selected
  const hasSelectedCharacter = () => !!selectedCharacter;

  // Clear user data on logout
  const clearUserData = () => {
    setSelectedCharacterState(null);
    setCharacters([]);
    setUserId(null);
    setError(null);
  };

  // Return the context provider with values
  return (
    <UserContext.Provider
      value={{
        selectedCharacter,
        setSelectedCharacter,
        hasSelectedCharacter,
        characters,
        setCharacters,
        loading,
        error,
        userId,
        clearUserData
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Export the provider for use in the app
export default UserProvider;