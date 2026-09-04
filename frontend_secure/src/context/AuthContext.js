import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

// Replaces reading a JWT/user object out of localStorage (readable by any
// injected script) with server-verified session state. On mount we ask
// the API "who am I?" using the httpOnly cookie — if there's no valid
// session, we simply get a 401 and user stays null.
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const res = await api.get("/auth/me");
            setUser(res.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();

        const handleUnauthorized = () => setUser(null);
        window.addEventListener("auth:unauthorized", handleUnauthorized);
        return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
    }, [refreshUser]);

    const login = (userData) => setUser(userData);

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            // Even if the network call fails, clear local state so the UI
            // doesn't strand the user in a logged-in-looking state.
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
