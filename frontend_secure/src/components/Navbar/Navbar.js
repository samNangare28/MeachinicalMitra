import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FaBars,
    FaTimes,
    FaGraduationCap
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

function Navbar() {

    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogout = async () => {
        await logout();
        setMenuOpen(false);
        navigate("/login");
    };

    return (

        <header className="navbar">

            <div className="navbar-container">

                <Link to="/" className="logo">
                    <FaGraduationCap className="logo-icon" />
                    <div>
                        <h2>Mechanical Mitra</h2>
                        <span>Learn • Practice • Succeed</span>
                    </div>
                </Link>

                <nav className={menuOpen ? "nav-menu active" : "nav-menu"}>

                    <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                    <Link to="/subjects" onClick={() => setMenuOpen(false)}>Subjects</Link>
                    <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
                    <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>

                    <div className="nav-buttons">
                        {user ? (
                            <>
                                <Link
                                    to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                                    className="dashboard-btn"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <button className="logout-btn" onClick={handleLogout}>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="login-btn" onClick={() => setMenuOpen(false)}>
                                    Login
                                </Link>
                                <Link to="/register" className="register-btn" onClick={() => setMenuOpen(false)}>
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                </nav>

                <div className="menu-icon" onClick={toggleMenu}>
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </div>

            </div>

        </header>

    );

}

export default Navbar;
