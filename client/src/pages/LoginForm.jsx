import React from 'react';
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { Button } from '../components/Button';
import FormGroup from '../components/FormGroup';
import "../css/Forms.css"


function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    captchaInput: "",
  });
  const [captcha, setCaptcha] = useState({ image: "", captchaKey: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCaptcha();
  }, []);
  const fetchCaptcha = async () => {
    try {
      const response = await fetch("http://localhost:5000/auth/captcha", {
        credentials: "include", // Ensure session persistence
      });
      const data = await response.json();
      console.log("CAPTCHA loaded:", data);  
      setCaptcha({ image: data.image, captchaKey: data.captchaKey });
    } catch (error) {
      console.error("Failed to load CAPTCHA:", error);
    }
  };
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Submitted");
    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
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
    <div className="login-container">
      <div className="left-section">
        <h1 className='login-h1'>KHO<br /> VETERINARY<br /> CLINIC</h1>
      </div>
      <div className="right-section">
        <h2>Welcome Back!</h2>
        <p>Login to your account</p>
        <form onSubmit={handleSubmit}>
          {message && <div className="message">{message}</div>}
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
              <img src={`${captcha.image}`} className="generated" alt="CAPTCHA" />
              <input 
                type="text" 
                id="captcha" 
                name="captchaInput" 
                value={formData.captchaInput} 
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
