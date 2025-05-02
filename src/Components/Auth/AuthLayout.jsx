import '@/styles/AuthLayout.css';
import { Outlet } from 'react-router';

export default function AuthLayout() {
    return (
        <div className="auth-layout">

            <div className="container">
                <Outlet />
            </div>
        </div>
    )
}
