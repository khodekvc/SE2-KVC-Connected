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
  const { hasPermission } = useUserRole();
  const { showConfirmDialog } = useConfirmDialog();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { unlockDiagnosis, lockDiagnosis, isDiagnosisLocked } = useDiagnosisLock();
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState(record);
  const [loading, setLoading] = useState(true);
  const [error, setErrors] = useState({});

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
        console.log("Fetched record:", data); // Debugging line
        if (!data.id) throw new Error("Fetched record has no ID");        

        setEditedRecord({ ...data, file: data.record_lab_file || "" });
        
      } catch (err) {
        setErrors(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [pet_id]);

  const validateForm = () => {
    const newErrors = {}
    if (!editedRecord.purposeOfVisit) newErrors.purposeOfVisit = "Purpose of visit is required"
    if (!editedRecord.date) newErrors.date = "Date is required";
    if (!editedRecord.weight) newErrors.weight = "Weight is required";
    if (!editedRecord.temperature) newErrors.temperature = "Temperature is required";
    if (!editedRecord.conditions) newErrors.conditions = "Conditions are required";
    if (!editedRecord.symptoms) newErrors.symptoms = "Symptoms are required";
    if (!editedRecord.recentVisit) newErrors.recentVisit = "Recent visit date is required";
    if (!editedRecord.recentPurchase) newErrors.recentPurchase = "Recent purchase date is required";

    setErrors(newErrors) // Use setErrors to update the error state
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, type } = e.target;

    if (type === "file") {
        const file = e.target.files[0];
        setEditedRecord((prev) => ({
            ...prev,
            [name]: file || prev[name], // ✅ Keep existing file if no new file is selected
            filePreview: file ? URL.createObjectURL(file) : prev.filePreview, // ✅ Maintain preview
        }));
    } else {
        setEditedRecord((prev) => ({
            ...prev,
            [name]: e.target.value,
        }));
    }
};


  const handleSave = () => {
    if (validateForm()) {
      showConfirmDialog("Do you want to save your changes?", () => {
        handleSubmit(); // Call handleSubmit to send the data to the backend
      });
    }
  };

  // Function to request access code and open the modal
  const handleRequestAccessCode = async () => {
    try {
      const response = await fetch("http://localhost:5000/recs/records/request-access-code", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to request access code");
      }

      const data = await response.json();

      // Store the access code in the state
      setEditedRecord((prev) => ({
        ...prev,
        accessCode: data.accessCode, // Save the access code in the record state
      }));

      setIsModalOpen(true); // Open the modal after requesting the code
    } catch (error) {
      console.error("Error requesting access code:", error);
    }
  };

  const handleUnlockDiagnosis = (accessCode) => {
    unlockDiagnosis(); // Unlock the diagnosis field
    setEditedRecord((prev) => ({
      ...prev,
      accessCode, // Save the validated access code
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); 

    console.log("Record ID in handleSubmit:", record?.id);
    if (!record || !record.id) {
      console.error("❌ Record ID is missing. Cannot update record.");
      return;
    }

    console.log("Edited Record:", editedRecord);

    const formDataPayload = new FormData();

    const appendField = (key, value) => {
      if (value !== undefined && value !== null && value !== "") {
        formDataPayload.append(key, value);
      } else {
        console.warn(`⚠️ Skipping empty field: ${key}`);
      }
    };
    
    appendField("record_date", editedRecord.date ? new Date(editedRecord.date).toISOString().slice(0, 19).replace("T", " ") : null);
    appendField("record_weight", editedRecord.weight);
    appendField("record_temp", editedRecord.temperature);
    appendField("record_condition", editedRecord.conditions);
    appendField("record_symptom", editedRecord.symptoms);
    appendField("record_recent_visit", editedRecord.recentVisit ? new Date(editedRecord.recentVisit).toISOString().slice(0, 19).replace("T", " ") : null);
    appendField("record_purchase", editedRecord.recentPurchase);
    appendField("record_purpose", editedRecord.purposeOfVisit);
    appendField("lab_description", editedRecord.laboratories);
    appendField("diagnosis_text", editedRecord.latestDiagnoses);
    appendField("surgery_type", editedRecord.pastSurgeries);
    appendField("surgery_date", editedRecord.surgeryDate ? new Date(editedRecord.surgeryDate).toISOString().slice(0, 19).replace("T", " ") : null);

    // ✅ Fix for File Handling
    if (editedRecord.file instanceof File) {
      formDataPayload.append("record_lab_file", editedRecord.file);
    } else if (typeof editedRecord.file === "string" && editedRecord.file.startsWith("http")) {
      formDataPayload.append("record_lab_file", editedRecord.file);
    } else {
      console.warn("⚠️ No valid file found.");
    }

    // 🚀 Log FormData Contents Before Sending
    console.log("✅ Final FormData Entries:");
    for (let pair of formDataPayload.entries()) {
      console.log(pair[0] + ": ", pair[1]);
    }

    // ✅ Ensure Diagnosis Text and Access Code Are Sent
    if (hasPermission("canAlwaysEditDiagnosis") || !isDiagnosisLocked) {  
      formDataPayload.append("diagnosis_text", editedRecord.latestDiagnoses);
      if (!hasPermission("canAlwaysEditDiagnosis")) {  
        formDataPayload.append("accessCode", editedRecord.accessCode);
      }
    }

    console.log("✅ Access Code Sent:", editedRecord.accessCode);

    try {
      console.log(`✅ Sending request to: http://localhost:5000/recs/records/${record.id}`);
      const response = await fetch(`http://localhost:5000/recs/records/${record.id}`, {
        method: "PUT",
        credentials: "include",
        body: formDataPayload,
      });

      if (!response.ok) {
        throw new Error("❌ Failed to update the record");
      }

      const updatedRecord = await response.json();
      console.log("✅ Record updated successfully:", updatedRecord);

      onUpdate({ ...editedRecord, ...updatedRecord, id: record.id });
      lockDiagnosis(); 
      setIsEditing(false);
      
    } catch (error) {
      console.error("❌ Error updating record:", error);
    }
};


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
              onUnlockDiagnosis={handleRequestAccessCode} // Request access code
              isAddRecord={false}
              error={error}
            />
          </div>
        </div>
      </div>

      <UnlockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUnlock={(accessCode) => handleUnlockDiagnosis(accessCode)} // Pass the access code
        recordId={editedRecord.id}
        generatedAccessCode={editedRecord.accessCode}
      />
    </>
  )
}

export default ViewRecord
