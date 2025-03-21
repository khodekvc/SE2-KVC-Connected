import React, { useState } from "react";
import Navbar from '../components/Navbar';
import { Button } from '../components/Button';
import FormGroup from '../components/FormGroup';
import "../css/Forms.css";

const AccessCode = () => {
  const [formData, setFormData] = useState({
    accesscode: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Access code entered:", formData.accesscode);
  };

  return (
    <>
    <Navbar />
    <div className="accesscode-container">
      <div className="left-section">
        <h1>KHO<br /> VETERINARY<br /> CLINIC</h1>
        <div className="alternate-links">
                <Button buttonStyle='btn--primary' to='/signup-petowner' className="form-btn-2">Sign up as Pet Owner</Button>
                <p>Not an Employee?</p>
        </div>
      </div>
      <div className="right-section">
        <h2 className="code-h2">Access Code <br /> Verification</h2>
        <form onSubmit={handleSubmit} className="code-formgroup">
          <FormGroup 
            label="Please enter the access code sent to your email by the doctor to confirm your role."
            type="number" 
            name="accesscode" 
            value={formData.accesscode} 
            onChange={handleChange} 
            required 
          />
          <Button buttonStyle='btn--primary' to='/patients' className="form-btn-1">SUBMIT</Button>
        </form>
      </div>
    </div>
    </>
  );
};

export default AccessCode;
