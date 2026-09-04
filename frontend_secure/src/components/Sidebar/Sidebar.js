import "./Sidebar.css";
import { Link, useLocation } from "react-router-dom";

import {
  FaTachometerAlt,
  FaBook,
  FaLayerGroup,
  FaVideo,
  FaUsers,
  FaShoppingCart,
  FaSignOutAlt,
} from "react-icons/fa";

function Sidebar() {

  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";

  };

  return (

    <aside className="sidebar">

      <div className="sidebar-logo">

        <h2>Mechanical Mitra</h2>

        <span>Admin Panel</span>

      </div>

      <div className="sidebar-user">

        <div className="avatar">

          {user?.name?.charAt(0).toUpperCase()}

        </div>

        <h3>{user?.name}</h3>

        <p>Administrator</p>

      </div>

      <nav>

        <Link
          to="/admin/dashboard"
          className={location.pathname === "/admin/dashboard" ? "active" : ""}
        >
          <FaTachometerAlt />
          Dashboard
        </Link>

        <Link
          to="/admin/subjects"
          className={location.pathname === "/admin/subjects" ? "active" : ""}
        >
          <FaBook />
          Subjects
        </Link>

        <Link to="/admin/chapters">
          <FaLayerGroup />
          Chapters
        </Link>

        <Link to="/admin/lectures">
          <FaVideo />
          Lectures
        </Link>

        <Link to="/admin/students">
          <FaUsers />
          Students
        </Link>

        <Link to="/admin/purchases">
          <FaShoppingCart />
          Purchases
        </Link>

      </nav>

      <button
        className="logout-btn"
        onClick={logout}
      >
        <FaSignOutAlt />
        Logout
      </button>

    </aside>

  );

}

export default Sidebar;