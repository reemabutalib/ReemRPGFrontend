import { useNavigate } from 'react-router';

export default function Login() {
    const navigate = useNavigate();
    return (
        <>
            <h1>Login</h1>
            {/* TODO: add login form */}
            <p>REEM ADD THE RASCLART LOGIN FORM HERE</p>
            <button
                onClick={() => {
                    navigate('/quests');
                }}>
                Go to Quests
            </button>
        </>
    )
}
