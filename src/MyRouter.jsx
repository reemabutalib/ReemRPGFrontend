import AuthLayout from "@/Components/Auth/AuthLayout";
import Login from "@/Components/Auth/Login";
import Register from "@/Components/Auth/Register";
import VerificationFailed from "@/Components/Auth/VerificationFailed";
import VerificationSuccess from "@/Components/Auth/VerificationSuccess";
import Characters from "@/Components/Characters";
import Dashboard from "@/Components/Dashboard";
import Navbar from "@/Components/Navbar";
import Quests from "@/Components/Quests";
import TestPage from "@/Components/TestPage";
import { useEffect } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

// Create a route logger component
function RouteLogger() {
    const location = useLocation();

    useEffect(() => {
        // Log route changes
        console.log('====== ROUTE CHANGED ======');
        console.log('Current route:', location.pathname);
        console.log('Selected character:', localStorage.getItem('selectedCharacter'));
        console.log('Auth token exists:', !!localStorage.getItem('authToken'));
    }, [location]);

    return null; // This component doesn't render anything
}

// RouteLogger needs to be inside the Router, so let's create a wrapper
function AppRoutes() {
    useEffect(() => {
        // Fix CSS issues that might be hiding content
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.minHeight = '100vh';
        document.body.style.backgroundColor = '#f5f5f5';

        // Find root element
        const root = document.getElementById('root') || document.getElementById('app');
        if (root) {
            root.style.display = 'block';
            root.style.minHeight = '100vh';
            root.style.position = 'relative';
        }

        // Debug what elements are actually rendering
        console.log('DOM structure:', document.body.innerHTML);

        return () => {
            document.body.style = '';
            if (root) root.style = '';
        };
    }, []);

    // In your AppRoutes component, update the routes section:

    return (
        <>
            <RouteLogger />
            <Routes>
                {/* Public Routes */}
                <Route index element={<Navigate to="/login" replace />} />
                <Route element={<AuthLayout />}>
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                </Route>

                {/* Verification Pages (No Navbar) */}
                <Route path="/verification/success" element={<VerificationSuccess />} />
                <Route path="/verification/failed" element={<VerificationFailed />} />

                {/* Authenticated Routes (with Navbar) */}
                {/* Fix: Remove the "/" from path to avoid conflicts */}
                <Route element={<AuthenticatedLayout />}>
                    <Route path="characters" element={<Characters />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="quests" element={<Quests />} />
                    <Route path="test" element={<TestPage />} />
                </Route>

                {/* Debug test route - direct access */}
                <Route path="/debug" element={
                    <div style={{
                        padding: '50px',
                        backgroundColor: 'pink',
                        minHeight: '70vh',
                        textAlign: 'center',
                        border: '5px solid red'
                    }}>
                        <h1>Debug Test Page</h1>
                        <p>If you can see this, direct rendering works!</p>
                    </div>
                } />

                {/* Catch-all 404 route */}
                <Route path="*" element={
                    <div style={{
                        padding: '50px',
                        backgroundColor: 'yellow',
                        minHeight: '70vh',
                        textAlign: 'center',
                        border: '5px dashed red'
                    }}>
                        <h1>404 - Page Not Found</h1>
                        <p>Path: {window.location.pathname}</p>
                        <button
                            onClick={() => window.history.back()}
                            style={{ padding: '10px', margin: '10px' }}
                        >
                            Go Back
                        </button>
                    </div>
                } />
            </Routes>
        </>
    );
}

// Authenticated Layout for pages requiring login
// FIXED VERSION - uses Outlet instead of children
const AuthenticatedLayout = () => {
    // Check if user is authenticated
    const isAuthenticated = !!localStorage.getItem('authToken');

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        return <Navigate to="/login" replace />;
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            position: 'relative'
        }}>
            <Navbar showLogout={true} />

            <div className="authenticated-content" style={{
                flex: '1',
                padding: '20px',
                backgroundColor: '#f8f9fa'
            }}>
                {/* This renders the nested route components */}
                <Outlet />
            </div>

            {/* Debug indicator */}
            <div style={{
                position: 'fixed',
                bottom: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.1)',
                padding: '5px',
                borderRadius: '3px',
                fontSize: '10px'
            }}>
                Auth Layout Rendered
            </div>
        </div>
    );
};

export default function MyRouter() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}