import '@/styles/Home.css';
import { useState } from 'react';
import { useNavigate } from 'react-router';
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
    const [filterBy, setFilterBy] = useState("experience");

    // Jumbled mock data for leaderboard - different players excel in different areas
    const mockLeaders = [
        {
            id: 1,
            name: "Arthas",
            class: "Warrior",
            level: 25,          // 5th highest level
            experience: 38000,  // Highest XP
            gold: 9200          // 7th highest gold
        },
        {
            id: 2,
            name: "Jaina",
            class: "Mage",
            level: 24,          // 6th highest level
            experience: 28500,  // 3rd highest XP
            gold: 12800         // 3rd highest gold
        },
        {
            id: 3,
            name: "Thrall",
            class: "Shaman",
            level: 27,          // 3rd highest level
            experience: 25000,  // 5th highest XP
            gold: 9500          // 6th highest gold
        },
        {
            id: 4,
            name: "Sylvanas",
            class: "Ranger",
            level: 22,          // 7th highest level
            experience: 22000,  // 6th highest XP 
            gold: 18200         // Highest gold
        },
        {
            id: 5,
            name: "Uther",
            class: "Paladin",
            level: 29,          // 2nd highest level
            experience: 20000,  // 7th highest XP
            gold: 7800          // 8th highest gold
        },
        {
            id: 6,
            name: "Ezra",
            class: "Mage",
            level: 21,          // 8th highest level
            experience: 26800,  // 4th highest XP
            gold: 16200         // 2nd highest gold
        },
        {
            id: 7,
            name: "Varian",
            class: "Warrior",
            level: 31,          // Highest level
            experience: 18500,  // 9th highest XP
            gold: 5800          // 9th highest gold
        },
        {
            id: 8,
            name: "Tyrande",
            class: "Priest",
            level: 19,          // 9th highest level
            experience: 31000,  // 2nd highest XP
            gold: 4200          // 10th highest gold
        },
        {
            id: 9,
            name: "Malfurion",
            class: "Druid",
            level: 26,          // 4th highest level
            experience: 17800,  // 10th highest XP
            gold: 10700         // 5th highest gold
        },
        {
            id: 10,
            name: "Gul'dan",
            class: "Warlock",
            level: 18,          // 10th highest level
            experience: 19500,  // 8th highest XP
            gold: 11200         // 4th highest gold
        }
    ];

    // Sort leaderboard based on selected filter
    const getSortedLeaders = () => {
        const sortedLeaders = [...mockLeaders];
        if (filterBy === "level") {
            return sortedLeaders.sort((a, b) => b.level - a.level);
        } else if (filterBy === "gold") {
            return sortedLeaders.sort((a, b) => b.gold - a.gold);
        } else {
            // Default to experience
            return sortedLeaders.sort((a, b) => b.experience - a.experience);
        }
    };

    // Get the sorted leaders
    const leaders = getSortedLeaders();

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
                    <button
                        className="cta-button secondary"
                        onClick={() => navigate('/login')}
                    >
                        Continue Your Journey
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
                    <div className="leaderboard-notice info">
                        <p className="mock-data-notice">
                            This is demo data for preview purposes.
                        </p>
                    </div>

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