import axios from 'axios';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { debugToken } from '../Components/Utils/AuthUtils';

// Default context remains the same
const defaultContext = {
  selectedCharacter: null,
  setSelectedCharacter: () => { },
  favorites: [],
  toggleFavorite: () => { },
  hasSelectedCharacter: () => false,
  characters: [],
  setCharacters: () => { },
  loading: true,
  error: null,
  clearUserData: () => { },
  validateCharacterOwnership: () => Promise.resolve(false),
  userId: null,
  debugStoredCharacters: () => { }
};

const UserContext = createContext(defaultContext);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [selectedCharacter, setSelectedCharacterState] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Use ref instead of state for interval to avoid re-renders
  const intervalRef = useRef(null);

  // Track if we're on a public route where token checks aren't needed
  const isPublicPage = window.location.pathname === '/login' ||
    window.location.pathname === '/register' ||
    window.location.pathname === '/' ||
    window.location.pathname === '/home';

  // Get user-specific storage key
  const getUserCharacterKey = (id) => {
    return `selectedCharacter_${id || userId}`;
  };

  // Extract userId from token
  const extractUserIdFromToken = (token) => {
    if (!token) {
      // Only log on protected pages to avoid spam
      if (!isPublicPage) {
        console.log("Cannot extract userId: No token provided");
      }
      return null;
    }

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));

      // Only log on protected pages
      if (!isPublicPage) {
        console.log("Token payload:", payload);
      }

      // Try JWT claim fields
      let id = null;
      if (payload.nameid) id = payload.nameid;
      else if (payload.sub) id = payload.sub;
      else if (payload.userId) id = payload.userId;
      else if (payload.id) id = payload.id;
      else if (payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"])
        id = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

      if (!id) {
        // Look for any claim containing 'id' or 'user'
        const possibleIdClaims = Object.entries(payload).filter(([key, val]) =>
          (key.toLowerCase().includes('id') || key.toLowerCase().includes('user')) &&
          typeof val === 'string' &&
          val.length > 0
        );

        if (possibleIdClaims.length > 0) {
          id = possibleIdClaims[0][1];
        }
      }

      if (id) {
        console.log("✅ Found user ID in token:", id);
        return id;
      } else {
        // Only log errors on protected pages
        if (!isPublicPage) {
          console.error("❌ NO USER ID FOUND IN TOKEN!");
        }
        return null;
      }
    } catch (err) {
      // Only log errors on protected pages
      if (!isPublicPage) {
        console.error('Error parsing token:', err);
      }
      return null;
    }
  };

  // Validate character ownership against the backend
  const validateCharacterOwnership = async (characterId) => {
    if (!characterId) {
      console.error('No character ID provided for validation');
      return false;
    }

    let currentUserId = userId;
    const token = localStorage.getItem('authToken');

    // If no userId in context, try to extract it from token
    if (!currentUserId && token) {
      console.log("No userId in context, extracting from token for validation");
      currentUserId = extractUserIdFromToken(token);

      // Update context state with the extracted userId
      if (currentUserId) {
        console.log("Setting extracted userId in context:", currentUserId);
        setUserId(currentUserId);
      }
    }

    if (!currentUserId) {
      console.error('No user ID available for character validation');
      return false;
    }

    if (!token) {
      console.error('No auth token available for validation');
      return false;
    }

    console.log(`Validating character ownership: characterId=${characterId}, userId=${currentUserId}`);

    try {
      const response = await axios.get(
        `http://localhost:5233/api/character/${characterId}/validate`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const isOwner = response.data?.isOwner === true;
      console.log(`Character ownership validation result: ${isOwner}`);

      return isOwner;
    } catch (error) {
      console.error('Error validating character ownership:', error.response?.data || error.message);
      return false;
    }
  };

  // FIX: Properly handle token check and avoid infinite loops
  useEffect(() => {
    const checkTokenAndExtractUserId = () => {
      // Skip token checks on public pages to reduce console spam
      if (isPublicPage) {
        return null;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        // Only log once per interval, not continuously
        console.log('Token check: No auth token found');
        setUserId(null);
        return null;
      }

      const extractedId = extractUserIdFromToken(token);

      if (extractedId && extractedId !== userId) {
        console.log(`UserId changed from ${userId} to ${extractedId}`);
        setUserId(extractedId);

        // Load character for this user if we have a loadStoredCharacterForUser function
        if (typeof loadStoredCharacterForUser === 'function') {
          loadStoredCharacterForUser(extractedId);
        }
        return extractedId;
      }

      return extractedId || userId;
    };

    // Initial check (only once)
    checkTokenAndExtractUserId();

    // Set up interval only if not already set
    if (!intervalRef.current) {
      // Use a longer interval (30 seconds) to reduce console spam
      intervalRef.current = setInterval(() => {
        checkTokenAndExtractUserId();
      }, 30000);

      // Clean up on unmount
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }

    // Return empty cleanup function if interval was already set
    return () => { };
  }, [isPublicPage, userId]); // Added userId to dependencies

  // Load stored character for specific user 
  const loadStoredCharacterForUser = async (id) => {
    if (!id) {
      console.log("Cannot load stored character: No user ID provided");
      return;
    }

    try {
      const userCharacterKey = getUserCharacterKey(id);
      const storedCharacter = localStorage.getItem(userCharacterKey);

      if (storedCharacter) {
        const parsedCharacter = JSON.parse(storedCharacter);
        console.log(`Found stored character for user ${id}:`, parsedCharacter.name);

        // Validate character ownership with backend
        const isValid = await validateCharacterOwnership(parsedCharacter.characterId);

        if (isValid) {
          console.log('Character ownership validated, setting selected character');
          setSelectedCharacterState(parsedCharacter);
        } else {
          console.log('Stored character failed ownership validation, clearing selection');
          localStorage.removeItem(userCharacterKey);
          setSelectedCharacterState(null);
        }
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
    // Skip if we're on a public page
    if (isPublicPage) {
      setLoading(false);
      return;
    }

    if (!userId) {
      // Try once more to get userId from token
      const token = localStorage.getItem('authToken');
      if (token) {
        const extractedId = extractUserIdFromToken(token);
        if (extractedId) {
          setUserId(extractedId);
          return; // The next effect run will load characters
        }
      }

      setLoading(false);
      return;
    }

    const fetchCharacters = async () => {
      console.log('Fetching characters for user:', userId);
      setLoading(true);

      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('No token available for API request');
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5233/api/character', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (Array.isArray(response.data)) {
          if (response.data.length > 0) {
            console.log('Characters loaded from API:', response.data.length);
            setCharacters(response.data);

            // Try to recover selected character from localStorage
            const userCharacterKey = getUserCharacterKey();
            const storedCharacter = localStorage.getItem(userCharacterKey);

            if (storedCharacter) {
              try {
                const parsedCharacter = JSON.parse(storedCharacter);
                console.log('Found stored character:', parsedCharacter.name);

                // Validate with backend
                const isValid = await validateCharacterOwnership(parsedCharacter.characterId);

                if (isValid) {
                  // Find the latest version from API response
                  const latestCharacter = response.data.find(
                    c => String(c.characterId) === String(parsedCharacter.characterId)
                  );

                  if (latestCharacter) {
                    setSelectedCharacterState(latestCharacter);
                    localStorage.setItem(userCharacterKey, JSON.stringify(latestCharacter));
                  } else {
                    setSelectedCharacterState(parsedCharacter);
                  }
                } else {
                  // Select first character if stored one fails validation
                  setSelectedCharacterState(response.data[0]);
                  localStorage.setItem(userCharacterKey, JSON.stringify(response.data[0]));
                }
              } catch (parseError) {
                console.error('Error parsing stored character:', parseError);
                setSelectedCharacterState(response.data[0]);
                localStorage.setItem(userCharacterKey, JSON.stringify(response.data[0]));
              }
            } else if (response.data.length > 0) {
              // No stored character, select first one
              setSelectedCharacterState(response.data[0]);
              localStorage.setItem(userCharacterKey, JSON.stringify(response.data[0]));
            }
          } else {
            // No characters
            console.log('No characters returned from API');
            setCharacters([]);
            setSelectedCharacterState(null);
            setError('You have no characters. Please create one.');
          }
        } else {
          console.error('Invalid API response format');
          setCharacters([]);
          setError('Invalid response from server');
        }
      } catch (err) {
        console.error('Error fetching characters:', err);
        setCharacters([]);
        setError(`Failed to load characters: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [userId, isPublicPage]);

  // Store selected character in localStorage whenever it changes
  useEffect(() => {
    if (selectedCharacter && userId) {
      const userCharacterKey = getUserCharacterKey();
      console.log(`Storing selected character for user ${userId}:`, selectedCharacter.name);
      localStorage.setItem(userCharacterKey, JSON.stringify(selectedCharacter));

      // Also update the generic key for backwards compatibility
      localStorage.setItem('selectedCharacter', JSON.stringify(selectedCharacter));
    }
  }, [selectedCharacter, userId]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const hasSelectedCharacter = () => !!selectedCharacter;

  // Character selection with validation
  const setSelectedCharacter = async (character) => {
    if (!character) {
      console.error('Attempted to select undefined/null character');
      return false;
    }

    // If no userId in context, try to extract it from token
    if (!userId) {
      const token = localStorage.getItem('authToken');
      if (token) {
        const extractedId = extractUserIdFromToken(token);
        if (extractedId) {
          setUserId(extractedId);
        } else {
          console.error('Cannot select character: Failed to extract user ID from token');
          return false;
        }
      } else {
        console.error('Cannot select character: No auth token available');
        return false;
      }
    }

    console.log('Selecting character:', character.name);

    try {
      // Validate with backend endpoint
      const isValid = await validateCharacterOwnership(character.characterId);

      if (isValid) {
        // Use user-specific storage key
        const userCharacterKey = getUserCharacterKey();
        localStorage.setItem(userCharacterKey, JSON.stringify(character));

        // Also for backwards compatibility
        localStorage.setItem('selectedCharacter', JSON.stringify(character));

        setSelectedCharacterState(character);
        return true;
      } else {
        console.error('Character ownership validation failed');

        // Fall back to another character if available
        if (characters.length > 0) {
          const firstChar = characters[0];

          const userCharacterKey = getUserCharacterKey();
          localStorage.setItem(userCharacterKey, JSON.stringify(firstChar));
          localStorage.setItem('selectedCharacter', JSON.stringify(firstChar));

          setSelectedCharacterState(firstChar);
          return true;
        }

        return false;
      }
    } catch (error) {
      console.error('Error during character selection:', error);
      return false;
    }
  };

  // Clear user data on logout
  const clearUserData = () => {
    console.log('Clearing user-specific data');

    // Clear character data
    if (userId) {
      const userCharacterKey = getUserCharacterKey();
      localStorage.removeItem(userCharacterKey);
    }

    setSelectedCharacterState(null);
    setCharacters([]);
    setUserId(null);

    localStorage.removeItem('selectedCharacter');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');

    // Clear any other user-specific storage
    if (userId) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(userId)) {
          localStorage.removeItem(key);
          i--; // Adjust index since we removed an item
        }
      }
    }
  };

  // Debug function
  const debugStoredCharacters = () => {
    console.log('==== DEBUGGING STORED CHARACTERS ====');

    console.log('Current userId in context:', userId);
    console.log('Current selectedCharacter in context:', selectedCharacter);

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('selectedCharacter')) {
        try {
          const value = localStorage.getItem(key);
          const character = JSON.parse(value);
          console.log(`${key}:`, character.name, `(ID: ${character.characterId})`);
        } catch (err) {
          console.log(`${key}: [parse error - ${err.message}]`);
        }
      }
    }

    const token = localStorage.getItem('authToken');
    if (token) {
      console.log('Attempting to extract userId from current token...');
      const extractedId = extractUserIdFromToken(token);
      console.log('Extracted userId:', extractedId);
    }

    const tokenInfo = debugToken();
    console.log('Token info:', tokenInfo);

    console.log('====================================');
  };

  return (
    <UserContext.Provider
      value={{
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
        debugStoredCharacters,
        validateCharacterOwnership
      }}
    >
      {children}
    </UserContext.Provider>
  );
};