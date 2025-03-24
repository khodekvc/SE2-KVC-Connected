"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Pencil, Save } from "lucide-react"
import "../css/ViewRecord.css"
import { useDiagnosisLock } from "../contexts/DiagnosisLockContext"
import UnlockModal from "../components/UnlockDiagnosisPopup"
import { useConfirmDialog } from "../contexts/ConfirmDialogContext"
import MedicalRecordForm from "../components/MedicalRecordForm"
import { useUserRole } from "../contexts/UserRoleContext"
import { useParams } from "react-router-dom"

const ViewRecord = ({ record, onBack, onUpdate }) => {
  const { pet_id } = useParams();
  const { hasPermission } = useUserRole()
  const { showConfirmDialog } = useConfirmDialog()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { isDiagnosisLocked, unlockDiagnosis } = useDiagnosisLock()
  const [isEditing, setIsEditing] = useState(false)
  const [editedRecord, setEditedRecord] = useState(record)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState({})

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/recs/records/${pet_id}`, {
          method: "GET",
          credentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch record");
        }

        const data = await response.json();
        setRecord(data); // Set the fetched record data
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [pet_id]);

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

    if (error[name]) {
      setError((prev) => ({
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
              error={error}
            />
          </div>
        </div>
      </div>

      <UnlockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUnlock={unlockDiagnosis} />
    </>
  )
}

export default ViewRecord
