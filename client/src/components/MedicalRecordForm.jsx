import React from 'react';
import "../css/MedicalRecordForm.css";

const MedicalRecordForm = ({
    formData,
    isEditing,
    isDiagnosisLocked,
    onInputChange,
    onUnlockDiagnosis,
    isAddRecord,
    errors,
  }) => {
  
  const renderField = (label, name, type = "text", options = {}) => {
    const value = formData[name]
    const { isFullWidth, isRequired, selectOptions } = options

    let input
    if (type === "select") {
      input = (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onInputChange}
          disabled={!isEditing}
          className={isEditing ? "editable-value" : ""}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {selectOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )
    } else if (type === "radio") {
      input = (
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              id={`${name}-true`}
              name={name}
              value="true"
              checked={value === true}
              onChange={() => onInputChange({ target: { name, value: true } })}
              disabled={!isEditing}
            />
            Yes
          </label>
          <label className="radio-label">
            <input
              type="radio"
              id={`${name}-false`}
              name={name}
              value="false"
              checked={value === false}
              onChange={() => onInputChange({ target: { name, value: false } })}
              disabled={!isEditing}
            />
            No
          </label>
        </div>
      )
    } else if (type === "file") {
      input = isEditing ? (
        <input type="file" id={name} name={name} onChange={onInputChange} className="file-input" />
      ) : (
        value && (
          <button className="view-file-btn">
            View File
            <span className="file-name">{value.name}</span>
          </button>
        )
      )
    } else if (type === "date") {
      input = (
        <div className="date-input">
          <input
            type="date"
            id={name}
            name={name}
            value={value}
            onChange={onInputChange}
            disabled={!isEditing}
            className={isEditing ? "editable-value" : ""}
          />
        </div>
      )
    } else if (type === "textarea") {
      input = (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onInputChange}
          rows={3}
          disabled={!isEditing || (name === "latestDiagnoses" && isDiagnosisLocked)}
          className={isEditing ? "editable-value" : ""}
        />
      )
    } else {
      input = (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onInputChange}
          disabled={!isEditing}
          className={isEditing ? "editable-value" : ""}
        />
      )
    }

    return (
        <div className={`form-field ${isFullWidth ? "full-width" : ""}`}>
          <label htmlFor={name}>
            {label}
            {isRequired && <span className="required">*</span>}
          </label>
          {isEditing || type === "radio" ? input : <span className="value-text">{value}</span>}
          {errors && errors[name] && <span className="error-message">{errors[name]}</span>} {/* Show error */}
          {name === "latestDiagnoses" && isDiagnosisLocked && isEditing && !isAddRecord && (
            <button type="button" className="unlock-diagnosis-btn" onClick={onUnlockDiagnosis}>
              Unlock Diagnosis
            </button>
          )}
        </div>
      )
      
  }

  return (
    <div className="medical-record-form">
      <section className="medical-info">
        <h2>Medical Information</h2>
        <div className="form-row">
          {renderField("Weight", "weight")}
          {renderField("Temperature", "temperature")}
        </div>
        <div className="form-row">
          {renderField("Conditions", "conditions")}
          {renderField("Symptoms", "symptoms")}
        </div>
        <div className="form-row">
          {renderField("Laboratories", "laboratories", "select", {
            selectOptions: ["CBC", "Ultrasound", "ECG", "X-ray", "Blood Chem", "Microscopy","Progesterone Test"],
          })}
          {renderField("File", "file", "file")}
        </div>
        <div className="form-row">
          {renderField("Had past surgeries", "hadSurgery", "radio")}
          {formData.hadSurgery && renderField("Date of Surgery", "surgeryDate", "date")}
        </div>
        {formData.hadSurgery && (
          <div className="form-row">{renderField("Type of Surgery", "surgeryType", "text", { isFullWidth: true })}</div>
        )}
        <div className="form-row">
          {renderField("Latest Diagnosis", "latestDiagnoses", "textarea", { isFullWidth: true })}
        </div>
      </section>
      <section className="visit-details">
        <h2>Visit Details</h2>
        <div className="form-row">
          {renderField("Recent Visit", "recentVisit", "date")}
          {renderField("Recent Purchase", "recentPurchase")}
        </div>
        <div className="form-row">
          {renderField("Purpose of Visit", "purposeOfVisit", "text", { isFullWidth: true, isRequired: true })}
        </div>
      </section>
    </div>
  )
}

export default MedicalRecordForm