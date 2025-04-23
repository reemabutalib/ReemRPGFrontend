import axios from "axios";
import { useEffect, useState } from "react";
import "./Leaderboard.css";

const LeaderboardRow = ({ rank, player, isCurrentUser }) => {
    return (
        <div className={`leaderboard-row ${isCurrentUser ? 'current-user' : ''}`}>
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
                    <span className="stat-label">Level</span>
                    <span className="stat-value">{player.level || 1}</span>
                </div>
                <div className="stat">
                    <span className="stat-label">XP</span>
                    <span className="stat-value">{player.experience.toLocaleString()}</span>
                </div>
                <div className="stat">
                    <span className="stat-label">Gold</span>
                    <span className="stat-value">{player.gold.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

const Leaderboard = ({ currentUserId, isHomepage = false }) => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterBy, setFilterBy] = useState("experience"); // Default sort by experience

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = localStorage.getItem('authToken');

                // Set up headers based on authentication status
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const response = await axios.get(
                    `http://localhost:5233/api/leaderboard?sortBy=${filterBy}`,
                    { headers }
                );

                setLeaders(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
                setError("Failed to load leaderboard data. Please try again later.");
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [filterBy]);

    const handleFilterChange = (e) => {
        setFilterBy(e.target.value);
        setLoading(true); // Show loading state while we fetch new data
    };

    if (loading) {
        return (
            <div className={`leaderboard ${isHomepage ? 'homepage-leaderboard' : ''}`}>
                <h1>Leaderboard</h1>
                <div className="leaderboard-loading">
                    <div className="spinner"></div>
                    <p>Loading top players...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`leaderboard ${isHomepage ? 'homepage-leaderboard' : ''}`}>
                <h1>Leaderboard</h1>
                <div className="leaderboard-error">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`leaderboard ${isHomepage ? 'homepage-leaderboard' : ''}`}>
            <h1>Top Players</h1>

            <div className="filter-controls">
                <label>
                    Sort by:
                    <select value={filterBy} onChange={handleFilterChange}>
                        <option value="experience">Experience</option>
                        <option value="level">Level</option>
                        <option value="gold">Gold</option>
                        <option value="quests">Quests Completed</option>
                    </select>
                </label>
            </div>

            <div className="leaderboard-table">
                <div className="leaderboard-header">
                    <div className="rank">Rank</div>
                    <div className="player-info">Player</div>
                    <div className="player-stats">
                        <div className="stat">Level</div>
                        <div className="stat">XP</div>
                        <div className="stat">Gold</div>
                    </div>
                </div>

                {leaders.length === 0 ? (
                    <div className="no-data">No players found</div>
                ) : (
                    leaders.map((player, index) => (
                        <LeaderboardRow
                            key={player.id || player.characterId || index}
                            rank={index + 1}
                            player={player}
                            isCurrentUser={currentUserId && (player.id === currentUserId || player.characterId === currentUserId)}
                        />
                    ))
                )}
            </div>

            {isHomepage && (
                <div className="leaderboard-footer">
                    <p>Create an account to join the leaderboard!</p>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;