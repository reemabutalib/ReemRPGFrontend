import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import './Home.css';
// @ts-ignore
import logo from "@/assets/images/ReemRPGlogo.png";
import home_header from "@/assets/images/home_header.jpg";

// Leaderboard Row Component
const LeaderboardRow = ({ rank, player }) => {
    return (
        <div className="leaderboard-row">
            <div className="rank">
                {rank <= 3 ? (
                    <span className={`trophy rank-${rank}`}>
                        {rank === 1 ? '🏆' : rank === 2 ? '🥈' : '🥉'}
                    </span>
                ) : (
                    <span className="rank-number">{rank}</span>
                )}
            </div>
            <div className="player-info">
                <span className="player-name">{player.name}</span>
                <span className="player-class">{player.class || player.className || 'Adventurer'}</span>
            </div>
            <div className="player-stats">
                <div className="stat">
                    <span className="stat-value">{player.level || 1}</span>
                    <span className="stat-label">Level</span>
                </div>
                <div className="stat">
                    <span className="stat-value">{player.experience?.toLocaleString() || '0'}</span>
                    <span className="stat-label">XP</span>
                </div>
                <div className="stat">
                    <span className="stat-value">{player.gold?.toLocaleString() || '0'}</span>
                    <span className="stat-label">Gold</span>
                </div>
            </div>
        </div>
    );
};

// Home Component
export default function Home() {
    const navigate = useNavigate();
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterBy, setFilterBy] = useState("experience");

    // mock data for testing:
    const mockLeaders = [
        {
            id: 1,
            name: "Arthas",
            class: "Warrior",
            level: 25,
            experience: 35000,
            gold: 15200
        },
        {
            id: 2,
            name: "Jaina",
            class: "Mage",
            level: 22,
            experience: 28500,
            gold: 12800
        },
        {
            id: 3,
            name: "Thrall",
            class: "Shaman",
            level: 20,
            experience: 25000,
            gold: 9500
        },
        {
            id: 4,
            name: "Sylvanas",
            class: "Ranger",
            level: 18,
            experience: 20000,
            gold: 8200
        },
        {
            id: 5,
            name: "Uther",
            class: "Paladin",
            level: 17,
            experience: 18000,
            gold: 7800
        },
        {
            id: 6,
            name: "Ezra",
            class: "Mage",
            level: 15,
            experience: 15800,
            gold: 6200
        },
        {
            id: 7,
            name: "Varian",
            class: "Warrior",
            level: 14,
            experience: 12500,
            gold: 5800
        },
        {
            id: 8,
            name: "Tyrande",
            class: "Priest",
            level: 13,
            experience: 11000,
            gold: 5200
        },
        {
            id: 9,
            name: "Malfurion",
            class: "Druid",
            level: 12,
            experience: 9800,
            gold: 4700
        },
        {
            id: 10,
            name: "Gul'dan",
            class: "Warlock",
            level: 10,
            experience: 8500,
            gold: 4200
        }
    ];

    // In your useEffect, change this section of code:
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                setError(null);

                // Debug the request URL
                const requestUrl = `http://localhost:5233/api/leaderboard?sortBy=${filterBy}`;
                console.log("Fetching leaderboard from:", requestUrl);

                const response = await axios.get(requestUrl);

                console.log("Leaderboard response:", response.data);

                // Check if the data is an array before setting
                if (Array.isArray(response.data)) {
                    setLeaders(response.data);
                } else {
                    console.error("Unexpected data format:", response.data);
                    // Use mock data instead of showing an error
                    loadMockData(); // Renamed from useDefaultData
                }
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
                console.log("Using mock leaderboard data");
                loadMockData(); // Renamed from useDefaultData
            } finally {
                setLoading(false);
            }
        };

        // Rename the function from useDefaultData to loadMockData
        const loadMockData = () => {
            // Sort mock data based on filterBy parameter
            let sortedMockData = [...mockLeaders];
            if (filterBy === "level") {
                sortedMockData.sort((a, b) => b.level - a.level);
            } else if (filterBy === "gold") {
                sortedMockData.sort((a, b) => b.gold - a.gold);
            } else {
                // Default to experience
                sortedMockData.sort((a, b) => b.experience - a.experience);
            }

            // Set the leaders to the mock data
            setLeaders(sortedMockData);
            setError("demo");
        };

        fetchLeaderboard();
    }, [filterBy]);

    return (
        <main className="home">
            <header className="home-header">
                <img
                    src={logo}
                    alt="Reem RPG Logo"
                    className="home-logo"
                    onClick={() => navigate('/')}
                />
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <img
                    src={home_header}
                    alt="Header"
                    className="header-image"
                />
                <div className="hero-overlay">
                    <h1>Begin Your Adventure</h1>
                    <p>Create your character, complete quests, and rise to greatness</p>
                    <button
                        className="cta-button"
                        onClick={() => navigate('/register')}
                    >
                        Start Your Journey
                    </button>
                </div>
            </section>

            {/* Welcome Section */}
            <section className="welcome-section">
                <h2>Welcome to the Reem RPG Experience</h2>
                <p>Embark on an epic journey, create your character, and explore a world full of quests and adventures.</p>

                <div className="features">
                    <div className="feature">
                        <div className="feature-icon">⚔️</div>
                        <h3>Epic Quests</h3>
                        <p>Complete challenging quests to earn rewards and advance your character.</p>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">🛡️</div>
                        <h3>Choose Your Class</h3>
                        <p>Select from multiple character classes, each with unique abilities.</p>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">📈</div>
                        <h3>Level Up</h3>
                        <p>Gain experience, improve your skills, and become more powerful.</p>
                    </div>
                </div>
            </section>

            {/* Leaderboard Section */}
            <section className="leaderboard-section">
                <h2>Top Adventurers</h2>

                <div className="leaderboard-controls">
                    <span>Sort by:</span>
                    <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value)}
                        className="sort-dropdown"
                    >
                        <option value="experience">Experience</option>
                        <option value="level">Level</option>
                        <option value="gold">Gold</option>
                    </select>
                </div>

                <div className="leaderboard">
                    {loading ? (
                        <div className="leaderboard-loading">
                            <div className="spinner"></div>
                            <p>Loading top players...</p>
                        </div>
                    ) : (
                        <>
                            {error === "demo" && (
                                <div className="leaderboard-notice info">
                                    <p className="mock-data-notice">
                                        This is demo data for preview purposes.
                                    </p>
                                </div>
                            )}

                            {/* Always show the leaderboard if we have leaders */}
                            {leaders.length > 0 ? (
                                <>
                                    <div className="leaderboard-header">
                                        <div className="rank">Rank</div>
                                        <div className="player-info">Player</div>
                                        <div className="player-stats">
                                            <div className="stat">Level</div>
                                            <div className="stat">XP</div>
                                            <div className="stat">Gold</div>
                                        </div>
                                    </div>

                                    <div className="leaderboard-body">
                                        {leaders.slice(0, 10).map((player, index) => (
                                            <LeaderboardRow
                                                key={player.id || index}
                                                rank={index + 1}
                                                player={player}
                                            />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="leaderboard-empty">No adventurers yet. Be the first!</div>
                            )}
                        </>
                    )}
                </div>

                <div className="leaderboard-cta">
                    <p>Want to join the leaderboard?</p>
                    <button
                        className="cta-button secondary"
                        onClick={() => navigate('/register')}
                    >
                        Create Your Character
                    </button>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="cta-section">
                <h2>Ready to Begin Your Adventure?</h2>
                <p>Join thousands of players in the world of Reem RPG</p>
                <div className="cta-buttons">
                    <button
                        className="cta-button"
                        onClick={() => navigate('/register')}
                    >
                        Sign Up Now
                    </button>
                    <button
                        className="cta-button outline"
                        onClick={() => navigate('/login')}
                    >
                        Log In
                    </button>
                </div>
            </section>
        </main>
    );
}