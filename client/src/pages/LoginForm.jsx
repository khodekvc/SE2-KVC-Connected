import React from 'react';
import Navbar from "../components/Navbar";
import { useState } from "react";
import { Button } from '../components/Button';
import FormGroup from '../components/FormGroup';
import "../css/Forms.css"


function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    captcha: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
    <Navbar />
    <div className="login-container">
      <div className="left-section">
        <h1 className='login-h1'>KHO<br /> VETERINARY<br /> CLINIC</h1>
      </div>
      <div className="right-section">
        <h2>Welcome Back!</h2>
        <p>Login to your account</p>
        <form>
          <FormGroup 
            label="Email" 
            type="email" 
            name="email" 
            value={formData.email} 
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
          <div className="forgot">
            <a href="#">Forgot Password?</a>
          </div>
          <div className="forms-group captcha">
            <label htmlFor="captcha">Enter Captcha</label>
            <div className="captcha-container">
              <img className="generated" alt="CAPTCHA" />
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
          <Button buttonStyle='btn--primary' to='/patients' className="form-btn-1">LOGIN</Button>
        </form>
      </div>
    </div>
    </>
  );
};

export default LoginForm;
