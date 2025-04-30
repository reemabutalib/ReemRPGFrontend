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
      console.error('Error parsing token:', err);
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
          setCharacters(response.data);

          // Load user's selected character from API if available
          try {
            // Updated endpoint: usercharacter/selected instead of character/selected
            const selectedResponse = await axios.get('http://localhost:5233/api/usercharacter/selected', {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (selectedResponse.data) {
              // Format the character data from API response
              const characterData = {
                characterId: selectedResponse.data.characterId,
                name: selectedResponse.data.name,
                class: selectedResponse.data.class_,  // Note the underscore in API response
                level: selectedResponse.data.level || 1,
                experience: selectedResponse.data.experience || 0,
                gold: selectedResponse.data.gold || 0,
                imageUrl: selectedResponse.data.imageUrl || ''
              };

              setSelectedCharacterState(characterData);
            } else if (response.data.length > 0) {
              // Fall back to first character if no selection saved
              // Format the first character from the list response
              const firstCharacter = response.data[0];
              const characterData = {
                characterId: firstCharacter.characterId,
                name: firstCharacter.characterName || firstCharacter.name,
                class: firstCharacter.class_ || firstCharacter.class,
                level: firstCharacter.level || 1,
                experience: firstCharacter.experience || 0,
                gold: firstCharacter.gold || 0,
                imageUrl: firstCharacter.imageUrl || ''
              };

              setSelectedCharacterState(characterData);
            }
          } catch (err) {
            console.error('Error fetching selected character:', err);
            // If no selected character endpoint or error, use first character
            if (response.data.length > 0) {
              const firstCharacter = response.data[0];
              const characterData = {
                characterId: firstCharacter.characterId,
                name: firstCharacter.characterName || firstCharacter.name,
                class: firstCharacter.class_ || firstCharacter.class,
                level: firstCharacter.level || 1,
                experience: firstCharacter.experience || 0,
                gold: firstCharacter.gold || 0,
                imageUrl: firstCharacter.imageUrl || ''
              };

              setSelectedCharacterState(characterData);
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

  // Handle character selection
  const setSelectedCharacter = async (character) => {
    if (!character) {
      setSelectedCharacterState(null);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      // Updated endpoint: usercharacter/select instead of character/select-character
      await axios.post(
        'http://localhost:5233/api/usercharacter/select',
        { characterId: character.characterId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedCharacterState(character);
    } catch (err) {
      console.error('Error selecting character:', err);
      // Fall back to client-side selection if API fails
      setSelectedCharacterState(character);
    }
  };

  // Check if user has a character selected
  const hasSelectedCharacter = () => !!selectedCharacter;

  // Clear user data on logout
  const clearUserData = () => {
    setSelectedCharacterState(null);
    setCharacters([]);
    setUserId(null);
  };

  return (
    <UserContext.Provider
      value={{
        selectedCharacter,
        setSelectedCharacter,
        hasSelectedCharacter,
        characters,
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