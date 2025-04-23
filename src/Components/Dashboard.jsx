import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';
import './Dashboard.css';

// Debug controls component to help diagnose localStorage issues
function DebugControls() {
    const [status, setStatus] = useState('');

    const checkStorage = () => {
        const char = localStorage.getItem('selectedCharacter');
        const sessionChar = sessionStorage.getItem('selectedCharacter');
        setStatus(
            `localStorage: ${char ? 'Character found' : 'No character'}\n` +
            `sessionStorage: ${sessionChar ? 'Character found' : 'No character'}`
        );
    };

    const forceStoreCharacter = () => {
        const char = JSON.parse(localStorage.getItem('selectedCharacter') || sessionStorage.getItem('selectedCharacter'));
        if (char) {
            // Re-save to ensure it's stored properly
            localStorage.setItem('selectedCharacter', JSON.stringify(char));
            sessionStorage.setItem('selectedCharacter', JSON.stringify(char));
            localStorage.setItem('characterSelectedTime', new Date().toString());
            setStatus('Character re-saved to storage at ' + new Date().toString());
        } else {
            setStatus('No character to save');
        }
    };

    const clearCharacterData = () => {
        localStorage.removeItem('selectedCharacter');
        sessionStorage.removeItem('selectedCharacter');
        setStatus('Character data cleared from storage');
    };

    const testStorage = () => {
        const testValue = 'test-' + new Date().getTime();
        try {
            localStorage.setItem('storageTest', testValue);
            const retrieved = localStorage.getItem('storageTest');
            localStorage.removeItem('storageTest');

            if (retrieved === testValue) {
                setStatus('localStorage is working correctly');
            } else {
                setStatus(`localStorage test failed! Expected: ${testValue}, Got: ${retrieved}`);
            }
        } catch (err) {
            setStatus(`localStorage error: ${err.message}`);
        }
    };

    return (
        <div className="debug-panel">
            <h3>Character Storage Debug</h3>
            <div className="debug-buttons">
                <button onClick={checkStorage}>Check Storage</button>
                <button onClick={forceStoreCharacter}>Force Store Character</button>
                <button onClick={clearCharacterData}>Clear Character Data</button>
                <button onClick={testStorage}>Test Storage</button>
            </div>
            {status && <pre className="debug-status">{status}</pre>}
        </div>
    );
}

function Dashboard() {
    const navigate = useNavigate();
    const { selectedCharacter, setSelectedCharacter } = useUser();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDebugPanel, setShowDebugPanel] = useState(false);
    const [localCharacterData, setLocalCharacterData] = useState(null);

    // Update the first useEffect to address the ESLint warning
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        console.log("Dashboard - Auth token exists:", token ? "true" : "false");

        if (!token) {
            navigate('/login');
            return;
        }

        // Try to get character from localStorage/sessionStorage
        const storedCharacter = localStorage.getItem('selectedCharacter') ||
            sessionStorage.getItem('selectedCharacter');
        console.log("Dashboard - Stored character:", storedCharacter ? "Found" : "Not found");

        if (storedCharacter) {
            try {
                const parsedCharacter = JSON.parse(storedCharacter);
                console.log("Using character from localStorage");
                setLocalCharacterData(parsedCharacter); // Store in local state instead of context
                setLoading(false);
            } catch (err) {
                console.error("Error parsing stored character:", err);
                setError("Invalid character data. Please select a character again.");
                setLoading(false);
            }
        } else if (!selectedCharacter) {
            console.error("No character found in context or storage");
            setError("No character selected. Please select a character.");
            setLoading(false);
        } else {
            console.log("Using character from context");

            // Save to storage for persistence, but only if we haven't already processed this character
            try {
                // Store in local state first
                setLocalCharacterData(selectedCharacter);

                // Then save to storage
                const characterString = JSON.stringify(selectedCharacter);
                localStorage.setItem('selectedCharacter', characterString);
                sessionStorage.setItem('selectedCharacter', characterString);
            } catch (err) {
                console.error("Error saving character to storage:", err);
            }

            setLoading(false);
        }

        // Add selectedCharacter to the dependency array, but use a ref to prevent infinite loops
    }, [navigate, selectedCharacter]); // Include selectedCharacter in dependencies

    // Then modify your second useEffect to prevent the loop:
    useEffect(() => {
        // Only update context if localCharacterData exists and there's no selectedCharacter
        // AND only if they're actually different objects
        if (localCharacterData && !selectedCharacter &&
            JSON.stringify(localCharacterData) !== JSON.stringify(selectedCharacter)) {
            setSelectedCharacter(localCharacterData);
        }
    }, [localCharacterData, selectedCharacter, setSelectedCharacter]);

    // Third useEffect - handle debug panel keyboard shortcut
    useEffect(() => {
        // Press 'd' key 5 times to show debug panel
        let keyPresses = 0;
        let lastKeyTime = 0;

        const keyHandler = (e) => {
            const now = new Date().getTime();

            if (e.key === 'd') {
                // Only count keypresses within 2 seconds of each other
                if (now - lastKeyTime < 2000) {
                    keyPresses++;
                } else {
                    keyPresses = 1; // Reset if too much time passed
                }

                lastKeyTime = now;

                if (keyPresses >= 5) {
                    setShowDebugPanel(true);
                }
            } else {
                keyPresses = 0;
            }
        };

        document.addEventListener('keydown', keyHandler);
        return () => {
            document.removeEventListener('keydown', keyHandler);
        };
    }, []); // No dependencies - only run once

    const handleLogout = () => {
        console.log("Logging out from Dashboard");
        // Only clear auth token, not character
        localStorage.removeItem("authToken");
        navigate("/login");
    };

    if (loading) {
        return <div className="dashboard loading">Loading...</div>;
    }

    if (error) {
        return (
            <div className="dashboard error">
                <p>{error}</p>
                <button onClick={() => navigate('/characters')}>Select Character</button>
            </div>
        );
    }

    // Use either context character or local state character
    const displayCharacter = selectedCharacter || localCharacterData;

    return (
        <div className="dashboard">
            <header>
                <h1>Welcome to Your Dashboard</h1>
                <button onClick={handleLogout} className="logout-button">Logout</button>
            </header>

            {displayCharacter && (
                <div className="character-info">
                    <h2>{displayCharacter.name}</h2>
                    <div className="character-stats">
                        <p>Class: {displayCharacter.class || displayCharacter.className}</p>
                        <p>Level: {displayCharacter.level}</p>
                        <p>Health: {displayCharacter.health}</p>
                        <p>Attack Power: {displayCharacter.attackPower}</p>
                        <p>Gold: {displayCharacter.gold}</p>
                        <p>Experience: {displayCharacter.experience}</p>
                    </div>

                    {displayCharacter.items && displayCharacter.items.length > 0 && (
                        <div className="character-inventory">
                            <h3>Inventory</h3>
                            <ul>
                                {displayCharacter.items.map((item, index) => (
                                    <li key={item.id || index}>
                                        {item.name} - {item.description}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <div className="dashboard-actions">
                <button onClick={() => navigate('/quests')} className="adventure-button">
                    Start Adventure
                </button>
                <button onClick={() => navigate('/characters')} className="characters-button">
                    Change Character
                </button>
            </div>

            {showDebugPanel && <DebugControls />}
        </div>
    );
}

export default Dashboard;