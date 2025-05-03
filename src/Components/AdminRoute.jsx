import { useUser } from '@/context/userContext';
import { Navigate, Outlet } from 'react-router-dom';

export default function AdminRoute() {
    const { isAdmin } = useUser();

    // If not admin, redirect to dashboard
    if (isAdmin === false) {
        return <Navigate to="/dashboard" replace />;
    }

    // If still checking admin status, show loading
    if (isAdmin === undefined) {
        return <div className="loading">Checking permissions...</div>;
    }

    // If admin, render the child routes
    return <Outlet />;
}