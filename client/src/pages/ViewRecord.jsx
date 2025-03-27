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
 const [error, setErrors] = useState({}) // Define setErrors
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
       setEditedRecord(data); // Set the fetched record data
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


   setErrors(newErrors) // Use setErrors to update the error state
   return Object.keys(newErrors).length === 0
 }


 const handleInputChange = (e) => {
   const { name, value, type } = e.target;
   console.log("Input Change Triggered:", { name, value, type });
    setEditedRecord((prev) => ({
     ...prev,
     [name]: type === "file" ? e.target.files[0] : value,
   }));
    if (error[name]) {
     setErrors((prev) => ({
       ...prev,
       [name]: "",
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


 const handleUnlockDiagnosis = async () => {
   try {
     const response = await fetch("http://localhost:5000/recs/records/request-access-code", {
       method: "POST",
       credentials: "include",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({ role: "clinician" }),
     });


     if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.error || "Failed to request access code.");
     }


     alert("Access code sent to the clinic owner's email."); // Notify the user
     setIsModalOpen(true); // Open the popup
   } catch (error) {
     console.error("Error requesting access code:", error);
     alert(error.message); // Show error to the user
   }
 };


 const handleAccessCodeSubmit = (accessCode) => {
   setEditedRecord((prev) => ({
     ...prev,
     accessCode, // Store the access code in the state
   }));
 };


 const handleSubmit = async (e) => {
   if (e) e.preventDefault();


   console.log("Record ID in handleSubmit:", record?.id);
   if (!record || !record.id) {
     console.error("Record ID is missing. Cannot update record.");
     return;
   }


   const updatedData = {
     record_date: editedRecord.date ? new Date(editedRecord.date).toISOString().split("T")[0] : null,
     record_weight: editedRecord.weight,
     record_temp: editedRecord.temperature,
     record_condition: editedRecord.conditions,
     record_symptom: editedRecord.symptoms,
     record_recent_visit: editedRecord.recentVisit ? new Date(editedRecord.recentVisit).toISOString().split("T")[0] : null,
     record_purchase: editedRecord.recentPurchase,
     record_purpose: editedRecord.purposeOfVisit,
     diagnosis_text: editedRecord.latestDiagnosis, // Optional
     lab_description: editedRecord.labDescription, // Optional
     surgery_type: editedRecord.surgeryType, // Optional
     surgery_date: editedRecord.surgeryDate ? new Date(editedRecord.surgeryDate).toISOString().split("T")[0] : null,
     accessCode: editedRecord.accessCode, // Include access code for clinicians
   };
   console.log("Updated Data:", updatedData);
   try {
     console.log("Record ID in handleSubmit:", record.id);
     const response = await fetch(`http://localhost:5000/recs/records/${record.id}`, {
       method: "PUT",
       credentials: "include",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify(updatedData),
     });


     if (!response.ok) {
       throw new Error("Failed to update the record");
     }


     const updatedRecord = await response.json();
     console.log("Record updated successfully:", updatedRecord);


     onUpdate({ ...editedRecord, ...updatedRecord, id: record.id }); // Update the parent state
     setIsEditing(false); // Exit editing mode
   } catch (error) {
     console.error("Error updating record:", error);
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
             onUnlockDiagnosis={handleUnlockDiagnosis}
             isAddRecord={false}
             error={error}
           />
         </div>
       </div>
     </div>


     <UnlockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUnlock={handleAccessCodeSubmit} />
   </>
 )
}


export default ViewRecord