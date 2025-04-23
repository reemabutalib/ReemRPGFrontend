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

    // Enhanced login logic with detailed logging
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear any previous errors

        console.log("Login attempt with:", { email: formData.email, password: "********" });
        console.log("Full form data:", { ...formData, password: "********" });

        try {
            // Login API call
            console.log("Making request to:", 'http://localhost:5233/api/account/login');

            const response = await axios.post('http://localhost:5233/api/account/login', formData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log("Login response status:", response.status);
            console.log("Login response headers:", response.headers);
            console.log("Login response data:", response.data);

            const token = response.data.token;

            if (!token) {
                console.error("Token missing from response:", response.data);
                throw new Error('Failed to retrieve token from login response.');
            }

            console.log("Token received and valid");

            // Store token
            localStorage.setItem('authToken', token);
            console.log("Token stored in localStorage");

            // Check if a selected character exists for this user
            const selectedCharacter = localStorage.getItem('selectedCharacter') ||
                sessionStorage.getItem('selectedCharacter');

            console.log("Selected character in storage:", selectedCharacter ? "Found" : "Not found");

            if (selectedCharacter) {
                console.log("Found existing selected character in storage");
                try {
                    const parsedCharacter = JSON.parse(selectedCharacter);
                    console.log("Parsed character:", parsedCharacter);

                    // Ensure it has both id and characterId properties
                    if (parsedCharacter.characterId && !parsedCharacter.id) {
                        parsedCharacter.id = parsedCharacter.characterId;
                    }
                    if (parsedCharacter.id && !parsedCharacter.characterId) {
                        parsedCharacter.characterId = parsedCharacter.id;
                    }

                    // Re-save with any fixes
                    localStorage.setItem('selectedCharacter', JSON.stringify(parsedCharacter));

                    // Update the user context
                    setSelectedCharacter(parsedCharacter);
                    console.log("Character set in context, navigating to dashboard");
                    navigate('/dashboard');
                } catch (parseError) {
                    console.error("Error parsing character from storage:", parseError);
                    localStorage.removeItem('selectedCharacter');
                    sessionStorage.removeItem('selectedCharacter');
                    navigate('/characters');
                }
            } else {
                console.log("No selected character found in storage");
                console.log("First login detected - redirecting to character selection");
                navigate('/characters');
            }

            /* Commenting out the problematic code that tries to fetch the character
            // Fetch selected character from backend using the correct endpoint
            try {
                const characterResponse = await axios.get('http://localhost:5233/api/character/get-selected-character', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("Character response:", characterResponse.data);

                if (characterResponse.data && Object.keys(characterResponse.data).length > 0) {
                    const character = characterResponse.data;
                    console.log("Selected character found on server:", character);
                    setSelectedCharacter(character); // Update the user context
                    localStorage.setItem('selectedCharacter', JSON.stringify(character)); // Persist the selection
                    console.log("Navigating to dashboard with retrieved character");
                    navigate('/dashboard'); // Redirect to the dashboard
                } else {
                    console.log("No character selected on server, redirecting to character selection");
                    navigate('/characters'); // Redirect to character selection if no character is selected
                }
            } catch (characterError) {
                console.error("Error fetching selected character:", characterError);

                if (characterError.response) {
                    console.error("Response status:", characterError.response.status);
                    console.error("Response data:", characterError.response.data);
                }

                console.log("Redirecting to character selection due to error");
                navigate('/characters');
            }
            */
        } catch (error) {
            console.error('Login error details:', error);

            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error response status:', error.response.status);
                console.error('Error response data:', error.response.data);
                console.error('Error response headers:', error.response.headers);

                // Show the actual error message from the server if available
                if (typeof error.response.data === 'string') {
                    setError(error.response.data);
                } else if (error.response.data && error.response.data.message) {
                    setError(error.response.data.message);
                } else {
                    setError(`Login failed: ${error.response.status === 401 ? 'Invalid credentials' : 'Server error'}`);
                }
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
                setError('No response from server. Please try again later.');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Request setup error:', error.message);
                setError(`Error: ${error.message}`);
            }
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