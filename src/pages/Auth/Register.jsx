import "@/styles/Register.css";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errorMessages, setErrorMessages] = useState([]);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validatePassword = (password) => {
        const errors = [];
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push("Password must have at least one non-alphanumeric character.");
        }
        if (!/[A-Z]/.test(password)) {
            errors.push("Password must have at least one uppercase letter.");
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessages([]);

        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
            setErrorMessages(passwordErrors);
            setIsLoading(false);
            return;
        }

        try {
            // Make API call to register the user
            const response = await axios.post("http://localhost:5233/api/account/register", formData);
            console.log("Registration successful:", response.data);

            // Clear any existing character data from localStorage
            localStorage.removeItem('selectedCharacter');
            localStorage.removeItem('selectedCharacterId');

            // Check if the response includes a token (auto-login)
            if (response.data?.token) {
                // Store the token
                localStorage.setItem('authToken', response.data.token);

                // Set new user flag for onboarding
                localStorage.setItem('newUser', 'true');

                // Show success message briefly then redirect
                setRegistrationSuccess(true);
                setTimeout(() => {
                    // Navigate to character creation
                    navigate('/characters');
                }, 1500);
            } else {
                // Show success message for email verification flow
                setRegistrationSuccess(true);
            }

            // Clear any previous error messages
            setErrorMessages([]);

        } catch (err) {
            if (err.response?.data) {
                console.error("Server Error:", err.response.data);

                // Handle different error formats from the API
                if (Array.isArray(err.response.data)) {
                    setErrorMessages(err.response.data.map((error) => error.description || error.message || JSON.stringify(error)));
                } else if (typeof err.response.data === 'object') {
                    const errors = [];
                    if (err.response.data.message) {
                        errors.push(err.response.data.message);
                    } else {
                        // Extract error messages from object
                        Object.values(err.response.data).forEach(errMsg => {
                            if (Array.isArray(errMsg)) {
                                errMsg.forEach(msg => errors.push(msg));
                            } else if (typeof errMsg === 'string') {
                                errors.push(errMsg);
                            }
                        });
                    }
                    setErrorMessages(errors.length > 0 ? errors : ["Registration failed. Please try again."]);
                } else {
                    setErrorMessages([err.response.data]);
                }
            } else {
                console.error("Registration error:", err.message);
                setErrorMessages(["An unexpected error occurred. Please try again later."]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register">
            <h1>Sign Up</h1>
            {registrationSuccess ? (
                <div className="success-message">
                    <p>Registration successful!</p>
                    <p>Please check your email to verify your account before logging in.</p>
                    <p>A verification link has been sent to your email address.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="login-nav-button"
                    >
                        Go to Login
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Email"
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
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                        />
                        <small className="password-requirements">
                            Password must include at least one uppercase letter and one special character.
                        </small>
                    </div>
                    {errorMessages.length > 0 && (
                        <div className="error-messages">
                            {errorMessages.map((msg, index) => (
                                <p key={index} className="error-text">{msg}</p>
                            ))}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="register-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing Up...' : 'Sign Up'}
                    </button>

                    <div className="login-link">
                        <p>Already have an account?</p>
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="secondary-button"
                        >
                            Log In
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}