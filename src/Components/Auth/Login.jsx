import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from "../../context/userContext";
import '../Auth/Verification.css';
import { storeCredentialsForRefresh } from '../Utils/AuthUtils';
import './Login.css';

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

            await axios.post(
                'http://localhost:5233/api/account/resend-verification',
                payload,
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            setResendSuccess(true);
        } catch (error) {
            if (error.response) {
                setError(error.response.data?.message || 'Failed to resend verification email. Please try again.');
            } else {
                setError('Failed to resend verification email. Please try again.');
            }
        } finally {
            setResendLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setRequiresVerification(false);
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5233/api/account/login', formData);

            const token = response.data.token;
            if (!token) {
                throw new Error('Failed to retrieve token from login response.');
            }

            // Store token
            localStorage.setItem('authToken', token);

            // Store credentials for token refresh
            storeCredentialsForRefresh(formData.email, formData.password);

            // Clear any existing character data
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('selectedCharacter')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));

            try {
                // Try to get the selected character
                const selectedCharResponse = await axios.get(
                    'http://localhost:5233/api/usercharacter/selected',
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (selectedCharResponse.data && selectedCharResponse.data.characterId) {
                    // Format the character data
                    const characterData = {
                        characterId: selectedCharResponse.data.characterId,
                        name: selectedCharResponse.data.name,
                        class: selectedCharResponse.data.class_,
                        level: selectedCharResponse.data.level,
                        experience: selectedCharResponse.data.experience,
                        gold: selectedCharResponse.data.gold,
                        imageUrl: selectedCharResponse.data.imageUrl || ''
                    };

                    // Set in context
                    setSelectedCharacter(characterData);

                    // Navigate to dashboard
                    navigate('/dashboard', { replace: true });
                    return;
                }
            } catch (error) {
                error.response?.status === 404 ? console.log('No selected character found') : console.error('Error fetching selected character:', error);
                // No selected character found or other error
                // Proceed to character selection
                navigate('/characters');
                return;
            }

            // If we get here, no selected character was found
            // Direct user to character selection page
            navigate('/characters');

        } catch (error) {
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
        } finally {
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
        </div>
    );
}