"use client"

import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import OwnerSidebar from "./components/OwnerSidebar";
import PatientDirectory from "./pages/PatientDirectory";
import PetProfile from "./pages/PetProfile";
import MyAccount from "./pages/MyAccount";
import OwnerMyAccount from "./pages/OwnerMyAccount";
import AddNewPet from "./pages/AddNewPet";
import LoginForm from "./pages/LoginForm";
import SignupPetOwner from "./pages/SignupPetOwner";
import SignupEmployee from "./pages/SignupEmployee";
import PetInfo from "./pages/PetInfo"; 
import AccessCode from "./pages/AccessCode"; 
import Landing from "./pages/Landing";
import { ConfirmDialogProvider } from "./contexts/ConfirmDialogContext";
import { DiagnosisLockProvider } from "./contexts/DiagnosisLockContext";
import RoleSwitcher from "./components/RoleSwitcher"
import { UserRoleProvider, useUserRole, ROLES } from "./contexts/UserRoleContext"

function ProtectedRoutes() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const { currentRole } = useUserRole()
  const isPetOwner = currentRole === ROLES.PET_OWNER

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible)
  }

  const handleMenuItemClick = () => {
    if (window.innerWidth <= 768) {
      setIsSidebarVisible(false);
    }
  };

 
  return (
    <>
      <Header toggleSidebar={toggleSidebar} />
      <RoleSwitcher />
      <div className="app-container">
        <div className="main-content">
          {isPetOwner ? (
             <OwnerSidebar className={isSidebarVisible ? "visible" : ""} onMenuItemClick={handleMenuItemClick} />
          ) : (
            <Sidebar className={isSidebarVisible ? "visible" : ""} onMenuItemClick={handleMenuItemClick} />
          )}
          <Routes>
            <Route path="/patients" element={<PatientDirectory />} />
            <Route path="/PetProfile/:pet_id" element={<PetProfile />} />
            {/* render diff account pages based on role */}
            <Route path="/account" element={isPetOwner ? <OwnerMyAccount /> : <MyAccount />} />
            {/* only pet owners can access add pet */}
            <Route path="/add-pet" element={isPetOwner ? <AddNewPet /> : <Navigate to="/patients" />} />
            {/*  */}
            <Route path="*" element={<Navigate to="/patients" />} />
          </Routes>
        </div>
      </div>
    </>
  )
}

function App() {
  return (
    <ConfirmDialogProvider>
      <DiagnosisLockProvider>
        <UserRoleProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup-petowner" element={<SignupPetOwner />} />
              <Route path="/signup-employee" element={<SignupEmployee />} />
              <Route path="/signup-petowner-petinfo" element={<PetInfo />} />
              <Route path="/signup-employee-accesscode" element={<AccessCode />} />
              {/* protectedRoutes component for authenticated routes */}
              <Route path="/*" element={<ProtectedRoutes />} />
            </Routes>
          </Router>
        </UserRoleProvider>
      </DiagnosisLockProvider>
    </ConfirmDialogProvider>
  )
}

export default App

