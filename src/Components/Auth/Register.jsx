import { useNavigate } from 'react-router';

export default function Register() {
    const navigate = useNavigate();
    return (
        <>
            <h1>Register</h1>
            {/* TODO: add register form */}
            <p>REEM ADD THE RASCLART REGISTER FORM HERE</p>
            <button
                onClick={() => {
                    navigate('/onboarding');
                }}>
                Go to Choose Character
            </button>
        </>
    )
}
