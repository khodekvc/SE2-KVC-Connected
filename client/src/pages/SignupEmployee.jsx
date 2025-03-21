import React from 'react';
import { useState } from "react";
import Navbar from '../components/Navbar';
import { Button } from '../components/Button';
import FormGroup from '../components/FormGroup';
import "../css/Forms.css";

const SignupEmployee = () => {
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    contact: "",
    role: "",
    password: "",
    confirmPassword: "",
    captcha: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Signing up employee:", formData);
  };

  return (
    <>
    <Navbar />
    <div className="signup-container">
      <div className="left-section">
        <h1>KHO<br /> VETERINARY<br /> CLINIC</h1>
        <div className="alternate-links">
          <Button buttonStyle='btn--primary' to='/signup-petowner' className="form-btn-2">Sign up as Pet Owner</Button>
          <p>Not an Employee?</p>
        </div>
      </div>
      <div className="right-section">
        <h2>Create Account</h2>
        <p>Become part of our team!</p>
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
          />
          </div>
          <div className="radio">
            <label>Choose Role*</label>
            <div className="radio-group">
              <input 
                type="radio" 
                id="clinicians" 
                name="role" 
                value="clinician" 
                onChange={handleChange} 
                required 
              />
              <label htmlFor="clinicians">Clinician</label>
              <input 
                type="radio" 
                id="staff" 
                name="role" 
                value="staff" 
                onChange={handleChange} 
                required 
              />
              <label htmlFor="staff">Front Desk Staff</label>
            </div>
          </div>
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
          <div className="forms-group captcha">
            <label htmlFor="captcha">Enter Captcha</label>
            <div className="captcha-container">
              <img className="generated" src="LoginServlet" alt="CAPTCHA" id="captchaImage" />
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
          <Button buttonStyle='btn--primary' to='/signup-employee-accesscode' className="form-btn-1">SIGN UP</Button>
        </form>
      </div>
    </div>
  </>
  );
};

export default SignupEmployee;
