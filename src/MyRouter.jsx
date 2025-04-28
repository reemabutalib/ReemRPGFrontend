import AuthLayout from "@/Components/Auth/AuthLayout";
import Login from "@/Components/Auth/Login";
import Register from "@/Components/Auth/Register";
import VerificationFailed from "@/Components/Auth/VerificationFailed";
import VerificationSuccess from "@/Components/Auth/VerificationSuccess";
import Characters from "@/Components/Characters";
import Dashboard from "@/Components/Dashboard";
import Home from "@/Components/Home";
import Navbar from "@/Components/Navbar";
import Quests from "@/Components/Quests";
import TestPage from "@/Components/TestPage";
import { checkAndRefreshToken } from "@/Components/Utils/AuthUtils";
import DevReset from "@/Components/Utils/DevReset"; // Add this import
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";


// Create a route logger component
function RouteLogger() {
    const location = useLocation();

    useEffect(() => {
        // Log route changes
        console.log('====== ROUTE CHANGED ======');
        console.log('Current route:', location.pathname);
        console.log('Auth token exists:', !!localStorage.getItem('authToken'));
    }, [location]);

    return null; // This component doesn't render anything
}

// App Routes component
function AppRoutes() {
    return (
        <>
            <RouteLogger />
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
                <Route path="/verification/success" element={<VerificationSuccess />} />
                <Route path="/verification/failed" element={<VerificationFailed />} />

                {/* Development Tools - public but only enabled in development */}
                {import.meta.env.MODE !== 'production' && (
                    <Route path="/dev/reset" element={<DevReset />} />
                )}

                {/* Protected Routes - require authentication */}
                <Route element={<ProtectedRoutes />}>
                    <Route path="/characters" element={<Characters />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/quests" element={<Quests />} />
                    <Route path="/test" element={<TestPage />} />
                </Route>

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