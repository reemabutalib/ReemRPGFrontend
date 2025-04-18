import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from "../../context/userContext";
import './Login.css';

export default function Login() {
    const navigate = useNavigate();
    const { hasSelectedCharacter } = useUser();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent page refresh
        console.log('Login form submitted');
        try {
            // Make API call to log in the user
            const response = await axios.post('http://localhost:5233/api/account/login', formData);
            console.log('Login successful:', response.data);

            // Redirect based on whether the user has a selected character
            if (hasSelectedCharacter()) {
                navigate('/dashboard');
            } else {
                navigate('/characters');
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    return (
        <div className="login">
            <h1>Login</h1>
            <form onSubmit={handleSubmit} className="login-form">
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