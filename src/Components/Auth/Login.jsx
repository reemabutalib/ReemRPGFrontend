import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from "../../context/userContext";
import './Login.css';

export default function Login() {
    const navigate = useNavigate();
    const { setSelectedCharacter } = useUser();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState(null); // State to handle errors

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Existing login logic with added character persistence
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear any previous errors

        try {
            // Login API call
            const response = await axios.post('http://localhost:5233/api/account/login', formData);
            const token = response.data.token;

            if (!token) {
                throw new Error('Failed to retrieve token from login response.');
            }

            // Store token
            localStorage.setItem('authToken', token);

            // Check if a selected character exists for this user
            const selectedCharacter = localStorage.getItem('selectedCharacter');
            if (selectedCharacter) {
                setSelectedCharacter(JSON.parse(selectedCharacter)); // Update the user context
                navigate('/dashboard'); // Redirect to dashboard
            } else {
                // Fetch selected character from backend
                const characterResponse = await axios.get('http://localhost:5233/api/character/get-selected-character', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (characterResponse.data) {
                    const character = characterResponse.data;
                    setSelectedCharacter(character); // Update the user context
                    localStorage.setItem('selectedCharacter', JSON.stringify(character)); // Persist the selection
                    navigate('/dashboard'); // Redirect to the dashboard
                } else {
                    navigate('/characters'); // Redirect to character selection if no character is selected
                }
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError('Invalid email or password. Please try again.');
        }
    };
    return (
        <div className="login">
            <h1>Login</h1>
            <form onSubmit={handleSubmit} className="login-form">
                {error && <div className="error-message">{error}</div>} {/* Show error message if exists */}
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="login-button">
                    Login
                </button>
            </form>
        </div>
    );
}