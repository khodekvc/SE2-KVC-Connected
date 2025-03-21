"use client"

import { UserCircle, Folder, PawPrint } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import "../css/Sidebar.css"

export default function OwnerSidebar({ className = "", onMenuItemClick }) {
  const location = useLocation()

  const handleClick = (path) => {
    if (onMenuItemClick) {
      onMenuItemClick()
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className={`sidebar desktop-sidebar ${className}`}>
        <Link
          to="/account"
          className={`sidebar-item ${location.pathname === "/account" ? "active" : ""}`}
          onClick={() => handleClick("/account")}
        >
          <UserCircle size={40} />
        </Link>
        <Link
          to="/patients"
          className={`sidebar-item ${location.pathname === "/patients" ? "active" : ""}`}
          onClick={() => handleClick("/patients")}
        >
          <Folder size={24} fill="currentColor" />
        </Link>
        <Link
          to="/add-pet"
          className={`sidebar-item ${location.pathname === "/add-pet" ? "active" : ""}`}
          onClick={() => handleClick("/add-pet")}
        >
          <PawPrint size={24} />
        </Link>
      </nav>

      {/* Mobile Menu */}
      <nav className={`sidebar mobile-sidebar ${className}`}>
        <div className="mobile-menu">
          <Link
            to="/account"
            className={`mobile-menu-item ${location.pathname === "/account" ? "active" : ""}`}
            onClick={() => handleClick("/account")}
          >
            <UserCircle size={24} />
            <span>My Account</span>
          </Link>
          <Link
            to="/patients"
            className={`mobile-menu-item ${location.pathname === "/patients" ? "active" : ""}`}
            onClick={() => handleClick("/patients")}
          >
            <Folder size={24} />
            <span>Patient Directory</span>
          </Link>
          <Link
            to="/add-pet"
            className={`mobile-menu-item ${location.pathname === "/add-pet" ? "active" : ""}`}
            onClick={() => handleClick("/add-pet")}
          >
            <PawPrint size={24} />
            <span>Add New Pet</span>
          </Link>
        </div>
      </nav>
    </>
  )
}

