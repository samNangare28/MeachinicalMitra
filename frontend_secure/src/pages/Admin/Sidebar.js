import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaBook,
  FaFilePdf,
  FaVideo,
  FaClipboardList,
  FaUsers,
  FaBullhorn,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import "./AdminSidebar.css";

function AdminSidebar() {
  return (
    <div className="admin-sidebar">

      <div>
        <div className="sidebar-logo">
          <h2>Mechanical</h2>
          <span>MITRA</span>
        </div>

        <nav>

          <NavLink to="/admin/dashboard">
            <FaHome />
            Dashboard
          </NavLink>

          <NavLink to="/admin/subjects">
              <FaBook />
              Subjects
          </NavLink>

          <NavLink to="/admin/chapters">
              <FaBook />
              Chapters
          </NavLink>

          <NavLink to="/admin/notes">
              <FaFilePdf />
              Notes
          </NavLink>
          
          <NavLink to="/admin/videos">
            <FaVideo />
            Videos
          </NavLink>

          <NavLink to="/admin/quizzes">
            <FaClipboardList />
            Quizzes
          </NavLink>

          <NavLink to="/admin/students">
            <FaUsers />
            Students
          </NavLink>

          <NavLink to="/admin/announcements">
            <FaBullhorn />
            Announcements
          </NavLink>

          <NavLink to="/admin/settings">
            <FaCog />
            Settings
          </NavLink>

        </nav>
      </div>

      <button className="logout-btn">
        <FaSignOutAlt />
        Logout
      </button>

    </div>
  );
}

export default AdminSidebar;