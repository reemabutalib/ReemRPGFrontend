import AdminDashboard from '@/components/AdminDashboard';
import AdminRoute from "@/components/AdminRoute";
import Dashboard from "@/components/Dashboard";
import Home from "@/components/Home";
import Navbar from "@/components/Navbar";
import { checkAndRefreshToken } from "@/components/Utils/AuthUtils";
import { AddCharacter } from "@/pages/AddCharacter";
import AuthLayout from "@/pages/Auth/AuthLayout";
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import VerificationFailed from "@/pages/Auth/VerificationFailed";
import VerificationSuccess from "@/pages/Auth/VerificationSuccess";
import Characters from "@/pages/Characters";
import Quests from "@/pages/Quests";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

// App Routes component
function AppRoutes() {
    return (
        <>
            <Routes>
                {/* Home Page - Public, doesn't require auth */}
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} /> {/* Add explicit /home route */}

                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                {/* Verification Pages */}
                <Route path="/verification-success" element={<VerificationSuccess />} />
                <Route path="/verification-failed" element={<VerificationFailed />} />

                {/* Protected Routes - require authentication */}
                <Route element={<ProtectedRoutes />}>
                    <Route path="/characters" element={<Characters />} />
                    <Route path="/add-character" element={<AddCharacter />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/quests" element={<Quests />} />
                </Route>

                {/* Admin Dashboard - protected route */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route element={<AdminRoute />}>
                </Route>

                {/* 404 Not Found */}
                {/* Fallback route for non-existent pages */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </>
    );
}

// Protected routes wrapper that checks authentication
function ProtectedRoutes() {
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const validateAuthentication = async () => {
            setIsChecking(true);
            const valid = await checkAndRefreshToken();
            setIsAuthenticated(valid);
            setIsChecking(false);
        };

        validateAuthentication();
    }, []);

    // Show loading state while checking
    if (isChecking) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">Checking authentication...</div>
            </div>
        );
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        // Store the attempted URL to redirect back after login
        sessionStorage.setItem('redirectAfterLogin', location.pathname);
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render the outlet (nested routes)
    return (
        <>
            <Navbar showLogout={true} />
            <Outlet />
        </>
    );
}

// 404 Not Found Page
function NotFoundPage() {
    return (
        <div className="not-found">
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <div className="not-found-buttons">
                <button onClick={() => window.history.back()}>Go Back</button>
                <button onClick={() => window.location.href = '/'}>Go to Home</button>
            </div>
        </div>
    );
}

// Main Router component
export default function MyRouter() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}