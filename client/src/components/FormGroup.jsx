import React from 'react';

const FormGroup = ({ label, type, name, value, onChange, required, selectOptions }) => {
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
              {option} </option>
          ))}
        </select>
      ) : (
        <input 
          type={type} 
          id={name} 
          name={name} 
          value={value} 
          onChange={onChange} 
          required={required} 
        />
      )}
    </div>
  );
};

export default FormGroup;