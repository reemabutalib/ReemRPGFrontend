import '@/styles/Verification.css';
import React from 'react';
import { Link } from 'react-router-dom';

const VerificationSuccess = () => {
    return (
        <div className="verification-container">
            <div className="verification-card">
                <div className="verification-icon success">
                    <i className="fas fa-check-circle"></i>
                </div>
                <h1>Email Verified!</h1>
                <p>Your email has been successfully verified. You can now log in to your account.</p>
                <Link to="/login" className="verification-button">
                    Log In
                </Link>
            </div>
        </div>
    );
};

export default VerificationSuccess;