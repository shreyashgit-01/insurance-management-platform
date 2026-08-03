import {
  Outlet,
  NavLink,
  useNavigate,
} from "react-router-dom";

import BrandLogo from "../components/ui/BrandLogo";

import {
  FaHome,
  FaUsers,
  FaFileContract,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaFolderOpen,
  FaSignOutAlt,
  FaBell,
  FaUserCircle,
  FaCog,
} from "react-icons/fa";

import "../styles/layout.css";

function MainLayout() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username") || "User";

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <BrandLogo />

        <div className="menu-section-title">
          MAIN MENU
        </div>

        <div className="sidebar-menu">

          <NavLink to="/dashboard" className="menu-link">
            <FaHome className="menu-icon" />
            Dashboard
          </NavLink>

          {/* Admin & Agent only */}
{["ADMIN", "AGENT"].includes(role) && (
  <NavLink to="/customers" className="menu-link">
    <FaUsers className="menu-icon" />
    Customers
  </NavLink>
)}

{/* Available to all roles */}
{["ADMIN", "AGENT", "CUSTOMER"].includes(role) && (
  <>
    <NavLink to="/policies" className="menu-link">
      <FaFileContract className="menu-icon" />
      Policies
    </NavLink>

    <NavLink to="/claims" className="menu-link">
      <FaFileInvoiceDollar className="menu-icon" />
      Claims
    </NavLink>

    <NavLink to="/payments" className="menu-link">
      <FaMoneyBillWave className="menu-icon" />
      Payments
    </NavLink>

    <NavLink to="/documents" className="menu-link">
      <FaFolderOpen className="menu-icon" />
      Documents
    </NavLink>
  </>
)}

        </div>

        <div className="storage-card">
          <div className="storage-header">
            Storage
            <span>76%</span>
          </div>

          <div className="storage-bar">
            <div className="storage-progress"></div>
          </div>

          <small>1,524 Documents Stored</small>
        </div>

        <div className="user-card">

          <div className="user-avatar">
            {username.charAt(0).toUpperCase()}
          </div>

          <div className="user-name">
            {username}
          </div>

          <div className="user-role">
            {role}
          </div>

          <button className="settings-btn">
            <FaCog />
            Settings
          </button>

          <button
            className="logout-btn"
            onClick={logout}
          >
            <FaSignOutAlt />
            Logout
          </button>

        </div>

      </aside>

      <main className="main-content">

        <div className="topbar">

          <div>

            <div className="page-title">
              Insurance Analytics
            </div>

            <div className="page-subtitle">
              Monitor policies, claims and premium collection.
            </div>

          </div>

          <div className="topbar-right">

            <div className="icon-circle">
              <FaBell />
            </div>

            <div className="profile-chip">

              <FaUserCircle size={22} />

              <div>

                <div className="profile-name">
                  {username}
                </div>

                <div className="profile-role">
                  {role}
                </div>

              </div>

            </div>

          </div>

        </div>

        <div className="page-container">
          <Outlet />
        </div>

      </main>
    </div>
  );
}

export default MainLayout;