import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';
import './Dashboard.css';
import { checkAndRefreshToken, debugToken } from './Utils/AuthUtils';

export default function Dashboard() {
    console.log("=== DASHBOARD COMPONENT RENDERING ===");

    const { selectedCharacter, loading, error, userId, validateCharacterOwnership } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [characterToUse, setCharacterToUse] = useState(null);
    const navigate = useNavigate();

    console.log("Dashboard - Context values:", {
        selectedCharacter,
        loading,
        error,
        userId
    });

    useEffect(() => {
        const initializeDashboard = async () => {
            // First check that we have a valid auth token
            const isAuthenticated = await checkAndRefreshToken();
            if (!isAuthenticated) {
                console.error("No valid auth token, redirecting to login");
                navigate('/login');
                return;
            }

            // Try to get the character from context first
            if (selectedCharacter) {
                console.log("Using character from context:", selectedCharacter.name);
                setCharacterToUse(selectedCharacter);
                setIsLoading(false);
                return;
            }

            // If no character in context, try user-specific storage
            if (userId) {
                const userCharacterKey = `selectedCharacter_${userId}`;
                const storedCharacterString = localStorage.getItem(userCharacterKey);

                if (storedCharacterString) {
                    try {
                        const parsedCharacter = JSON.parse(storedCharacterString);
                        console.log(`Found character in user-specific storage (${userCharacterKey}):`, parsedCharacter.name);

                        // Validate character ownership
                        const isValid = await validateCharacterOwnership(parsedCharacter.characterId);

                        if (isValid) {
                            console.log("Character ownership validated, using character");
                            setCharacterToUse(parsedCharacter);
                            setIsLoading(false);
                            return;
                        } else {
                            console.warn("Character validation failed, clearing stored character");
                            localStorage.removeItem(userCharacterKey);
                        }
                    } catch (e) {
                        console.error("Error parsing stored character:", e);
                        localStorage.removeItem(userCharacterKey);
                    }
                }
            }

            // Fallback to the generic storage (for backward compatibility)
            const genericStoredCharacter = localStorage.getItem('selectedCharacter');
            if (genericStoredCharacter) {
                try {
                    const parsedCharacter = JSON.parse(genericStoredCharacter);
                    console.log("Found character in generic storage:", parsedCharacter.name);

                    // Only use if we have a userId to validate against
                    if (userId) {
                        // Validate character ownership
                        const isValid = await validateCharacterOwnership(parsedCharacter.characterId);

                        if (isValid) {
                            console.log("Character ownership validated from generic storage");

                            // Save to user-specific storage for next time
                            if (userId) {
                                const userCharacterKey = `selectedCharacter_${userId}`;
                                localStorage.setItem(userCharacterKey, genericStoredCharacter);
                                console.log(`Saved character to user-specific storage (${userCharacterKey})`);
                            }

                            setCharacterToUse(parsedCharacter);
                            setIsLoading(false);
                            return;
                        } else {
                            console.warn("Character from generic storage failed validation");
                            localStorage.removeItem('selectedCharacter');
                        }
                    } else {
                        console.warn("Cannot validate character without userId");
                    }
                } catch (e) {
                    console.error("Error parsing generic stored character:", e);
                    localStorage.removeItem('selectedCharacter');
                }
            }

            // If we get here, we couldn't find a valid character
            console.warn("No valid character found in any storage");
            setCharacterToUse(null);
            setIsLoading(false);

            // Redirect to character selection if we have no valid character
            setTimeout(() => {
                navigate('/characters');
            }, 500);
        };

        initializeDashboard();
    }, [selectedCharacter, userId, navigate, validateCharacterOwnership]);

    // Simplified Dashboard with minimal styling
    return (
        <div style={{
            padding: '20px',
            maxWidth: '800px',
            margin: '0 auto',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
            {/* Testing message - always visible */}
            <div style={{
                padding: '10px',
                backgroundColor: '#e7f9ff',
                borderRadius: '4px',
                marginBottom: '20px',
                border: '1px solid #cce5ff'
            }}>
                <h3>Dashboard is rendering correctly!</h3>
                <p style={{ fontSize: '12px', color: '#666' }}>
                    User ID: {userId || 'Not available'} •
                    Character: {characterToUse ? characterToUse.name : 'None'} •
                    Loading: {isLoading ? 'True' : 'False'}
                </p>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Loading character data...</p>
                </div>
            ) : !characterToUse ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <h2>No Character Selected</h2>
                    <p>Please select a character to view your dashboard.</p>
                    <button
                        onClick={() => navigate('/characters')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        Go to Characters
                    </button>
                </div>
            ) : (
                <>
                    <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
                        {characterToUse.name}'s Dashboard
                    </h1>

                    <div style={{
                        backgroundColor: '#f0f7ff',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '20px',
                        border: '1px solid #cce5ff'
                    }}>
                        <h2>Character Stats</h2>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-around',
                            marginTop: '15px'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontWeight: 'bold' }}>Class</p>
                                <p>{characterToUse.class}</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontWeight: 'bold' }}>Level</p>
                                <p>{characterToUse.level}</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontWeight: 'bold' }}>Health</p>
                                <p>{characterToUse.health}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'center',
                        marginTop: '20px'
                    }}>
                        <button
                            onClick={() => navigate('/quests')}
                            style={{
                                backgroundColor: '#3498db',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            View Quests
                        </button>
                        <button
                            onClick={() => navigate('/characters')}
                            style={{
                                backgroundColor: '#2ecc71',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Change Character
                        </button>
                    </div>
                </>
            )}

            {/* Debug information in development mode */}
            {import.meta.env.MODE !== 'production' && (
                <div style={{
                    marginTop: '30px',
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#666',
                    border: '1px dashed #ccc'
                }}>
                    <p><strong>Debug Info:</strong></p>
                    <p>UserId: {userId || 'None'}</p>
                    <p>Character ID: {characterToUse ? characterToUse.characterId : 'None'}</p>
                    <p>Context Loading: {loading ? 'True' : 'False'}</p>
                    <p>Local Loading: {isLoading ? 'True' : 'False'}</p>
                    <button
                        onClick={() => {
                            const tokenInfo = debugToken();
                            console.log('Token Debug:', tokenInfo);
                            alert(`Token valid: ${tokenInfo.valid ? 'Yes' : 'No'}\nExpiry: ${tokenInfo.expiry || 'Unknown'}\nCheck console for details.`);
                        }}
                        style={{ background: '#ffcc00', padding: '2px 5px', fontSize: '10px' }}
                    >
                        Debug Token
                    </button>
                </div>
            )}
        </div>
    );
}