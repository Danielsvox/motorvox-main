// API Configuration
const getApiBaseUrl = () => {
    // In development, use the local network IP
    // In production, this would be your actual API domain
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }

    // TEMPORARY: Hardcode for debugging CORS issues
    // Change this to match your backend URL
    return 'http://localhost:8000';

    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
        // Use Next.js proxy in development to avoid CORS
        if (process.env.NODE_ENV === 'development') {
            return '/api/backend';
        }
        // Default to window.location.hostname which will be the IP/domain of the server
        // Use the same port as your backend (8000)
        return `http://${window.location.hostname}:8000`;
    }

    // For server-side rendering, use a default value
    return 'http://localhost:8000';
};

// WebSocket configuration
const getWsBaseUrl = () => {
    // Similar logic for WebSocket URL
    if (process.env.REACT_APP_WS_URL) {
        return process.env.REACT_APP_WS_URL;
    }

    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
        // Default to window.location.hostname which will be the IP/domain of the server
        return `ws://${window.location.hostname}:8000`;
    }

    // For server-side rendering, use a default value
    return 'ws://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();
export const WS_BASE_URL = getWsBaseUrl(); 