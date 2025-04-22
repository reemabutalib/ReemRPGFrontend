import { useNavigate } from "react-router";
import { useUser } from "../context/userContext";
import './Dashboard.css';

export default function Dashboard() {
    const { selectedCharacter } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear user-related data from localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('selectedCharacter');

        // Redirect to login page
        navigate('/login');
    };

    if (!selectedCharacter) {
        // Redirect to character selection if no character is selected
        navigate('/characters');
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <button className="logout-button" onClick={handleLogout}>
                    Log Out
                </button>
            </div>
            <h1>Dashboard</h1>
            {selectedCharacter && (
                <div className="character-info">
                    <h2>Welcome, {selectedCharacter.name}!</h2>
                    <p>Class: {selectedCharacter.class}</p>
                    <button onClick={() => navigate('/quests')}>Start a Quest</button>
                    <button onClick={() => navigate('/characters')}>Change Character</button>
                </div>
            )}
        </div>
    );
}