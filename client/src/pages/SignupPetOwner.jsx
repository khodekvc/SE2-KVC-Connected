import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { Button } from '../components/Button';
import FormGroup from '../components/FormGroup';
import "../css/Forms.css";

const SignupPetOwner = () => {
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    contact: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Signing up pet owner:", formData);
    try {
      const response = await fetch("http://localhost:5000/auth/signup/petowner-step1", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");

      const token = response.headers.get("Authorization")?.split(" ")[1] || data.token;
      if (token) {
        localStorage.setItem("jwt", token);
      }

      setMessage(data.message);
      window.location.replace(data.redirectUrl)
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <>
    <Navbar />
    <div className="signup-container">
      <div className="left-section">
        <h1>KHO<br /> VETERINARY<br /> CLINIC</h1>
        <div className="alternate-links">
          <Link to="/signup-employee">
            <Button buttonStyle="btn--primary" className="form-btn-2">Sign up as Employee</Button>
          </Link>
            <p>Not a Pet Owner?</p>
        </div>
      </div>
      <div className="right-section">
        <h2>Create Account</h2>
        <p>Your pet's care starts here!</p>
        <form onSubmit={handleSubmit}>
          <div className="signup-form-row">
            <FormGroup 
              label="First Name" 
              type="text" 
              name="fname" 
              value={formData.fname} 
              onChange={handleChange} 
              required 
            />
            <FormGroup 
              label="Last Name" 
              type="text" 
              name="lname" 
              value={formData.lname} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="signup-form-row">
            <FormGroup 
              label="Email" 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
            <FormGroup 
              label="Contact Number" 
              type="text" 
              name="contact" 
              value={formData.contact} 
              onChange={handleChange} 
              required 
            />
          </div>

          <FormGroup 
            label="Address" 
            type="text" 
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
            required 
          />

          <FormGroup 
            label="Password" 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />

          <FormGroup 
            label="Confirm Password" 
            type="password" 
            name="confirmPassword" 
            value={formData.confirmPassword} 
            onChange={handleChange} 
            required 
          />

          <Button buttonStyle='btn--secondary' type='submit' className="form-btn-3">NEXT</Button>
        </form>
        
      </div>

    </div>
    </>
  );
};

export default SignupPetOwner;
