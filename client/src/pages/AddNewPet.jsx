"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "../css/AddNewPet.css";
import { useConfirmDialog } from "../contexts/ConfirmDialogContext";

export default function AddNewPet() {
  const [petData, setPetData] = useState({
    name: "",
    speciesDescription: "",
    gender: "male",
    breed: "",
    birthday: "",
  });
  
  const [errors, setErrors] = useState({
    name: "",
    speciesDescription: "",
    gender: "",
  });

  const navigate = useNavigate();
  const { showConfirmDialog } = useConfirmDialog();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPetData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: "", speciesDescription: "", gender: "" };
    
    if (!petData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }
    
    if (!petData.speciesDescription) {
      newErrors.speciesDescription = "Species is required";
      valid = false;
    }
    
    if (!petData.gender) {
      newErrors.gender = "Gender is required";
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    // Show confirmation dialog before submitting
    showConfirmDialog("Do you want to add this pet?", submitPet);
  };

  const submitPet = async () => {
    try {
      const response = await fetch("http://localhost:5000/pets/add", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(petData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error adding pet:", errorData.error);
        alert(`Error: ${errorData.error}`);
        return;
      }

      const result = await response.json();
      console.log("Pet added successfully:", result);
      //alert("Pet added successfully!");

      // Redirect to MyPets page
      navigate("/MyPets");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while adding the pet.");
    }
  };

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
              <label>Name<span className="required">*</span> 
                {errors.name && <span className="error-message-pet">{errors.name}</span>}
              </label>
              <input
                type="text"
                name="name"
                value={petData.name}
                onChange={handleInputChange}
                className={errors.name ? "input-error-pet" : ""}
              />
            </div>
            <div className="form-field">
              <label>Species<span className="required">*</span>
                {errors.speciesDescription && <span className="error-message-pet">{errors.speciesDescription}</span>}
              </label>
              <select
                name="speciesDescription"
                value={petData.speciesDescription}
                onChange={handleInputChange}
                className={errors.speciesDescription ? "input-error-pet" : ""}
              >
                <option value="">Select species</option>
                <option value="Dog (Standard)">Dog</option>
                <option value="Cat (Standard)">Cat</option>
                <option value="Snake (Exotic)">Snake</option>
                <option value="Turtles (Exotic)">Turtles</option>
                <option value="Birds (Exotic)">Birds</option>
                <option value="Rabbit (Exotic)">Rabbit</option>
                <option value="Lab Rat (Exotic)">Lab Rat</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Gender<span className="required">*</span>
                {errors.gender && <span className="error-message-pet">{errors.gender}</span>}
              </label>
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
              <label>Breed (Optional)</label>
              <input
                type="text"
                name="breed"
                value={petData.breed}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row birthday-row">
            <div className="form-field">
              <label>Birthday (Optional)</label>
              <div className="date-input">
                <input
                  type="date"
                  name="birthday"
                  value={petData.birthday}
                  onChange={handleInputChange}
                />
              </div>
            </div>
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
  );
}

