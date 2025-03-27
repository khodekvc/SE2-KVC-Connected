"use client"

import { useState } from "react"
import "../css/UnlockDiagnosis.css"

const UnlockModal = ({ isOpen, onClose, onUnlock }) => {
  const [accessCode, setAccessCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onUnlock(accessCode); // Pass the access code to the parent
    setAccessCode("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Modify Diagnosis</h2>
        <p>Enter the access code provided by the doctor:</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            required
            placeholder="Enter Access Code"
          />
          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="unlock-button">
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnlockModal;
