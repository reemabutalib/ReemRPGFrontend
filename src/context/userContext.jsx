import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Create the context with default values
const UserContext = createContext({
  selectedCharacter: null,
  setSelectedCharacter: () => { },
  characters: [],
  loading: true,
  error: null,
  userId: null,
  isAdmin: false,
  clearUserData: () => { },
  refreshData: () => { },
  refreshToken: () => { }
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [selectedCharacter, setSelectedCharacterState] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // data version for generic refresh
  const [dataVersion, setDataVersion] = useState(1);

  // token related state
  const [tokenExpiryTime, setTokenExpiryTime] = useState(null);
  const [tokenRefreshInProgress, setTokenRefreshInProgress] = useState(false);

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

  // Check if user is Admin from token
  const checkIsAdminFromToken = (token) => {
    if (!token) return false;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));

      // Check for role claim
      const roleClaim = payload.role ||
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      // Role could be string or array
      if (Array.isArray(roleClaim)) {
        return roleClaim.includes('Admin');
      }

      return roleClaim === 'Admin';
    } catch (err) {
      console.error('Error checking admin status from token:', err);
      return false;
    }
  };

  // Get token expiration time
  const getTokenExpiryTime = (token) => {
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));

      // exp is in seconds, convert to milliseconds
      return payload.exp * 1000;
    } catch (err) {
      console.error('Error calculating token expiry time:', err);
      return null;
    }
  };

  // Generic data refresh function
  const refreshData = useCallback(() => {
    console.log("Refreshing data...");
    setDataVersion(v => v + 1);
  }, []);

  // Token refresh function
  const refreshToken = useCallback(async () => {
    if (tokenRefreshInProgress) return false;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return false;

      setTokenRefreshInProgress(true);

      const response = await axios.post(
        'http://localhost:5233/api/auth/refresh',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.token) {
        localStorage.setItem('authToken', response.data.token);

        // Update token expiry time
        const newExpiryTime = getTokenExpiryTime(response.data.token);
        setTokenExpiryTime(newExpiryTime);

        // Check if admin status or user ID changed with new token
        const newUserId = getUserIdFromToken();
        if (newUserId && newUserId !== userId) {
          setUserId(newUserId);
        }

        const newIsAdmin = checkIsAdminFromToken(response.data.token);
        if (newIsAdmin !== isAdmin) {
          setIsAdmin(newIsAdmin);
        }

        console.log('Auth token refreshed successfully');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error refreshing auth token:', err);
      if (err.response && err.response.status === 401) {
        clearUserData();
        localStorage.removeItem('authToken');
        window.location.href = '/login?session=expired';
      }
      return false;
    } finally {
      setTokenRefreshInProgress(false);
    }
  }, [tokenRefreshInProgress, userId, isAdmin]);

  // Check authentication, set userId, and check admin status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setUserId(null);
        setIsAdmin(false);
        setSelectedCharacterState(null);
        setTokenExpiryTime(null);
        return;
      }

      const id = getUserIdFromToken();
      if (id) {
        setUserId(id);

        // check admin status from token 
        const isAdminFromToken = checkIsAdminFromToken(token);
        setIsAdmin(isAdminFromToken);

        // Set token expiry time
        const expiryTime = getTokenExpiryTime(token);
        setTokenExpiryTime(expiryTime);

        // Check if token is already expired
        if (expiryTime && Date.now() >= expiryTime) {
          console.log('Token is expired, trying to refresh...');
          const refreshed = await refreshToken();
          if (!refreshed) {
            clearUserData();
            localStorage.removeItem('authToken');
          }
        }
      } else {
        setUserId(null);
        setIsAdmin(false);
        setSelectedCharacterState(null);
        setTokenExpiryTime(null);
      }
    };

    checkAuth();
  }, [refreshToken]);

  // Add token expiry monitoring
  useEffect(() => {
    if (!tokenExpiryTime || !userId) return;

    const timeUntilExpiry = tokenExpiryTime - Date.now();

    // If token expires in less than 5 minutes, refresh now
    if (timeUntilExpiry < 5 * 60 * 1000) {
      refreshToken();
      return;
    }

    // Set timer to refresh token when it's 80% through its lifetime
    const refreshTimer = setTimeout(() => {
      refreshToken();
    }, timeUntilExpiry * 0.8);

    // Set timer to logout when token expires (with a small buffer)
    const logoutTimer = setTimeout(() => {
      if (!tokenRefreshInProgress) {
        console.log('Token expired, logging out...');
        clearUserData();
        localStorage.removeItem('authToken');
        window.location.href = '/login?session=expired';
      }
    }, timeUntilExpiry - 10000); // 10 seconds before expiry

    return () => {
      clearTimeout(refreshTimer);
      clearTimeout(logoutTimer);
    };
  }, [tokenExpiryTime, userId, refreshToken, tokenRefreshInProgress]);

  // Load characters when userId or dataVersion changes
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
  }, [userId, dataVersion]); // Added dataVersion as dependency

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
    setIsAdmin(false);
    setError(null);
    setTokenExpiryTime(null);
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
        isAdmin,
        clearUserData,
        refreshData,
        refreshToken
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Export the provider for use in the app
export default UserProvider;