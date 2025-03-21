"use client"
import { useState, useEffect } from "react"
import { Pencil, Plus} from "lucide-react"
import "../css/PetProfile.css"
import VisitHistory from "./VisitHistory"
import { useConfirmDialog } from "../contexts/ConfirmDialogContext"
import { calculateAge } from "../components/DateCalculator"
import { useUserRole } from "../contexts/UserRoleContext"

export default function PetProfile() {
  const { hasPermission } = useUserRole()
  const { showConfirmDialog } = useConfirmDialog()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [editedPetData, setEditedPetData] = useState({})

  const [petData, setPetData] = useState({
    id: "012345",
    name: "Oreo",
    species: "Dog",
    breed: "Dalmatian",
    gender: "Female",
    birthday: "2021-05-06",
    age: {
      years: "03",
      months: "07",
    },
    color: "White w/ spots",
    status: "Alive",
    owner: "Princess Tan",
    email: "princess@gmail.com",
    contact: "0912345678",
    address: "Manila",
  })

  const vaccineTypes = [
    "3 in 1 (for Cats' 1st Vaccine)",
    "4 in 1 (for Cats' 2nd and succeeding shots)",
    "Kennel cough (for Dogs)",
    "2 in 1 (for Dogs' 1st Vaccine, usually for puppies)",
    "5 in 1 (for Dogs' 2nd and succeeding shots)",
    "Anti-rabies (3 months start or succeeding ages)",
  ]

  const [vaccinations, setVaccinations] = useState([
    { type: "2 in 1 (for Dogs' 1st Vaccine, usually for puppies)", doses: 1, date: "11/20/2024" },
    { type: "4 in 1 (for Cats' 2nd and succeeding shots)", doses: 2, date: "10/15/2024" },
  ])

  const [vaccineType, setVaccineType] = useState("")
  const [doses, setDoses] = useState("")
  const [date, setDate] = useState("")

  const getCurrentDate = () => {
    const today = new Date()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const year = today.getFullYear()
    return `${month}/${day}/${year}`
  }

  const formatDateToMMDDYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-")
    return `${month}/${day}/${year}`
  }

  const handleUpdateDose = (index) => {
    if (!hasPermission("canAddVaccination")) return

    setVaccinations((prevVaccinations) =>
      prevVaccinations.map((vax, i) =>
        i === index ? { ...vax, doses: Number(vax.doses) + 1, date: getCurrentDate() } : vax,
      ),
    )
  }

  const handleAddVaccination = () => {
    if (!hasPermission("canAddVaccination")) return

    if (!vaccineType || !doses || !date) {
      alert("Please fill in all fields.")
      return
    }
    const formattedDate = date ? formatDateToMMDDYYYY(date) : ""
    setVaccinations([...vaccinations, { type: vaccineType, doses: Number(doses), date: formattedDate }])
    setVaccineType("")
    setDoses("")
    setDate("")
  }

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

  useEffect(() => {
    const age = calculateAge(petData.birthday)
    setPetData((prevData) => ({ ...prevData, age }))
  }, [petData.birthday])

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
                  <span>{petData.id}</span>
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
                      <span>{petData.owner}</span>
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
