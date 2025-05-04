const mockData = {
    users: [
        { id: 1, name: "Alice", role: "Warrior" },
        { id: 2, name: "Bob", role: "Mage" },
        { id: 3, name: "Charlie", role: "Archer" },
    ],
    items: [
        { id: 1, name: "Sword", type: "Weapon", damage: 15 },
        { id: 2, name: "Staff", type: "Weapon", damage: 10 },
        { id: 3, name: "Bow", type: "Weapon", damage: 12 },
    ],
    quests: [
        { id: 1, title: "Defeat the Dragon", reward: "100 Gold" },
        { id: 2, title: "Find the Lost Artifact", reward: "50 Gold" },
        { id: 3, title: "Rescue the Villagers", reward: "75 Gold" },
    ],
};

export default mockData;