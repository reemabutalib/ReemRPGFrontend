import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";
import "./Register.css";

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errorMessages, setErrorMessages] = useState([]);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

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

        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
            setErrorMessages(passwordErrors);
            return;
        }

        try {
            // Make API call to register the user
            const response = await axios.post("http://localhost:5233/api/account/register", formData);
            console.log("Registration successful:", response.data);

            // Show success message
            setRegistrationSuccess(true);

            // Clear any previous error messages
            setErrorMessages([]);

            // Redirect to login page after a short delay (2 seconds)
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            if (err.response) {
                console.error("Server Error:", err.response.data);
                setErrorMessages(err.response.data.map((error) => error.description));
            } else {
                console.error("Registration error:", err.message);
                setErrorMessages(["An unexpected error occurred."]);
            }
        }
    };

    return (
        <div className="register">
            <h1>Sign Up</h1>
            {registrationSuccess ? (
                <div className="success-message">
                    <p>Registration successful! Redirecting to login page...</p>
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
                            required
                        />
                    </div>
                    {errorMessages.length > 0 && (
                        <div className="error-messages">
                            {errorMessages.map((msg, index) => (
                                <p key={index} className="error-text">{msg}</p>
                            ))}
                        </div>
                    )}
                    <button type="submit" className="register-button">
                        Sign Up
                    </button>
                </form>
            )}
        </div>
    );
}