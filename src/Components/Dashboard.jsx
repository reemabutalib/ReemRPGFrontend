import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';
import './Dashboard.css';

export default function Dashboard() {
    console.log("=== DASHBOARD COMPONENT RENDERING ===");

    const { selectedCharacter, loading, error } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    console.log("Dashboard - Context values:", {
        selectedCharacter,
        loading,
        error
    });

    // Fallback to localStorage if context is empty
    const storedCharacterString = localStorage.getItem('selectedCharacter');
    console.log("Dashboard - Character in localStorage:", storedCharacterString ? "EXISTS" : "NOT FOUND");

    // Try to use localStorage data if context is empty
    let characterToUse = null;

    try {
        characterToUse = selectedCharacter || (storedCharacterString ? JSON.parse(storedCharacterString) : null);
    } catch (e) {
        console.error("Error parsing stored character:", e);
    }

    console.log("Dashboard - Character to display:", characterToUse);

    useEffect(() => {
        // Give the character loading a chance to complete
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

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
        </div>
    );
}