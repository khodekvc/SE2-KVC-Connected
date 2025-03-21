"use client"

import { useState, useEffect } from "react"
import { Pencil, Save, Eye, EyeOff } from "lucide-react"
import "../css/AccountPage.css"

const AccountPage = ({ title, displayData, initialUserData, onSave, children }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [userData, setUserData] = useState(initialUserData)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
  const fetchUserData = async () => {
    try {
      const response = await fetch("http://localhost:5000/user/me", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      console.log("Fetched user data:", data);
      setUserData(data); // Set the fetched user data
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  fetchUserData();
}, []);

  const handleEdit = () => {
    setIsEditing(true)
    setUserData(initialUserData)
  }

  const handleSave = async (updatedData) => {
    try {
      const response = await fetch("http://localhost:5000/user/update-employee-profile", {
        method: "PUT", // Matches the backend `updateEmployeeProfile` method
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to save user data");
      }

      const data = await response.json();
      console.log("Updated user data:", data);

      setIsEditing(false); // Exit edit mode
      onSave(data); // Call the onSave function to update the parent component
    } catch (error) {
      console.error("Error saving user data:", error);
      alert("Failed to save user data. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleSavePassword = async () => {
  try {
    console.log("Password Data:", passwordData); // Debug the password data being sent

    const response = await fetch("http://localhost:5000/user/change-password", {
      method: "POST",
      credentials: "include", // Include cookies for authentication
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(passwordData), // Send currentPassword, newPassword, and confirmPassword
    });

    if (!response.ok) {
      const errorData = await response.json(); // Log the backend error response
      console.error("Backend Error:", errorData);
      throw new Error(errorData.error || "Failed to change password");
    }

    const data = await response.json();
    console.log("Password changed successfully:", data);

    // Reset password fields and exit password change mode
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    alert("Password changed successfully!");
  } catch (error) {
    console.error("Error changing password:", error);
    alert(error.message || "Failed to change password. Please try again.");
  }
};

  return (
    <div className="account-page">
      <div className="account-container">
        <h1>{title}</h1>

        <div className="profile-container">
          <div className="profile-section">
            <div className="avatar-container">
              <div className="avatar-placeholder"></div>
              <h2>{`${displayData.firstname} ${displayData.lastname}`}</h2>
              <p className="role">{displayData.role}</p>
            </div>

            <div className="info-section">
              {!isChangingPassword && (
                <>
                  <div className="info-card">
                    <div className="card-header">
                      <h3>Personal Information</h3>
                      {isEditing ? (
                        <button className="save-profile-btn" onClick={() => handleSave(userData)}>
                          <Save size={16} />
                          Save
                        </button>
                      ) : (
                        <button className="edit-profile-btn" onClick={handleEdit}>
                          <Pencil size={16} />
                          Edit Profile
                        </button>
                      )}
                    </div>

                    {children({ isEditing, userData, displayData, handleInputChange })}
                  </div>

                  <div className="info-card">
                    <div className="card-header">
                      <h3>Change Password</h3>
                      <button className="change-btn" onClick={() => setIsChangingPassword(true)}>
                        Change
                      </button>
                    </div>

                    <div className="password-section">
                      <label>Password</label>
                      <input type="password" value="••••••••••••••••••••••" readOnly className="password-input" />
                    </div>
                  </div>
                </>
              )}

              {isChangingPassword && (
                <div className="info-card full-width">
                  <div className="card-header">
                    <h3>Change Password</h3>
                  </div>
                  <div className="password-change-section">
                    <div className="password-group">
                      <label>Current Password</label>
                      <div className="password-input-container">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="password-input"
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() => togglePasswordVisibility("current")}
                        >
                          {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="password-group">
                      <label>New Password</label>
                      <div className="password-input-container">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="password-input"
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() => togglePasswordVisibility("new")}
                        >
                          {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="password-group">
                      <label>Confirm Password</label>
                      <div className="password-input-container">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="password-input"
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() => togglePasswordVisibility("confirm")}
                        >
                          {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="password-actions">
                      <button className="save-changes-btn" onClick={handleSavePassword}>
                        Save Changes
                      </button>
                      <button className="cancel-btn" onClick={() => setIsChangingPassword(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountPage

