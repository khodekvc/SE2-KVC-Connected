"use client"

import { useState } from "react"
import AccountPage from "./AccountPage"

const OwnerMyAccount = () => {
  const [displayData, setDisplayData] = useState({
    firstName: "Jane",
    lastName: "Doe",
    role: "Pet Owner",
    email: "jane.doe@example.com",
    contactNumber: "+639987654321",
    emergencyContact1: { person: "", number: "" },
    emergencyContact2: { person: "", number: "" },
    address: "123 Main St, City, Country",
  })
  const [editData, setEditData] = useState({ ...displayData })

  const processEmergencyContacts = (data) => {
    const processedData = { ...data }

    // If emergency contact 1 is empty but emergency contact 2 has data
    if (
      !processedData.emergencyContact1.person &&
      !processedData.emergencyContact1.number &&
      (processedData.emergencyContact2.person || processedData.emergencyContact2.number)
    ) {
      // Move emergency contact 2 data to emergency contact 1
      processedData.emergencyContact1 = { ...processedData.emergencyContact2 }
      processedData.emergencyContact2 = { person: "", number: "" }
    }

    // Clean up empty emergency contacts
    if (!processedData.emergencyContact1.person && !processedData.emergencyContact1.number) {
      processedData.emergencyContact1 = { person: "", number: "" }
    }
    if (!processedData.emergencyContact2.person && !processedData.emergencyContact2.number) {
      processedData.emergencyContact2 = { person: "", number: "" }
    }

    return processedData
  }

  const handleSave = (updatedData) => {
    const processedData = processEmergencyContacts(updatedData)
    setDisplayData(processedData)
    setEditData(processedData)
    return processedData // Return processed data for AccountPage to use
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setEditData((prevData) => {
      const keys = name.split(".")
      if (keys.length > 1) {
        return {
          ...prevData,
          [keys[0]]: {
            ...prevData[keys[0]],
            [keys[1]]: value,
          },
        }
      }
      return { ...prevData, [name]: value }
    })
  }

  // Process display data to ensure emergency contacts are properly shown
  const processedDisplayData = processEmergencyContacts(displayData)

  return (
    <AccountPage title="My Account" displayData={processedDisplayData} initialUserData={editData} onSave={handleSave}>
      {({ isEditing, userData, handleInputChange: parentHandleInputChange }) => (
        <div className="info-grid">
          <div className="info-column">
            <div className="info-group">
              <label>First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={userData.firstName}
                  onChange={(e) => parentHandleInputChange(e)}
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
                  onChange={(e) => parentHandleInputChange(e)}
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
                  onChange={(e) => parentHandleInputChange(e)}
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
                  onChange={(e) => parentHandleInputChange(e)}
                  className="info-input"
                />
              ) : (
                <div className="info-value">{userData.contactNumber}</div>
              )}
            </div>
          </div>

          <div className="info-column">
            <div className="info-group">
              <label>Emergency Contact Person 1</label>
              {isEditing ? (
                <input
                  type="text"
                  name="emergencyContact1.person"
                  value={userData.emergencyContact1.person}
                  onChange={(e) => {
                    handleInputChange(e)
                    parentHandleInputChange({
                      target: {
                        name: "emergencyContact1",
                        value: {
                          ...userData.emergencyContact1,
                          person: e.target.value || "",
                        },
                      },
                    })
                  }}
                  className="info-input"
                />
              ) : (
                <div className="info-value">{processedDisplayData.emergencyContact1.person || "Not provided"}</div>
              )}
            </div>
            <div className="info-group">
              <label>Emergency Contact Number 1</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="emergencyContact1.number"
                  value={userData.emergencyContact1.number}
                  onChange={(e) => {
                    handleInputChange(e)
                    parentHandleInputChange({
                      target: {
                        name: "emergencyContact1",
                        value: {
                          ...userData.emergencyContact1,
                          number: e.target.value || "",
                        },
                      },
                    })
                  }}
                  className="info-input"
                />
              ) : (
                <div className="info-value">{processedDisplayData.emergencyContact1.number || "Not provided"}</div>
              )}
            </div>
          </div>

          {(isEditing ||
            (processedDisplayData.emergencyContact2 &&
              (processedDisplayData.emergencyContact2.person || processedDisplayData.emergencyContact2.number))) && (
            <div className="info-column">
              <div className="info-group">
                <label>Emergency Contact Person 2</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="emergencyContact2.person"
                    value={userData.emergencyContact2?.person || ""}
                    onChange={(e) =>
                      parentHandleInputChange({
                        target: {
                          name: "emergencyContact2",
                          value: { ...userData.emergencyContact2, person: e.target.value },
                        },
                      })
                    }
                    className="info-input"
                  />
                ) : (
                  <div className="info-value">{processedDisplayData.emergencyContact2?.person || "Not provided"}</div>
                )}
              </div>
              <div className="info-group">
                <label>Emergency Contact Number 2</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="emergencyContact2.number"
                    value={userData.emergencyContact2?.number || ""}
                    onChange={(e) =>
                      parentHandleInputChange({
                        target: {
                          name: "emergencyContact2",
                          value: { ...userData.emergencyContact2, number: e.target.value },
                        },
                      })
                    }
                    className="info-input"
                  />
                ) : (
                  <div className="info-value">{processedDisplayData.emergencyContact2?.number || "Not provided"}</div>
                )}
              </div>
            </div>
          )}

          <div className="info-group full-width">
            <label>Address</label>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={userData.address}
                onChange={handleInputChange}
                className="info-input"
              />
            ) : (
              <div className="info-value">{userData.address}</div>
            )}
          </div>
        </div>
      )}
    </AccountPage>
  )
}

export default OwnerMyAccount

