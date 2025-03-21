"use client"

import { useState } from "react"
import "../css/AddNewPet.css"

export default function AddNewPet() {
  const [petData, setPetData] = useState({
    name: "",
    species: "",
    gender: "male",
    breed: "",
    birthday: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPetData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(petData)
  }

  return (
    <div className="add-pet-container">
      <div className="add-pet-header">
        <h1>Add New Pet</h1>
        <p>Type in the required information to add new pet</p>
      </div>

      <div className="pet-form-container">
        <div className="form-section-header">
          <h2>Pet Information</h2>
        </div>

        <form onSubmit={handleSubmit} className="pet-form">
          <div className="form-row">
            <div className="form-field">
              <label>Name</label>
              <input type="text" name="name" value={petData.name} onChange={handleInputChange} required />
            </div>
            <div className="form-field">
              <label>Species</label>
              <select name="species" value={petData.species} onChange={handleInputChange} required>
                <option value="">Select species</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Rabbit">Rabbit</option>
                <option value="Snake">Snake</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Gender</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={petData.gender === "male"}
                    onChange={handleInputChange}
                  />
                  Male
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={petData.gender === "female"}
                    onChange={handleInputChange}
                  />
                  Female
                </label>
              </div>
            </div>
            <div className="form-field">
              <label>Breed</label>
              <input type="text" name="breed" value={petData.breed} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="form-row birthday-row">
            <div className="form-field">
              <label>Birthday (Optional)</label>
              <div className="date-input">
                <input type="date" name="birthday" value={petData.birthday} onChange={handleInputChange} />
              </div>
            </div>
            {/*  */}
            <div className="form-field empty-field"></div>
          </div>

          <div className="form-actions">
            <button type="submit" className="add-pet-btn">
              Add Pet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

