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

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        const storedCharacter = localStorage.getItem('selectedCharacter') ||
            sessionStorage.getItem('selectedCharacter');
        if (storedCharacter) {
            try {
                const parsedCharacter = JSON.parse(storedCharacter);
                setLocalCharacterData(parsedCharacter);
            } catch {
                setError("Invalid character data. Please select a character again.");
            }
        } else if (!selectedCharacter) {
            setError("No character selected. Please select a character.");
        }

        setLoading(false);
    }, [navigate, selectedCharacter]);

    useEffect(() => {
        if (localCharacterData && !selectedCharacter &&
            JSON.stringify(localCharacterData) !== JSON.stringify(selectedCharacter)) {
            setSelectedCharacter(localCharacterData);
        }
    }, [localCharacterData, selectedCharacter, setSelectedCharacter]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    if (loading) return <div className="dashboard loading">Loading...</div>;

    if (error) {
        return (
            <div className="dashboard error">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/characters')} className="select-character-button">
                    Select Character
                </button>
            </div>
        );
    }

    const displayCharacter = selectedCharacter || localCharacterData;
    console.log("Dashboard - Display character:", displayCharacter);

    return (
        <div className="dashboard">
            <header>
                <h1>Welcome to Your Dashboard</h1>
                <button onClick={handleLogout} className="logout-button">Logout</button>
                <button onClick={() => setShowDebugPanel(!showDebugPanel)} className="debug-toggle">
                    {showDebugPanel ? "Hide Debug Panel" : "Show Debug Panel"}
                </button>
            </header>

            {displayCharacter && (
                <div className="character-info">
                    <h2>{displayCharacter.name}</h2>
                    <p>Class: {displayCharacter.class || displayCharacter.className}</p>
                    <p>Level: {displayCharacter.level}</p>
                    <p>Health: {displayCharacter.health}</p>
                    <p>Attack Power: {displayCharacter.attackPower}</p>
                    <p>Gold: {displayCharacter.gold}</p>
                    <p>Experience: {displayCharacter.experience}</p>
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