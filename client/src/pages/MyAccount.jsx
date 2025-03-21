"use client"

import { useState } from "react"
import AccountPage from "./AccountPage"

const MyAccount = () => {
  const [displayData, setDisplayData] = useState({
    firstName: "John",
    lastName: "Kho",
    role: "Clinician",
    email: "cliniciankho1@gmail.com",
    contactNumber: "+639123456789",
  })
  const [editData, setEditData] = useState({ ...displayData })

  const handleSave = (updatedData) => {
    setDisplayData(updatedData)
    setEditData(updatedData)
    // Here you would typically send the updated data to your backend
    console.log("Saving updated user data:", updatedData)
  }

  return (
    <AccountPage title="My Account" displayData={displayData} initialUserData={editData} onSave={handleSave}>
      {({ isEditing, userData, displayData, handleInputChange }) => (
        <div className="info-grid clinician-grid">
          <div className="info-column">
            <div className="info-group">
              <label>First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleInputChange}
                  className="info-input"
                />
              ) : (
                <div className="info-value">{userData.firstName}</div>
              )}
            </div>
            <div className="info-group">
              <label>Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleInputChange}
                  className="info-input"
                />
              ) : (
                <div className="info-value">{userData.lastName}</div>
              )}
            </div>
          </div>

          <div className="info-column">
            <div className="info-group">
              <label>Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  className="info-input"
                />
              ) : (
                <div className="info-value">{userData.email}</div>
              )}
            </div>
            <div className="info-group">
              <label>Contact Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="contactNumber"
                  value={userData.contactNumber}
                  onChange={handleInputChange}
                  className="info-input"
                />
              ) : (
                <div className="info-value">{userData.contactNumber}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </AccountPage>
  )
}

export default MyAccount

