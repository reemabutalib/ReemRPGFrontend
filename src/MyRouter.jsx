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
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Authenticated Layout for pages requiring login
const AuthenticatedLayout = ({ children }) => (
    <>
        <Navbar showLogout={true} />
        <div className="authenticated-content">{children}</div>
    </>
);

export default function MyRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route index element={<Home />} />
                <Route element={<AuthLayout />}>
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                </Route>

                {/* Verification Pages (No Navbar) */}
                <Route path="/verification/success" element={<VerificationSuccess />} />
                <Route path="/verification/failed" element={<VerificationFailed />} />

                {/* Authenticated Routes (with Navbar) */}
                <Route element={<AuthenticatedLayout />}>
                    <Route path="/characters" element={<Characters />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/quests" element={<Quests />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}