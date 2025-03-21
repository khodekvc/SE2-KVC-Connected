"use client"

import { useState } from "react"
import "../css/UnlockDiagnosis.css"

const UnlockModal = ({ isOpen, onClose, onUnlock }) => {
  const [reason, setReason] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    onUnlock(reason)
    setReason("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Modify Diagnosis</h2>
        <p>Enter mo na yung code na binigay ni doc:</p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
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
  )
}

export default UnlockModal
