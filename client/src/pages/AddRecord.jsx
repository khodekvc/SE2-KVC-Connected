"use client"

import { useState } from "react"
import { useParams } from "react-router-dom" // Import useParams
import { ArrowLeft } from "lucide-react"
import "../css/AddRecord.css"
import { useDiagnosisLock } from "../contexts/DiagnosisLockContext"
import { useConfirmDialog } from "../contexts/ConfirmDialogContext"
import MedicalRecordForm from "../components/MedicalRecordForm"
import { useUserRole } from "../contexts/UserRoleContext"

const AddRecord = ({ onClose, onSubmit }) => {
  const { pet_id } = useParams()
  console.log("Pet ID:", pet_id) // Extract pet_id from the URL
  const { hasPermission } = useUserRole()
  const { isDiagnosisLocked } = useDiagnosisLock()
  const { showConfirmDialog } = useConfirmDialog()
  const [formData, setFormData] = useState({
    date: "",
    weight: "",
    temperature: "",
    conditions: "",
    symptoms: "",
    laboratories: "",
    file: null,
    hadSurgery: false,
    surgeryDate: "",
    surgeryType: "",
    latestDiagnoses: "",
    recentVisit: "",
    recentPurchase: "",
    purposeOfVisit: "",
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    if (!formData.date) newErrors.date = "Date is required"
    if (!formData.purposeOfVisit) newErrors.purposeOfVisit = "Purpose of visit is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      showConfirmDialog("Are you sure you want to add this record?", async () => {
        try {
          const formDataPayload = new FormData();
          formDataPayload.append("record_date", formData.date);
          formDataPayload.append("record_weight", formData.weight);
          formDataPayload.append("record_temp", formData.temperature);
          formDataPayload.append("record_condition", formData.conditions);
          formDataPayload.append("record_symptom", formData.symptoms);
          formDataPayload.append("record_recent_visit", formData.recentVisit);
          formDataPayload.append("record_purchase", formData.recentPurchase);
          formDataPayload.append("record_purpose", formData.purposeOfVisit);
          formDataPayload.append("lab_description", formData.laboratories);
          formDataPayload.append("diagnosis_text", formData.latestDiagnoses);
          formDataPayload.append("surgery_type", formData.surgeryType);
          formDataPayload.append("surgery_date", formData.surgeryDate);
          if (formData.file instanceof File) {
            formDataPayload.append("record_lab_file", formData.file);
          }          
          for (let pair of formDataPayload.entries()) {
            console.log(pair[0] + ": " + pair[1]);
          }
          console.log("File Details:", formDataPayload.get("record_lab_file"));

          
          const response = await fetch(`http://localhost:5000/recs/records/${pet_id}`, {
            method: "POST",
            credentials: "include",
            body: formDataPayload, // ✅ Send FormData instead of JSON
          });
  
          if (!response.ok) {
            throw new Error("Failed to add record");
          }
  
          const newRecord = await response.json();
          console.log("Newly added record:", newRecord);
  
          onSubmit(newRecord);
        } catch (error) {
          console.error("Error adding record:", error);
        }
      });
    }
  };
  

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    if (type === "file") {
      const file = e.target.files[0];
      if (file) {
        setFormData((prev) => ({
          ...prev,
          file, // ✅ Store the file object
        }));
      }
    }
    else {
      setFormData((prev) => ({
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


  return (
    <div className="add-record-container">
      <div className="form-header">
        <div className="header-left">
          <button className="back-button" onClick={onClose}>
            <ArrowLeft size={24} />
          </button>
          <span>Add New Record for Date:</span>
        </div>
        <div className="header-center">
          <div className="date-input">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={errors.date ? "error" : ""}
            />
          </div>
          {errors.date && <span className="error-message">{errors.date}</span>}
        </div>
        <button className="submit-button" onClick={handleSubmit}>
          Add Record
        </button>
      </div>

      <div className="form-content">
        <MedicalRecordForm
          formData={formData}
          isEditing={true}
          isDiagnosisLocked={!hasPermission("canAlwaysEditDiagnosis") && isDiagnosisLocked}
          onInputChange={handleInputChange}
          isAddRecord={true}
          errors={errors}
        />
      </div>
    </div>
  )
}

export default AddRecord
