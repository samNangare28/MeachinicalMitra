import axios from "axios";

// Single source of truth for the API base URL — no more hardcoded
// http://localhost:5000 scattered across 20 files. Set REACT_APP_API_URL
// in your .env / hosting provider for production.
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: `${API_URL}/api`,
    // Send/receive the httpOnly auth cookie automatically.
    withCredentials: true,
    // Axios only auto-attaches the XSRF header from the cookie for
    // same-origin requests by default; since the API may live on a
    // different subdomain than the frontend, this opts in explicitly.
    withXSRFToken: true,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    timeout: 30000
});

// Central place to react to an expired/invalid session — redirect to
// login instead of every page having to handle a raw 401 itself.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !window.location.pathname.startsWith("/login")) {
            window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        }
        return Promise.reject(error);
    }
);

export default api;
export { API_URL };

// Small helper so every page doesn't repeat the same
// `error.response?.data?.message || "fallback"` chain — used throughout
// the admin pages for toast error messages.
export const getApiErrorMessage = (error, fallback = "Something went wrong") =>
    error?.response?.data?.message || fallback;
