"use client"

import { useState } from "react"
import { ArrowLeft, Pencil, Save } from "lucide-react"
import "../css/ViewRecord.css"
import { useDiagnosisLock } from "../contexts/DiagnosisLockContext"
import UnlockModal from "../components/UnlockDiagnosisPopup"
import { useConfirmDialog } from "../contexts/ConfirmDialogContext"
import MedicalRecordForm from "../components/MedicalRecordForm"
import { useUserRole } from "../contexts/UserRoleContext"

const ViewRecord = ({ record, onBack, onUpdate }) => {
  const { hasPermission } = useUserRole()
  const { showConfirmDialog } = useConfirmDialog()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { isDiagnosisLocked, unlockDiagnosis } = useDiagnosisLock()
  const [isEditing, setIsEditing] = useState(false)
  const [editedRecord, setEditedRecord] = useState(record)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    if (!editedRecord.purposeOfVisit) newErrors.purposeOfVisit = "Purpose of visit is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    if (type === "file") {
      setEditedRecord((prev) => ({
        ...prev,
        [name]: e.target.files[0],
      }))
    } else {
      setEditedRecord((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSave = () => {
    if (validateForm()) {
      showConfirmDialog("Do you want to save your changes?", () => {
        onUpdate(editedRecord)
        setIsEditing(false)
      })
    }
  }

  const handleUnlockDiagnosis = () => {
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="view-record-container">
        <div className="record-header">
          <div className="header-left">
            <button className="back-button" onClick={onBack}>
              <ArrowLeft size={24} />
            </button>
            <span>Pet's Record for: {editedRecord.date}</span>
          </div>
          {hasPermission("canUpdateRecord") && (
            <>
          {isEditing ? (
            <button className="save-button" onClick={handleSave}>
              <Save size={16} />
              Save
            </button>
          ) : (
            <button className="update-button" onClick={() => setIsEditing(true)}>
              <Pencil size={16} />
              Update
            </button>
             )}
            </>
          )}
        </div>

        <div className="record-content">
          <div className="scrollable-content">
            <MedicalRecordForm
              formData={editedRecord}
              isEditing={isEditing}
              isDiagnosisLocked={!hasPermission("canAlwaysEditDiagnosis") && isDiagnosisLocked}
              onInputChange={handleInputChange}
              onUnlockDiagnosis={handleUnlockDiagnosis}
              isAddRecord={false}
              errors={errors}
            />
          </div>
        </div>
      </div>

      <UnlockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUnlock={unlockDiagnosis} />
    </>
  )
}

export default ViewRecord
