import { Menu, LogOut } from "lucide-react";
import "../css/Header.css";
import { Link } from 'react-router-dom';
import React from 'react';

const Header = ({ toggleSidebar }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button className="burger-menu" onClick={toggleSidebar} aria-label="menu">
          <Menu size={24} />
        </button>
        <div className="logo-container">
          <img src="/logo.png" alt="Kho Veterinary Clinic Logo" className="logo" />
        </div>
        <div className="header-text">
          <h1>KHO VETERINARY CLINIC</h1>
          <p>Four paws, two feet, one heart</p>
        </div>
      </div>
      <Link to="/" className="logout-link">
        <button className="logout-btn">
          <span className="logout-text">LOG OUT</span>
          <LogOut size={24} className="logout-icon" />
        </button>
      </Link>
    </header>
  );
};

export default Header;