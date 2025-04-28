import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from "../../context/userContext";
import '../Auth/Verification.css';
import { storeCredentialsForRefresh } from '../Utils/AuthUtils';
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
    const [requiresVerification, setRequiresVerification] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleResendVerification = async () => {
        setResendLoading(true);
        setResendSuccess(false);
        setError(null);

        try {
            const payload = {
                email: formData.email,
                password: formData.password
            };

            console.log("Sending verification resend request with payload:",
                { email: payload.email, password: "********" });

            const response = await axios.post(
                'http://localhost:5233/api/account/resend-verification',
                payload,
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            console.log("Verification email resent successfully:", response.data);
            setResendSuccess(true);
        } catch (error) {
            console.error('Error resending verification email:', error);
            if (error.response) {
                console.log("Error response data:", error.response.data);
                console.log("Error response status:", error.response.status);
            }
            setError('Failed to resend verification email. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setRequiresVerification(false);
        setIsLoading(true);

        // Simple localStorage test
        localStorage.setItem('testValue', 'hello');
        const testResult = localStorage.getItem('testValue');
        console.log("Simple localStorage test:", testResult === 'hello' ? "WORKING" : "FAILED");

        try {
            console.log("Making login request...");
            const response = await axios.post('http://localhost:5233/api/account/login', formData);
            console.log("Login successful:", response.status);

            const token = response.data.token;
            if (!token) {
                throw new Error('Failed to retrieve token from login response.');
            }

            // Store token
            localStorage.setItem('authToken', token);
            console.log("Token stored in localStorage");

            // Store credentials for token refresh
            storeCredentialsForRefresh(formData.email, formData.password);
            console.log("Credentials stored for auto-refresh");

            // IMPORTANT: Clear any existing character data for all users
            // Get all localStorage keys
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('selectedCharacter')) {
                    keysToRemove.push(key);
                }
            }

            // Remove all character keys
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log(`Removed ${key} from localStorage`);
            });

            console.log("Cleared previous character selections");

            // Extract user ID from token for user-specific storage
            let userId = null;
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(window.atob(base64));
                userId = payload.nameid ||
                    payload.sub ||
                    payload.userId ||
                    payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

                console.log("Extracted userId from token:", userId);
            } catch (err) {
                console.error("Error extracting user ID from token:", err);
            }

            // Check if user has characters first
            try {
                console.log("Checking if user has characters...");
                const characterResponse = await axios.get('http://localhost:5233/api/character', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // If user has no characters, go to character creation
                if (!characterResponse.data ||
                    (Array.isArray(characterResponse.data) && characterResponse.data.length === 0)) {
                    console.log("No characters found for this user");
                    navigate('/characters');
                    return;
                }

                console.log("User has characters:", characterResponse.data);

                // User has characters - select the first one
                if (Array.isArray(characterResponse.data) && characterResponse.data.length > 0) {
                    const firstCharacter = characterResponse.data[0];
                    console.log("Auto-selecting first character:", firstCharacter);

                    try {
                        // Validate character ownership first
                        const response = await axios.get(
                            `http://localhost:5233/api/character/${firstCharacter.characterId}/validate`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        );

                        if (response.data?.isOwner !== true) {
                            console.error("Character does not belong to current user");
                            navigate('/characters');
                            return;
                        }

                        console.log("Character ownership validated");

                        // User-specific storage key if userId is available
                        if (userId) {
                            const userCharacterKey = `selectedCharacter_${userId}`;
                            localStorage.setItem(userCharacterKey, JSON.stringify(firstCharacter));
                            console.log(`Stored character in user-specific storage (${userCharacterKey})`);
                        }

                        // Also save to regular localStorage for backwards compatibility
                        localStorage.setItem('selectedCharacter', JSON.stringify(firstCharacter));

                        // Update context
                        const success = await setSelectedCharacter(firstCharacter);

                        if (!success) {
                            console.error("Error setting selected character in context");
                            navigate('/characters');
                            return;
                        }

                        // Navigate to dashboard
                        console.log("Navigating to dashboard with character:", firstCharacter.name);
                        navigate('/dashboard', { replace: true });
                    } catch (validationError) {
                        console.error("Error validating character:", validationError);
                        navigate('/characters');
                    }
                }
            } catch (characterError) {
                console.error("Error checking characters:", characterError);
                navigate('/characters');
            }
        } catch (error) {
            console.error('Login error:', error);

            // Check for verification error
            if (error.response?.data?.requiresVerification === true ||
                error.response?.data?.message?.toLowerCase().includes('verify')) {
                setRequiresVerification(true);
                setError('Please verify your email before logging in.');
            } else if (error.response) {
                setError(error.response.data?.message || 'Invalid login credentials');
            } else {
                setError('Could not connect to the server. Please try again later.');
            }

            setIsLoading(false);
        }
    };

    return (
        <div className="login">
            <h1>Login</h1>
            <form onSubmit={handleSubmit} className="login-form">
                {error && <div className="error-message">{error}</div>}

                {/* Verification UI Section */}
                {requiresVerification && (
                    <div className="verification-message">
                        <p>Your email needs to be verified before logging in.</p>
                        <button
                            type="button"
                            className="resend-button"
                            onClick={handleResendVerification}
                            disabled={resendLoading || resendSuccess}
                        >
                            {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                        </button>

                        {resendSuccess && (
                            <div className="success-message">
                                Verification email sent! Please check your inbox.
                            </div>
                        )}
                    </div>
                )}

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

            <div className="register-link">
                <p>Don't have an account?</p>
                <button onClick={() => navigate('/register')} className="secondary-button">
                    Register
                </button>
            </div>

            {/* Add this debug button during development, remove for production */}
            {import.meta.env.MODE !== 'production' && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                    <button
                        onClick={() => {
                            // Get all localStorage keys related to characters
                            const characterKeys = [];
                            for (let i = 0; i < localStorage.length; i++) {
                                const key = localStorage.key(i);
                                if (key && key.startsWith('selectedCharacter')) {
                                    characterKeys.push(key);
                                }
                            }

                            // Log detailed information about stored characters
                            const characterData = {};
                            characterKeys.forEach(key => {
                                try {
                                    const data = JSON.parse(localStorage.getItem(key));
                                    characterData[key] = {
                                        name: data.name,
                                        id: data.characterId,
                                        class: data.class
                                    };
                                } catch (error) {
                                    characterData[key] = `ERROR PARSING: ${error.message}`;
                                }
                            });

                            console.log("Debug: Current localStorage", {
                                authToken: localStorage.getItem('authToken') ? "EXISTS" : "NONE",
                                userEmail: localStorage.getItem('userEmail'),
                                tempAuthPassword: localStorage.getItem('tempAuthPassword') ? "EXISTS" : "NONE",
                                characterKeys: characterKeys,
                                characterData: characterData
                            });
                            alert("Check console for debug info");
                        }}
                        style={{ background: '#ffcc00', padding: '5px 10px', fontSize: '12px' }}
                    >
                        Debug Auth
                    </button>
                </div>
            )}
        </div>
    );
}