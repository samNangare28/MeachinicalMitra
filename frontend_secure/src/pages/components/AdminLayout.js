import { useState } from "react";
import "./AdminLayout.css";
import Sidebar from "./Sidebar";
import { FaBars } from "react-icons/fa";

function AdminLayout({ children }) {

    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="admin-layout">

            <div className={`admin-sidebar-wrap ${mobileOpen ? "open" : ""}`}>
                <Sidebar onClose={() => setMobileOpen(false)} />
            </div>

            {mobileOpen && (
                <div className="admin-sidebar-backdrop" onClick={() => setMobileOpen(false)} />
            )}

            <div className="admin-content-area">
                <button
                    className="admin-mobile-toggle"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open admin menu"
                >
                    <FaBars /> Menu
                </button>

                <main className="admin-main">
                    {children}
                </main>
            </div>

        </div>
    );

}

export default AdminLayout;
