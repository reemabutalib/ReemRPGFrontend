import { useUser } from "@/context/userContext";
import "./Inventory.css";

const Inventory = () => {
    const { selectedCharacter } = useUser();

    if (!selectedCharacter) return <div>Select a character to view inventory.</div>;

    return (
        <div className="inventory">
            <h1>{selectedCharacter.name}'s Inventory</h1>
            <ul>
                {selectedCharacter.items.map((item) => (
                    <li key={item.id}>
                        {item.name} - {item.description}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Inventory;