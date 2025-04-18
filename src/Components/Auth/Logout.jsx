import { useNavigate } from "react-router";

const Logout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear(); // Clear user session
        navigate("/login");
    };

    return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;