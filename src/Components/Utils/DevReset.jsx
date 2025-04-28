import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DevReset() {
    const navigate = useNavigate();
    const [status, setStatus] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    // Function that clears all frontend storage
    const clearFrontendStorage = () => {
        // Clear localStorage
        localStorage.clear();

        // Clear sessionStorage
        sessionStorage.clear();

        // Clear cookies
        document.cookie.split(";").forEach(cookie => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });

        return true;
    };

    // Reset function that handles both frontend and attempts backend reset
    const resetEverything = async () => {
        if (!window.confirm('WARNING: This will delete ALL data. Continue?')) {
            return;
        }

        setIsResetting(true);
        setStatus('Clearing frontend storage...');

        // First clear frontend storage
        clearFrontendStorage();

        // Try to reset backend
        try {
            setStatus('Attempting backend reset...');
            const password = prompt('Enter dev reset password (dev-reset-123):') || 'dev-reset-123';

            // Try the primary endpoint
            try {
                await axios.post('http://localhost:5233/api/dev/reset', { Token: password });
                setStatus('✅ Backend reset successful!');
            } catch (error) {
                console.error('Primary endpoint failed:', error.message || 'Unknown error');
                // Try alternate endpoints as fallbacks
                try {
                    await axios.post('http://localhost:5233/api/Dev/reset', { Token: password });
                    setStatus('✅ Alternate endpoint 1 successful!');
                } catch (err) {
                    console.error('Alternate endpoint 1 failed:', err.message || 'Unknown error');
                    try {
                        await axios.post('http://localhost:5233/dev/reset', { Token: password });
                        setStatus('✅ Alternate endpoint 2 successful!');
                    } catch {
                        setStatus('⚠️ Backend reset failed, but frontend was cleared.');
                    }
                }
            }
        } catch (error) {
            console.error('Reset error:', error);
            setStatus('⚠️ Backend reset failed, but frontend was cleared.');
        } finally {
            // Always redirect after a short delay
            setTimeout(() => {
                window.location.href = '/login'; // Full page reload
            }, 2000);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h1>Development Reset Tool</h1>

            {status && (
                <div style={{
                    padding: '10px',
                    margin: '15px 0',
                    backgroundColor: status.includes('✅') ? '#d1e7dd' : '#cfe2ff',
                    borderRadius: '4px'
                }}>
                    {status}
                </div>
            )}

            <div style={{ marginBottom: '20px' }}>
                <p>This will reset your application to a clean state:</p>
                <ul>
                    <li>Clear all browser storage (localStorage, sessionStorage, cookies)</li>
                    <li>Attempt to reset the backend database (characters, quests, etc.)</li>
                    <li>Redirect to the login page</li>
                </ul>
            </div>

            <button
                onClick={resetEverything}
                disabled={isResetting}
                style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isResetting ? 'not-allowed' : 'pointer',
                    opacity: isResetting ? 0.7 : 1
                }}
            >
                {isResetting ? 'Resetting...' : 'Reset Everything'}
            </button>

            <button
                onClick={() => navigate('/')}
                style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    marginLeft: '10px'
                }}
            >
                Cancel
            </button>

            <hr style={{ margin: '20px 0' }} />

            <h3>Manual Reset Instructions:</h3>
            <ol>
                <li>Run this command in SQLite:</li>
                <pre style={{ background: '#f1f1f1', padding: '10px', overflowX: 'auto' }}>
                    DELETE FROM QuestCompletions;
                    DELETE FROM UserCharacters;
                    DELETE FROM Characters;
                </pre>
                <li>Clear browser storage (Application tab in DevTools)</li>
                <li>Register a new user account</li>
            </ol>
        </div>
    );
}