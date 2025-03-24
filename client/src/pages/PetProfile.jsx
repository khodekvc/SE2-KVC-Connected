"use client";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Pencil, Plus } from "lucide-react";
import "../css/PetProfile.css";
import VisitHistory from "./VisitHistory";
import { useConfirmDialog } from "../contexts/ConfirmDialogContext";
import { calculateAge } from "../components/DateCalculator";
import { useUserRole } from "../contexts/UserRoleContext";
import { useCallback } from "react";

export default function PetProfile() {
  const { pet_id } = useParams();
  const { hasPermission } = useUserRole();
  const { showConfirmDialog } = useConfirmDialog();

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editedPetData, setEditedPetData] = useState({});
  const [petData, setPetData] = useState(null);
  const [vaccinations, setVaccinations] = useState([]); // Move this above fetchPetData
  const [vaccineType, setVaccineType] = useState("");
  const [doses, setDoses] = useState("");
  const [date, setDate] = useState("");

  const vaccineTypes = [
    "3 in 1 (for Cats' 1st Vaccine)",
    "4 in 1 (for Cats' 2nd and succeeding shots)",
    "Kennel cough (for Dogs)",
    "2 in 1 (for Dogs' 1st Vaccine, usually for puppies)",
    "5 in 1 (for Dogs' 2nd and succeeding shots)",
    "Anti-rabies (3 months start or succeeding ages)",
  ]

  const fetchVaccinationRecords = useCallback(async (petId) => {
    try {
      const response = await fetch(`http://localhost:5000/vax/pets/${petId}/viewVaccines`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch vaccination records");
      }

      const data = await response.json();
      console.log("Fetched vaccination records:", data);
      setVaccinations(data); // Update vaccinations state
    } catch (error) {
      console.error("Error fetching vaccination records:", error);
    }
  }, []);
  useEffect(() => {
  const fetchPetData = async () => {
    try {
      console.log("Fetching pet data for pet_id:", pet_id);
      const response = await fetch(`http://localhost:5000/pets/${pet_id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pet data");
      }

      const data = await response.json();
      console.log("Fetched pet data:", data);

      const age = calculateAge(data.birthday);
      setPetData({ ...data, age });
      setVaccinations(data.vaccinations || []);
    } catch (error) {
      console.error("Error fetching pet data:", error);
    }
  };

  fetchPetData();
  fetchVaccinationRecords(pet_id); // Fetch vaccination records
}, [pet_id, fetchVaccinationRecords]);


  if (!petData) {
    return <div>Loading...</div>; // Show a loading message while fetching data
  }

  const getCurrentDate = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const year = today.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatDateToMMDDYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${month}/${day}/${year}`;
  };

  const handleUpdateDose = (index) => {
    if (!hasPermission("canAddVaccination")) return;

    setVaccinations((prevVaccinations) =>
      prevVaccinations.map((vax, i) =>
        i === index ? { ...vax, doses: Number(vax.doses) + 1, date: getCurrentDate() } : vax
      )
    );
  };

  const handleAddVaccination = async () => {
    if (!hasPermission("canAddVaccination")) return;

    if (!vaccineType || !doses || !date) {
      alert("Please fill in all fields.");
      return;
    }

    const formattedDate = date ? formatDateToMMDDYYYY(date) : "";

    try {
      const response = await fetch(`http://localhost:5000/pets/${pet_id}/vaccines`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vax_type: vaccineType,
          imm_rec_quantity: Number(doses),
          imm_rec_date: formattedDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add vaccination record");
      }

      const newRecord = await response.json();
      console.log("Added vaccination record:", newRecord);

      // Update the vaccinations state with the new record
      setVaccinations((prevVaccinations) => [...prevVaccinations, newRecord]);
      setVaccineType("");
      setDoses("");
      setDate("");
    } catch (error) {
      console.error("Error adding vaccination record:", error);
    }
  };

  const handleEdit = () => {
    if (!hasPermission("canEditPetProfile")) return

    setIsEditing(true)
    setEditedPetData({ ...petData })
  }

  const handleSave = () => {
    showConfirmDialog("Do you want to save your changes?", () => {
      const newAge = calculateAge(editedPetData.birthday)
      const updatedPetData = { ...editedPetData, age: newAge }
      setPetData(updatedPetData)
      setIsEditing(false)
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedPetData({})
  }

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setEditedPetData((prev) => {
      const updatedData = { ...prev, [name]: type === "radio" ? e.target.id : value }
      if (name === "birthday") {
        const newAge = calculateAge(value)
        updatedData.age = newAge
      }
      return updatedData
    })
  }

  /*const [age, setAge] = useState(null);

  useEffect(() => {
    if (petData?.birthday) {
      setAge(calculateAge(petData.birthday));
    }
  }, [petData?.birthday]);*/

  return (
    <div className="pet-profile-page">
      <div className="tabs">
        <button className={`tab ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>
          Pet Profile
        </button>
        <button className={`tab ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>
          Visit History
        </button>
      </div>

      <div className="content-area">
        {activeTab === "profile" ? (
          <div className="profile-content">
            <div className="pet-details">
              <div className="section-header">
                <h2>Pet Profile</h2>
                {hasPermission("canEditPetProfile") && !isEditing && (
                  <button className="edit-button" onClick={handleEdit}>
                    <Pencil size={16} />
                  </button>
                )}
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <label>ID</label>
                  <span>{petData.pet_id}</span>
                </div>
                <div className="detail-item">
                  <label>Name</label>
                  {isEditing ? (
                    <input type="text" name="name" value={editedPetData.name || ""} onChange={handleInputChange} />
                  ) : (
                    <span>{petData.name}</span>
                  )}
                </div>
                <div className="detail-item">
                  <label>Species</label>
                  {isEditing ? (
                    <select name="species" value={editedPetData.species || ""} onChange={handleInputChange}>
                      <option value="Dog">Dog (Standard)</option>
                      <option value="Cat">Cat (Standard)</option>
                      <option value="Snake">Snake (Exotic)</option>
                      <option value="Turtle">Turtle (Exotic)</option>
                      <option value="Bird">Bird (Exotic)</option>
                      <option value="Rabbit">Rabbit (Exotic)</option>
                      <option value="Lab Rat">Lab Rat (Exotic)</option>
                      <option value="Others">Others</option>
                    </select>
                  ) : (
                    <span>{petData.species}</span>
                  )}
                </div>
                <div className="detail-item">
                  <label>Breed</label>
                  {isEditing ? (
                    <input type="text" name="breed" value={editedPetData.breed || ""} onChange={handleInputChange} />
                  ) : (
                    <span>{petData.breed}</span>
                  )}
                </div>
                <div className="detail-item">
                  <label>Gender</label>
                  {isEditing ? (
                    <div className="radio-group">
                      <label>
                        <input
                          type="radio"
                          name="gender"
                          id="Male"
                          checked={editedPetData.gender === "Male"}
                          onChange={handleInputChange}
                        />
                        Male
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="gender"
                          id="Female"
                          checked={editedPetData.gender === "Female"}
                          onChange={handleInputChange}
                        />
                        Female
                      </label>
                    </div>
                  ) : (
                    <span>{petData.gender}</span>
                  )}
                </div>
                <div className="detail-item">
                  <label>Birthday</label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="birthday"
                      value={editedPetData.birthday || ""}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <span>{new Date(petData.birthday).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="detail-item">
                  <label>Age</label>
                  <span>
                    <span className="age-unit">Years</span>
                    <span className="age-value">{isEditing ? editedPetData.age.years : petData.age.years}</span>
                    <span className="age-unit">Months</span>
                    <span className="age-value">{isEditing ? editedPetData.age.months : petData.age.months}</span>
                  </span>
                </div>
                <div className="detail-item">
                  <label>Color</label>
                  {isEditing ? (
                    <input type="text" name="color" value={editedPetData.color || ""} onChange={handleInputChange} />
                  ) : (
                    <span>{petData.color}</span>
                  )}
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  {isEditing ? (
                    <div className="radio-group">
                      <label>
                        <input
                          type="radio"
                          name="status"
                          id="Alive"
                          checked={editedPetData.status === "Alive"}
                          onChange={handleInputChange}
                        />
                        Alive
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="status"
                          id="Deceased"
                          checked={editedPetData.status === "Deceased"}
                          onChange={handleInputChange}
                        />
                        Deceased
                      </label>
                    </div>
                  ) : (
                    <span>{petData.status}</span>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="edit-actions">
                  <button className="save-button" onClick={handleSave}>
                    Save
                  </button>
                  <button className="cancell-button" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              )}

              {hasPermission("canViewContactInfo") && (
                <>
                  <h3 className="contact-header">Contact Details</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <label>Owner</label>
                      <span>{petData.owner_name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email</label>
                      <span>{petData.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Contact no.</label>
                      <span>{petData.contact}</span>
                    </div>
                    <div className="detail-item">
                      <label>Address</label>
                      <span>{petData.address}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="separator"></div>

            <div className="vaccination-record">
              <h2>Vaccination Record</h2>

              {hasPermission("canAddVaccination") && (
                <div className="vaccination-form">
                  <div className="form-group">
                    <label>
                      Type of Vaccine<span className="required">*</span>
                    </label>
                    {/* Changed from input to select dropdown */}
                    <select
                      name="vaccineType"
                      value={vaccineType}
                      onChange={(e) => setVaccineType(e.target.value)}
                      className="vaccine-select"
                    >
                      <option value="">Select vaccine type</option>
                      {vaccineTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      Doses (Qty.)<span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      name="doses"
                      value={doses}
                      onChange={(e) => setDoses(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <div className="date-input">
                      <input
                        type="date"
                        placeholder="Select date"
                        name="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <button className="add-button" onClick={handleAddVaccination}>
                    <Plus size={16} />
                    Add
                  </button>
                </div>
              )}

              <div className="vaccination-table">
                <table>
                  <thead>
                    <tr>
                      <th>Type of Vaccine</th>
                      <th>Doses (Qty.)</th>
                      <th>Date</th>
                      {hasPermission("canAddVaccination") && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {vaccinations.map((vax, index) => (
                      <tr key={index}>
                        <td>{vax.type}</td>
                        <td>{vax.doses}</td>
                        <td>{vax.date}</td>
                        {hasPermission("canAddVaccination") && (
                          <td>
                            <button className="add-dose" onClick={() => handleUpdateDose(index)}>
                              +
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="history-content">
            <VisitHistory />
          </div>
        )}
      </div>
    </div>
  )
}