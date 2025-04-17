import { useNavigate } from "react-router";
import { useUser } from "../context/userContext";

export default function Dashboard() {
    const navigate = useNavigate();
    const { selectedCharacter } = useUser();

    return (
        <div style={{ padding: "2rem" }}>
            <h1>Dashboard</h1>
            {selectedCharacter ? (
                <>
                    <p>🎭 Current character: {selectedCharacter.name}</p>
                    <button onClick={() => navigate("/quests")}>Go to Quests</button>
                    <button onClick={() => navigate("/characters")}>Change Character</button>
                </>
            ) : (
                <button onClick={() => navigate("/characters")}>Select a Character</button>
            )}
        </div>
    );
}
