"use client"

import { useState, useEffect } from "react"
import AccountPage from "./AccountPage"

const MyAccount = () => {
  const [displayData, setDisplayData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:5000/user/me", {
          method: "GET",
          credentials: "include", // Include cookies for authentication
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        console.log("Fetched user data:", data);

        // Set the fetched data to state
        setDisplayData({
          firstname: data.firstname,
          lastname: data.lastname,
          role: data.role,
          email: data.email,
          contact: data.contact,
        });
        setEditData({
          firstname: data.firstname,
          lastname: data.lastname,
          role: data.role,
          email: data.email,
          contact: data.contact,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false); // Stop loading once the data is fetched
      }
    };

    fetchUserData();
  }, []);

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

  if (isLoading) {
    return <div>Loading...</div>; // Show a loading message while fetching data
  }

  if (error) {
    return <div>Error: {error}</div>; // Show an error message if fetching fails
  }

  return (
    <AccountPage
      title="My Account"
      displayData={displayData}
      initialUserData={editData}
      onSave={handleSave}>
      {({ isEditing, userData, displayData, handleInputChange }) => (
        <div className="info-grid clinician-grid">
          <div className="info-column">
            <div className="info-group">
              <label>First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstname"
                  value={userData.firstname}
                  onChange={handleInputChange}
                  className="info-input"
                />
              ) : (
                <div className="info-value">{userData.firstname}</div>
              )}
            </div>
            <div className="info-group">
              <label>Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastname"
                  value={userData.lastname}
                  onChange={handleInputChange}
                  className="info-input"
                />
              ) : (
                <div className="info-value">{userData.lastname}</div>
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
                  name="contact"
                  value={userData.contact}
                  onChange={handleInputChange}
                  className="info-input"
                />
              ) : (
                <div className="info-value">{userData.contact}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </AccountPage>
  )
}

export default MyAccount

