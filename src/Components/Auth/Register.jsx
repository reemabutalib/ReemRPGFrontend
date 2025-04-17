import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useUser } from "../../context/userContext";
import "./Register.css";

export default function Register() {
    const navigate = useNavigate();
    const { setUsername } = useUser();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5233/api/register", formData);
            console.log("Registration successful:", response.data);
            setUsername(response.data.username);
            navigate("/characters"); // 👉 redirect to select character
        } catch (err) {
            console.error("Registration error:", err);
        }
    };

    return (
        <div className="register">
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit} className="register-form">
                <input name="username" placeholder="Username" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}
