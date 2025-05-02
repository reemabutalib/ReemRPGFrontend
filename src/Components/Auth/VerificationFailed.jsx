import '@/styles/Verification.css';
import React from 'react';
import { Link } from 'react-router-dom';

const VerificationFailed = () => {
    return (
        <div className="verification-container">
            <div className="verification-card">
                <div className="verification-icon error">
                    <i className="fas fa-times-circle"></i>
                </div>
                <h1>Verification Failed</h1>
                <p>We couldn't verify your email address. This could be because:</p>
                <ul>
                    <li>The verification link has expired</li>
                    <li>The verification link was already used</li>
                    <li>The verification link is incorrect</li>
                </ul>
                <p>Please try again or contact support for assistance.</p>
                <Link to="/register" className="verification-button">
                    Back to Registration
                </Link>
            </div>
        </div>
    );
};

export default VerificationFailed;