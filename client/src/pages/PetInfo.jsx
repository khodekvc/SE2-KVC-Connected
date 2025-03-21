import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { Button } from '../components/Button';
import FormGroup from '../components/FormGroup';
import "../css/Forms.css";

const PetInfo = () => {
  const [formData, setFormData] = useState({
    petname: "",
    gender: "",
    species: "",
    breed: "",
    birthdate: "",
    captcha: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Pet Info Submitted:", formData);
  };

  return (
    <>
    <Navbar />
    <div className="petinfo-container">
        <div className="left-section">
          <h1>KHO<br /> VETERINARY<br /> CLINIC</h1>
          <div className="alternate-links">
            <Button buttonStyle='btn--primary' to='/signup-employee' className="form-btn-2">Sign up as Employee</Button>
            <p>Not a Pet Owner?</p>
          </div>
        </div>
      <div className="right-section">
        <h2>Create Account</h2>
        <p>Your pet's care starts here!</p>
        <form onSubmit={handleSubmit}>
          <div className="signup-form-row">
            <FormGroup 
              label="Pet Name" 
              type="text" 
              name="petname" 
              value={formData.petname} 
              onChange={handleChange} 
              required 
            />
            
            <div className="radio">
              <label>Gender*</label>
              <div className="radio-group">
                <input 
                  type="radio" 
                  id="male" 
                  name="gender" 
                  value="male" 
                  onChange={handleChange} 
                  required 
                />
                <label htmlFor="male">Male</label>

                <input 
                  type="radio" 
                  id="female" 
                  name="gender" 
                  value="female" 
                  onChange={handleChange} 
                  required 
                />
                <label htmlFor="female">Female</label>
              </div>
            </div>
          </div>

          <div className="signup-form-row">
          <FormGroup 
              label="Pet Species" 
              type="select" 
              name="species" 
              value={formData.species} 
              onChange={handleChange} 
              required 
              selectOptions={[
                "Dog (Standard)",
                "Cat (Standard)",
                "Snake (Exotic)",
                "Turtle (Exotic)",
                "Bird (Exotic)",
                "Rabbit (Exotic)",
                "Lab Rat (Exotic)",
                "Others"
              ]} 
            />
            <FormGroup 
              label="Pet Breed (Optional)" 
              type="text" 
              name="breed" 
              value={formData.breed} 
              onChange={handleChange} 
            />
          </div>

          <FormGroup 
            label="Birthday (Optional)" 
            type="date" 
            name="birthdate" 
            value={formData.birthdate} 
            onChange={handleChange} 
          />

          <div className="signup-form-row">
          <FormGroup 
            label="Emergency Contact Person" 
            type="text" 
            name="emergencyperson" 
            value={formData.emergencyperson} 
            onChange={handleChange} 
            required
          />
          <FormGroup 
            label="Emergency Contact Number" 
            type="text" 
            name="emergencynumber" 
            value={formData.emergencynumber} 
            onChange={handleChange}
            required 
          />
          </div>

          <div className="forms-group captcha">
            <label htmlFor="captcha">Enter Captcha</label>
            <div className="captcha-container">
              <img className="generated" src="SignUpPetOwnerServlet" alt="CAPTCHA" id="captchaImage" />
              <input 
                type="text" 
                id="captcha" 
                name="captcha" 
                value={formData.captcha} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="button-group">
            <Button buttonStyle='btn--secondary' onClick={() => window.history.back()} className="form-btn-3">BACK</Button>
            <Button buttonStyle='btn--primary' type="submit" className="form-btn-1" to="/patients">SIGN UP</Button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default PetInfo;
