import "./Sidebar.css";

import {
    FaHome,
    FaBook,
    FaLayerGroup,
    FaVideo,
    FaUsers,
    FaShoppingCart,
    FaSignOutAlt,
    FaTimes
} from "react-icons/fa";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Sidebar({ onClose }) {

    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const linkClass = ({ isActive }) => (isActive ? "active" : "");

    return (
        <div className="admin-sidebar">

            <div className="sidebar-top">
                <div className="sidebar-logo">
                    <h2>Mechanical</h2>
                    <span>MITRA</span>
                </div>
                {onClose && (
                    <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
                        <FaTimes />
                    </button>
                )}
            </div>

            {user && (
                <div className="sidebar-user">
                    <div className="sidebar-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                    <div>
                        <p className="sidebar-user-name">{user.name}</p>
                        <p className="sidebar-user-role">Administrator</p>
                    </div>
                </div>
            )}

            <nav>
                <NavLink to="/admin/dashboard" className={linkClass} onClick={onClose}>
                    <FaHome /> Dashboard
                </NavLink>
                <NavLink to="/admin/subjects" className={linkClass} onClick={onClose}>
                    <FaBook /> Subjects
                </NavLink>
                <NavLink to="/admin/chapters" className={linkClass} onClick={onClose}>
                    <FaLayerGroup /> Chapters
                </NavLink>
                <NavLink to="/admin/lectures" className={linkClass} onClick={onClose}>
                    <FaVideo /> Lectures
                </NavLink>
                <NavLink to="/admin/students" className={linkClass} onClick={onClose}>
                    <FaUsers /> Students
                </NavLink>
                <NavLink to="/admin/purchases" className={linkClass} onClick={onClose}>
                    <FaShoppingCart /> Purchases
                </NavLink>
            </nav>

            <button className="logout-btn" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
            </button>

        </div>
    );

}

export default Sidebar;
