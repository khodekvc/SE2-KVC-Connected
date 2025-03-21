import React, { useState } from 'react';
 import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const FormGroup = ({ label, type, name, value, onChange, required, selectOptions }) => {
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div className="forms-group">
      <label htmlFor={name}>{label} {required && '*'}</label>
      {type === 'select' ? (
        <select 
          id={name} 
          name={name} 
          value={value} 
          onChange={onChange} 
          required={required}
        >
        <option value="">Select {label.toLowerCase()}</option>
          {selectOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <div className={`input-wrapper ${type === 'password' ? 'password-wrapper' : ''}`}>
          <input 
            type={type === 'password' && showPassword ? 'text' : type} // Toggle input type for password
            id={name} 
            name={name} 
            value={value} 
            onChange={onChange} 
            required={required} 
          />
          {type === 'password' && (
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye} // Toggle between eye and eye-slash icons
              className="password-toggle-icon"
              onClick={togglePasswordVisibility}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default FormGroup;