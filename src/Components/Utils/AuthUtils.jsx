import axios from 'axios';

// Function to check and refresh token if needed
export const checkAndRefreshToken = async () => {
    try {
        // Check if token exists
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log('No token found, need to login');
            return false;
        }

        // Validate token structure and expiration
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));

            // Check expiration
            if (payload.exp) {
                const expiry = payload.exp * 1000; // Convert seconds to milliseconds
                const now = Date.now();
                const timeRemaining = expiry - now;
                const minutesRemaining = Math.floor(timeRemaining / 1000 / 60);

                console.log(`Token expires in: ${minutesRemaining} minutes`);

                if (now >= expiry) {
                    console.log('Token has expired, attempting to refresh');

                    // Get refresh credentials
                    const email = localStorage.getItem('userEmail');
                    const storedPassword = localStorage.getItem('tempAuthPassword');

                    if (!email || !storedPassword) {
                        console.log('No stored credentials for auto-refresh');
                        localStorage.removeItem('authToken');
                        return false;
                    }

                    try {
                        console.log('Attempting silent token refresh for:', email);
                        const response = await axios.post(
                            'http://localhost:5233/api/account/login',
                            { email, password: storedPassword }
                        );

                        if (response.data && response.data.token) {
                            console.log('Token refreshed successfully');
                            localStorage.setItem('authToken', response.data.token);
                            return true;
                        } else {
                            console.log('No token in refresh response');
                            localStorage.removeItem('authToken');
                            return false;
                        }
                    } catch (refreshError) {
                        console.error('Error refreshing token:', refreshError);
                        localStorage.removeItem('authToken');
                        return false;
                    }
                }

                // Token is valid
                return true;
            }

            // If no exp field, conservatively return true
            return true;
        } catch (parseError) {
            console.error('Error parsing token:', parseError);
            return false;
        }
    } catch (err) {
        console.error('Unexpected error checking token:', err);
        return false;
    }
};

// Extract user ID from JWT token
export const getUserIdFromToken = () => {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return null;

        // Parse JWT token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));

        // First try common claim names
        const userId =
            payload.nameid ||
            payload.sub ||
            payload.id ||
            payload.userId ||
            payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

        return userId;
    } catch (err) {
        console.error('Error extracting user ID from token:', err);
        return null;
    }
};

// Helper to store credentials temporarily for auto-refresh
export const storeCredentialsForRefresh = (email, password) => {
    // Store email for token refresh
    localStorage.setItem('userEmail', email);
    console.log('Email stored for token refresh:', email);

    // Store password temporarily
    localStorage.setItem('tempAuthPassword', password);
    console.log('Password stored temporarily for auto-refresh');

    // Auto-clear password after 1 hour for security
    setTimeout(() => {
        localStorage.removeItem('tempAuthPassword');
        console.log('Temporary password removed after timeout');
    }, 60 * 60 * 1000);
};

// Clear all auth data
export const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('tempAuthPassword');
};

// Debug function to check token state
export const debugToken = () => {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return { valid: false, message: 'No token found' };

        const parts = token.split('.');
        if (parts.length !== 3) return { valid: false, message: 'Invalid token format' };

        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));

        const now = Date.now() / 1000;
        const exp = payload.exp;
        const valid = exp && now < exp;

        return {
            valid: valid,
            payload: payload,
            expiry: exp ? new Date(exp * 1000).toLocaleString() : 'None',
            timeRemaining: exp ? `${Math.floor((exp - now) / 60)} minutes` : 'N/A',
            isExpired: exp ? now >= exp : false,
            hasRefreshCredentials: !!localStorage.getItem('userEmail') && !!localStorage.getItem('tempAuthPassword')
        };
    } catch (err) {
        return { valid: false, message: err.message };
    }
};