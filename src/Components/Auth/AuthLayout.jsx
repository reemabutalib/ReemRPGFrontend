import { Outlet } from 'react-router';
import './AuthLayout.css';

export default function AuthLayout() {
    return (
        <div className="auth-layout">

            <div className="container">
                <Outlet />
            </div>
        </div>
    )
}
