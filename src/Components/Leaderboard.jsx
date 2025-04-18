import axios from "axios";
import { useEffect, useState } from "react";
import "./Leaderboard.css";

const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get("http://localhost:5233/api/leaderboard");
                setLeaders(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) return <div>Loading leaderboard...</div>;

    return (
        <div className="leaderboard">
            <h1>Leaderboard</h1>
            <ul>
                {leaders.map((user, index) => (
                    <li key={user.id}>
                        {index + 1}. {user.name} - {user.xp} XP
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;