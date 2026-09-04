import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "../Loader/Loader";

function AdminRoute({ children }) {

    const { user, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    // Not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Logged in, but the server-verified role isn't admin. The real
    // enforcement happens on the backend (adminOnly middleware) — this is
    // just UX, not the security boundary.
    if (user.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;

}

export default AdminRoute;
