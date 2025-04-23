import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from "../../context/userContext";
import './Login.css';


console.log("=== LOGIN COMPONENT LOADED ===");
console.log("localStorage contents at Login load:", {
    authToken: localStorage.getItem('authToken') ? "EXISTS" : "NOT FOUND",
    selectedCharacter: localStorage.getItem('selectedCharacter')
});

export default function Login() {
    const navigate = useNavigate();
    const { setSelectedCharacter } = useUser();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Add the localStorage test here
        localStorage.setItem('testValue', 'hello');
        const testResult = localStorage.getItem('testValue');
        console.log("Simple localStorage test:", testResult === 'hello' ? "WORKING" : "FAILED");

        console.log("Login attempt with:", { email: formData.email, password: "********" });

        try {
            // Step 1: Login API call
            console.log("Making login request...");
            const response = await axios.post('http://localhost:5233/api/account/login', formData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log("Login successful:", response.status);

            const token = response.data.token;
            if (!token) {
                throw new Error('Failed to retrieve token from login response.');
            }

            // Step 2: Store token
            localStorage.setItem('authToken', token);
            console.log("Token stored in localStorage");

            // Replace the localStorage character check section with this:

            // Step 3: IMPORTANT - Check for cached character FIRST
            const localCharacter = localStorage.getItem('selectedCharacter') ||
                sessionStorage.getItem('selectedCharacter');
            console.log("Local character check:", localCharacter ? "FOUND" : "NOT FOUND");

            if (localCharacter) {
                console.log("Found cached character in localStorage");
                try {
                    const parsedCharacter = JSON.parse(localCharacter);
                    console.log("Parsed character:", parsedCharacter);

                    // Verify it's a valid character object with required properties
                    if (parsedCharacter && parsedCharacter.name) {
                        console.log("Using cached character:", parsedCharacter.name);
                        setSelectedCharacter(parsedCharacter);

                        // Navigate to dashboard immediately with cached character
                        navigate('/dashboard');
                        return; // Exit early - we've already navigated
                    } else {
                        console.log("Character found in localStorage but appears invalid");
                        localStorage.removeItem('selectedCharacter'); // Remove invalid character
                    }
                } catch (parseError) {
                    console.error("Error parsing cached character:", parseError);
                    localStorage.removeItem('selectedCharacter');
                    // Continue to server fetch
                }
            }

            // Step 4: If no valid cached character, try fetching from server
            console.log("No valid cached character, checking server...");
            try {
                // Try to get character from server
                const characterResponse = await axios.get('http://localhost:5233/api/character/get-selected-character', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                console.log("Server character response:", characterResponse.data);

                if (characterResponse.data) {
                    // Save server character and go to dashboard
                    localStorage.setItem('selectedCharacter', JSON.stringify(characterResponse.data));
                    setSelectedCharacter(characterResponse.data);
                    navigate('/dashboard');
                } else {
                    // No server character
                    console.log("No character found on server, redirecting to selection");
                    navigate('/characters');
                }
            } catch (fetchError) {
                console.error("Error fetching selected character:", fetchError);

                if (fetchError.response && fetchError.response.status === 404) {
                    console.log("User has no character selected yet (404 response)");

                    // CRITICAL: Check if we have a character in localStorage despite a 404
                    const fallbackCharacter = localStorage.getItem('selectedCharacter');
                    if (fallbackCharacter) {
                        try {
                            console.log("Using fallback character from localStorage");
                            const parsedFallback = JSON.parse(fallbackCharacter);
                            setSelectedCharacter(parsedFallback);
                            navigate('/dashboard');
                            return;
                        } catch (fallbackError) {
                            console.error("Error using fallback character:", fallbackError);
                        }
                    }

                    // If we reach here, then both server and localStorage have no character
                    console.log("No character found, redirecting to character selection");
                    navigate('/characters');
                } else {
                    // Other error, redirect to character selection
                    console.log("Error fetching character, redirecting to character selection");
                    navigate('/characters');
                }
            }
        } catch (error) {
            console.error('Login error:', error);

            if (error.response) {
                if (typeof error.response.data === 'string') {
                    setError(error.response.data);
                } else if (error.response.data && error.response.data.message) {
                    setError(error.response.data.message);
                } else {
                    setError(`Login failed: ${error.response.status === 401 ? 'Invalid credentials' : 'Server error'}`);
                }
            } else if (error.request) {
                setError('No response from server. Please check your internet connection.');
            } else {
                setError(`Error: ${error.message}`);
            }

            setIsLoading(false);
        }
    };

    return (
        <div className="login">
            <h1>Login</h1>
            <form onSubmit={handleSubmit} className="login-form">
                {error && <div className="error-message">{error}</div>}
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
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
                        disabled={isLoading}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="login-button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}