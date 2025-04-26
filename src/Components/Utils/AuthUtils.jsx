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

                    // Store refresh information if available
                    const email = localStorage.getItem('userEmail');

                    // If we don't have refresh capability yet, clear token and return false
                    if (!email) {
                        console.log('No user email saved for token refresh');
                        localStorage.removeItem('authToken');
                        return false;
                    }

                    // Try to silently re-authenticate
                    try {
                        // Get stored credentials if any
                        const storedPassword = localStorage.getItem('tempAuthPassword');
                        if (!storedPassword) {
                            console.log('No stored credentials for auto-refresh');
                            return false;
                        }

                        // Attempt silent login with stored credentials
                        console.log('Attempting silent token refresh');
                        const response = await axios.post('http://localhost:5233/api/account/login', {
                            email: email,
                            password: storedPassword
                        });

                        if (response.data && response.data.token) {
                            console.log('Token refreshed successfully');
                            localStorage.setItem('authToken', response.data.token);
                            // Clear temporary password after successful use
                            setTimeout(() => localStorage.removeItem('tempAuthPassword'), 5000);
                            return true;
                        }
                    } catch (refreshError) {
                        console.error('Error refreshing token:', refreshError);
                        localStorage.removeItem('authToken');
                        return false;
                    }

                    // If silent refresh failed
                    localStorage.removeItem('authToken');
                    return false;
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

        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));

        // Check multiple possible claim types
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

// Function to debug token information
export const debugToken = () => {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log('No token found');
            return { valid: false, message: 'No token found' };
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            return { valid: false, message: 'Invalid token format' };
        }

        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));

        const now = Date.now() / 1000; // Current time in seconds
        const exp = payload.exp;
        const timeRemaining = exp ? (exp - now) : 'N/A';
        const isExpired = exp && now >= exp;

        return {
            valid: !isExpired,
            payload,
            expiry: exp ? new Date(exp * 1000).toLocaleString() : 'None',
            timeRemaining: timeRemaining !== 'N/A' ? `${Math.floor(timeRemaining / 60)} minutes` : 'N/A',
            isExpired,
            claims: Object.keys(payload)
        };
    } catch (err) {
        return { valid: false, message: `Error parsing token: ${err.message}` };
    }
};

// Helper to store credentials temporarily for auto-refresh
export const storeCredentialsForRefresh = (email, password) => {
    localStorage.setItem('userEmail', email);
    localStorage.setItem('tempAuthPassword', password);

    // Auto-clear password after 1 hour for security
    setTimeout(() => {
        localStorage.removeItem('tempAuthPassword');
    }, 60 * 60 * 1000);
};

// Clear all auth data
export const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('tempAuthPassword');
    // Removed the unused refreshToken reference
};