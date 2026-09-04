import axios from "axios";

// =====================================================
// API URL
// =====================================================

const API_URL =
    process.env.REACT_APP_API_URL ||
    "http://localhost:5000";


// =====================================================
// AXIOS INSTANCE
// =====================================================

const api = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true,
    timeout: 30000
});


// =====================================================
// CSRF TOKEN STORAGE
// =====================================================

let csrfToken = null;


// =====================================================
// GET CSRF TOKEN
// =====================================================

export const getCsrfToken = async () => {
    try {
        const response = await api.get("/csrf-token");

        csrfToken = response.data.csrfToken;

        console.log("✅ CSRF token received");

        return csrfToken;

    } catch (error) {

        console.error(
            "❌ CSRF token request failed:",
            error.response?.data || error.message
        );

        throw error;
    }
};


// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

api.interceptors.request.use(
    async (config) => {

        const method = config.method?.toUpperCase();

        const requiresCsrf = [
            "POST",
            "PUT",
            "PATCH",
            "DELETE"
        ].includes(method);

        if (requiresCsrf) {

            if (!csrfToken) {
                await getCsrfToken();
            }

            config.headers = config.headers || {};

            config.headers["X-XSRF-TOKEN"] = csrfToken;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);


// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(
    (response) => response,

    async (error) => {

        const originalRequest = error.config;

        // =================================================
        // CSRF FAILED
        // =================================================

        if (
            error.response?.status === 403 &&
            error.response?.data?.message?.includes("CSRF") &&
            !originalRequest?._csrfRetry
        ) {

            try {

                console.log("🔄 Refreshing CSRF token...");

                csrfToken = null;

                await getCsrfToken();

                originalRequest._csrfRetry = true;

                originalRequest.headers =
                    originalRequest.headers || {};

                originalRequest.headers["X-XSRF-TOKEN"] =
                    csrfToken;

                return api(originalRequest);

            } catch (csrfError) {

                console.error(
                    "❌ CSRF refresh failed:",
                    csrfError
                );
            }
        }


        // =================================================
        // UNAUTHORIZED
        // =================================================

        if (
            error.response?.status === 401 &&
            !window.location.pathname.startsWith("/login")
        ) {

            window.dispatchEvent(
                new CustomEvent("auth:unauthorized")
            );
        }

        return Promise.reject(error);
    }
);


// =====================================================
// ERROR HELPER
// =====================================================

export const getApiErrorMessage = (
    error,
    fallback = "Something went wrong"
) => {
    return (
        error?.response?.data?.message ||
        fallback
    );
};


// =====================================================
// EXPORT
// =====================================================

export default api;

export { API_URL };