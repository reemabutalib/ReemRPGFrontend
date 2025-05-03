import { useUser } from '@/context/userContext';
import '@/styles/AdminDashboard.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const { isAdmin } = useUser();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [characters, setCharacters] = useState([]);
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');

    // State for modal handling
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [editItem, setEditItem] = useState(null);

    // Character form state
    const [characterForm, setCharacterForm] = useState({
        name: '',
        class_: '',
        baseStrength: 1,
        baseAgility: 1,
        baseIntelligence: 1,
        imageUrl: ''
    });

    // Quest form state
    const [questForm, setQuestForm] = useState({
        title: '',
        description: '',
        experienceReward: 100,
        goldReward: 50,
        requiredLevel: 1
    });

    useEffect(() => {
        if (!isAdmin) {
            navigate('/dashboard');
            return;
        }

        fetchData();
    }, [isAdmin, navigate]);

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem('authToken');

        try {
            // Fetch users, characters, and quests in parallel
            const [usersRes, charsRes, questsRes] = await Promise.all([
                axios.get('http://localhost:5233/api/roles/users', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5233/api/character', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5233/api/quest', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            console.log('Users data:', usersRes.data);
            console.log('Characters data:', charsRes.data);
            console.log('Quests data:', questsRes.data);

            setUsers(usersRes.data || []);
            setCharacters(charsRes.data || []);
            setQuests(questsRes.data || []);
        } catch (error) {
            console.error("Error fetching admin data:", error);
            console.error("Error details:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle opening modal for creating/editing
    const handleOpenModal = (type, item = null) => {
        setModalType(type);
        setEditItem(item);

        if (item) {
            // Populate form for editing
            if (type === 'character' || type === 'editCharacter') {
                setCharacterForm({
                    name: item.name,
                    class_: item.class_,
                    baseStrength: item.baseStrength,
                    baseAgility: item.baseAgility,
                    baseIntelligence: item.baseIntelligence,
                    imageUrl: item.imageUrl || ''
                });
            } else if (type === 'quest' || type === 'editQuest') {
                setQuestForm({
                    title: item.title,
                    description: item.description || '',
                    experienceReward: item.experienceReward,
                    goldReward: item.goldReward,
                    requiredLevel: item.requiredLevel
                });
            }
        } else {
            // Reset forms for creating new items
            if (type === 'character') {
                setCharacterForm({
                    name: '',
                    class_: '',
                    baseStrength: 1,
                    baseAgility: 1,
                    baseIntelligence: 1,
                    imageUrl: ''
                });
            } else if (type === 'quest') {
                setQuestForm({
                    title: '',
                    description: '',
                    experienceReward: 100,
                    goldReward: 50,
                    requiredLevel: 1
                });
            }
        }

        setShowModal(true);
    };

    // Handle character form input changes
    const handleCharacterChange = (e) => {
        const { name, value } = e.target;
        setCharacterForm(prev => ({
            ...prev,
            [name]: name.includes('base') ? parseInt(value) : value
        }));
    };

    // Handle quest form input changes
    const handleQuestChange = (e) => {
        const { name, value } = e.target;
        setQuestForm(prev => ({
            ...prev,
            [name]: ['experienceReward', 'goldReward', 'requiredLevel'].includes(name)
                ? parseInt(value)
                : value
        }));
    };

    // Create or update a character
    const handleCharacterSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');

        try {
            // Create the properly formatted data object
            const characterData = {
                name: characterForm.name,
                Class: characterForm.class_,
                baseStrength: parseInt(characterForm.baseStrength),
                baseAgility: parseInt(characterForm.baseAgility),
                baseIntelligence: parseInt(characterForm.baseIntelligence),
                imageUrl: characterForm.imageUrl,
                baseHealth: parseInt(characterForm.baseHealth)
            };

            console.log("Sending character data:", characterData);

            if (editItem) {
                // Update existing character
                await axios.put(
                    `http://localhost:5233/api/character/${editItem.characterId}`,
                    characterData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                // Create new character
                await axios.post(
                    'http://localhost:5233/api/character',
                    characterData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            // Refresh the data and close the modal
            fetchData();
            setShowModal(false);
        } catch (error) {
            console.error("Error saving character:", error);
            if (error.response) {
                console.error("Server response:", error.response.data);
            }
            alert("Error saving character. Please check the console for details.");
        }
    };

    // Create or update a quest
    const handleQuestSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');

        try {
            // Create the properly formatted data object
            const questData = {
                title: questForm.title,
                description: questForm.description,
                experienceReward: parseInt(questForm.experienceReward),
                goldReward: parseInt(questForm.goldReward),
                requiredLevel: parseInt(questForm.requiredLevel)
            };

            console.log("Sending quest data:", questData);

            if (editItem) {
                // Update existing quest
                await axios.put(
                    `http://localhost:5233/api/quest/${editItem.questId}`,
                    questData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } else {
                // Create new quest
                await axios.post(
                    'http://localhost:5233/api/quest',
                    questData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            // Refresh the data and close the modal
            fetchData();
            setShowModal(false);
        } catch (error) {
            console.error("Error saving quest:", error);
            alert("Error saving quest. Please try again.");
        }
    };

    // Delete a character
    const handleDeleteCharacter = async (characterId) => {
        if (!window.confirm("Are you sure you want to delete this character?")) return;

        const token = localStorage.getItem('authToken');

        try {
            await axios.delete(`http://localhost:5233/api/character/${characterId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Refresh the data
            fetchData();
        } catch (error) {
            console.error("Error deleting character:", error);
            alert("Error deleting character. Please try again.");
        }
    };

    // Delete a quest
    const handleDeleteQuest = async (questId) => {
        if (!window.confirm("Are you sure you want to delete this quest?")) return;

        const token = localStorage.getItem('authToken');

        try {
            await axios.delete(`http://localhost:5233/api/quest/${questId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Refresh the data
            fetchData();
        } catch (error) {
            console.error("Error deleting quest:", error);
            alert("Error deleting quest. Please try again.");
        }
    };

    if (loading) {
        return <div className="admin-loading">Loading admin dashboard...</div>;
    }

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>

            <div className="admin-tabs">
                <button
                    className={activeTab === 'users' ? 'active' : ''}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
                <button
                    className={activeTab === 'characters' ? 'active' : ''}
                    onClick={() => setActiveTab('characters')}
                >
                    Characters
                </button>
                <button
                    className={activeTab === 'quests' ? 'active' : ''}
                    onClick={() => setActiveTab('quests')}
                >
                    Quests
                </button>
            </div>

            <div className="admin-content">
                {activeTab === 'users' && (
                    <div className="users-table">
                        <h2>User Management</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Email Verified</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.email}</td>
                                        <td>{user.emailConfirmed ? 'Yes' : 'No'}</td>
                                        <td>{user.roles?.join(', ') || 'User'}</td>
                                        <td>
                                            <button className="edit-btn">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'characters' && (
                    <div className="characters-table">
                        <div className="admin-header">
                            <h2>Character Management</h2>
                            <button
                                className="create-btn"
                                onClick={() => handleOpenModal('character')}
                            >
                                Create Character
                            </button>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Class</th>
                                    <th>Strength</th>
                                    <th>Agility</th>
                                    <th>Intelligence</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {characters.map(char => (
                                    <tr key={char.characterId}>
                                        <td>{char.name}</td>
                                        <td>{char.class_}</td>
                                        <td>{char.baseStrength}</td>
                                        <td>{char.baseAgility}</td>
                                        <td>{char.baseIntelligence}</td>
                                        <td className="action-buttons">
                                            <button
                                                className="edit-btn"
                                                onClick={() => handleOpenModal('editCharacter', char)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteCharacter(char.characterId)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'quests' && (
                    <div className="quests-table">
                        <div className="admin-header">
                            <h2>Quest Management</h2>
                            <button
                                className="create-btn"
                                onClick={() => handleOpenModal('quest')}
                            >
                                Create Quest
                            </button>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Experience</th>
                                    <th>Gold</th>
                                    <th>Required Level</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quests.map(quest => (
                                    <tr key={quest.questId}>
                                        <td>{quest.title}</td>
                                        <td>{quest.experienceReward}</td>
                                        <td>{quest.goldReward}</td>
                                        <td>{quest.requiredLevel}</td>
                                        <td className="action-buttons">
                                            <button
                                                className="edit-btn"
                                                onClick={() => handleOpenModal('editQuest', quest)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteQuest(quest.questId)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal for Creating/Editing Characters and Quests */}
            {showModal && (
                <div className="modal-backdrop">
                    <div className="admin-modal">
                        {/* Character Create/Edit Form */}
                        {(modalType === 'character' || modalType === 'editCharacter') && (
                            <>
                                <h2>{editItem ? 'Edit Character' : 'Create Character'}</h2>
                                <form onSubmit={handleCharacterSubmit}>
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={characterForm.name}
                                            onChange={handleCharacterChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Class</label>
                                        <input
                                            type="text"
                                            name="class_"
                                            value={characterForm.class_}
                                            onChange={handleCharacterChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Strength</label>
                                            <input
                                                type="number"
                                                name="baseStrength"
                                                value={characterForm.baseStrength}
                                                onChange={handleCharacterChange}
                                                min="1"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Agility</label>
                                            <input
                                                type="number"
                                                name="baseAgility"
                                                value={characterForm.baseAgility}
                                                onChange={handleCharacterChange}
                                                min="1"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Intelligence</label>
                                            <input
                                                type="number"
                                                name="baseIntelligence"
                                                value={characterForm.baseIntelligence}
                                                onChange={handleCharacterChange}
                                                min="1"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Image URL</label>
                                        <input
                                            type="text"
                                            name="imageUrl"
                                            value={characterForm.imageUrl}
                                            onChange={handleCharacterChange}
                                            placeholder="/assets/images/character.jpg"
                                        />
                                    </div>

                                    <div className="modal-buttons">
                                        <button type="button" onClick={() => setShowModal(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="save-btn">
                                            {editItem ? 'Update Character' : 'Create Character'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* Quest Create/Edit Form */}
                        {(modalType === 'quest' || modalType === 'editQuest') && (
                            <>
                                <h2>{editItem ? 'Edit Quest' : 'Create Quest'}</h2>
                                <form onSubmit={handleQuestSubmit}>
                                    <div className="form-group">
                                        <label>Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={questForm.title}
                                            onChange={handleQuestChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            value={questForm.description}
                                            onChange={handleQuestChange}
                                            rows="3"
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Experience Reward</label>
                                            <input
                                                type="number"
                                                name="experienceReward"
                                                value={questForm.experienceReward}
                                                onChange={handleQuestChange}
                                                min="1"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Gold Reward</label>
                                            <input
                                                type="number"
                                                name="goldReward"
                                                value={questForm.goldReward}
                                                onChange={handleQuestChange}
                                                min="0"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Required Level</label>
                                            <input
                                                type="number"
                                                name="requiredLevel"
                                                value={questForm.requiredLevel}
                                                onChange={handleQuestChange}
                                                min="1"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="modal-buttons">
                                        <button type="button" onClick={() => setShowModal(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="save-btn">
                                            {editItem ? 'Update Quest' : 'Create Quest'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}