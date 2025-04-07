"use client"


import { useState } from "react"
import { useParams } from "react-router-dom" // Import useParams
import { ArrowLeft } from "lucide-react"
import "../css/AddRecord.css"
import { useDiagnosisLock } from "../contexts/DiagnosisLockContext"
import { useConfirmDialog } from "../contexts/ConfirmDialogContext"
import MedicalRecordForm from "../components/MedicalRecordForm"
import { useUserRole } from "../contexts/UserRoleContext"


const formatDateForDisplay = (dateString) => {
  if (!dateString) return ""


  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString // Return original if invalid


    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const year = date.getFullYear()


    return `${month}/${day}/${year}`
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

const validateDate = (dateString) => {
  if (!dateString) return "";
  
  const selectedDate = new Date(dateString);
  const currentDate = new Date();
  
  // Reset the time portion to compare just the dates
  selectedDate.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);
  
  if (selectedDate > currentDate) {
    return "Future dates not allowed";
  }
  return "";
}

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
   latestDiagnosis: "",
   recentVisit: "",
   recentPurchase: "",
   purposeOfVisit: "",
 })


 const [errors, setErrors] = useState({})


 const validateForm = () => {
   const newErrors = {}
   
   // Required fields validation - expand this to match ViewRecord validation
   if (!formData.date) newErrors.date = "Date is required"
   else {
     const dateError = validateDate(formData.date);
     if (dateError) {
       newErrors.date = dateError;
     }
   }
   if (!formData.weight) newErrors.weight = "Weight is required"
   if (!formData.temperature) newErrors.temperature = "Temperature is required"
   if (!formData.conditions) newErrors.conditions = "Conditions is required"
   if (!formData.symptoms) newErrors.symptoms = "Symptoms is required"
   
   // Validate recent visit date
   if (!formData.recentVisit) {
     newErrors.recentVisit = "Recent visit date is required"
   } else {
     const dateError = validateDate(formData.recentVisit);
     if (dateError) {
       newErrors.recentVisit = dateError;
     }
   }
   
   if (!formData.recentPurchase) newErrors.recentPurchase = "Recent purchase is required"
   if (!formData.purposeOfVisit) newErrors.purposeOfVisit = "Purpose of visit is required"

   // Validate surgery fields if hadSurgery is true
   if (formData.hadSurgery) {
    if (!formData.surgeryDate) newErrors.surgeryDate = "Surgery date is required"
    if (!formData.surgeryType) newErrors.surgeryType = "Surgery type is required"
   }

   setErrors(newErrors)
   return Object.keys(newErrors).length === 0
 }


 const handleSubmit = async (e) => {
   e.preventDefault();
   if (!validateForm()) {
     // Stop submission but show errors
     console.log("Form validation failed", errors);
     return;
   }
   
   showConfirmDialog("Are you sure you want to add this record?", async () => {
       try {
        const formattedDate = formData.date ? new Date(formData.date).toISOString().split("T")[0] : ""
          const formattedRecentVisit = formData.recentVisit
            ? new Date(formData.recentVisit).toISOString().split("T")[0]
            : ""
          const formattedSurgeryDate = formData.surgeryDate
            ? new Date(formData.surgeryDate).toISOString().split("T")[0]
            : ""

            const formDataPayload = new FormData();
            formDataPayload.append("record_date", formattedDate);
            formDataPayload.append("record_weight", formData.weight);
            formDataPayload.append("record_temp", formData.temperature);
            formDataPayload.append("record_condition", formData.conditions);
            formDataPayload.append("record_symptom", formData.symptoms);
            formDataPayload.append("record_recent_visit", formattedRecentVisit);
            formDataPayload.append("record_purchase", formData.recentPurchase);
            formDataPayload.append("record_purpose", formData.purposeOfVisit);
            formDataPayload.append("lab_description", formData.laboratories);
            formDataPayload.append("diagnosis_text", formData.latestDiagnosis);
            if (formData.hadSurgery) {
              formDataPayload.append("surgery_type", formData.surgeryType);
              formDataPayload.append("surgery_date", formattedSurgeryDate);
            }
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
           body: formDataPayload,
         });


         if (!response.ok) {
          throw new Error("Failed to add record");
        }


         const newRecord = await response.json();
         console.log("Newly added record:", newRecord);

         // Format dates for display
         const formattedRecord = {
          ...newRecord,
          date: formatDateForDisplay(newRecord.date),
          recentVisit: formatDateForDisplay(newRecord.recentVisit),
          surgeryDate: formatDateForDisplay(newRecord.surgeryDate),
        }


         onSubmit(formattedRecord); // Pass the new record to the parent component
       } catch (error) {
         console.error("Error adding record:", error);
         alert("Error adding record: " + error.message)
        }
      })
 }



 const handleInputChange = (e) => {
   const { name, value, type } = e.target
   if (name === "hadSurgery") {
    // Convert string "true"/"false" to boolean
    const boolValue = value === "true" || value === true


    setFormData((prev) => ({
      ...prev,
      hadSurgery: boolValue,
      // Clear surgery fields if hadSurgery is set to false
      ...(boolValue === false ? { surgeryDate: "", surgeryType: "" } : {}),
    }))
    
    // Clear related errors when changing this field
    if (errors.hadSurgery || errors.surgeryDate || errors.surgeryType) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.hadSurgery;
        if (boolValue === false) {
          delete newErrors.surgeryDate;
          delete newErrors.surgeryType;
        }
        return newErrors;
      });
    }
  }
   else if (type === "file") {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file, // ✅ Store the file object
      }));
    }
   } else {
     setFormData((prev) => ({
       ...prev,
       [name]: value,
     }))
     
     // Validate dates for future dates immediately
     if ((name === "recentVisit" || name === "date") && value) {
       const dateError = validateDate(value);
       if (dateError) {
         setErrors(prev => ({
           ...prev,
           [name]: dateError
         }));
       }
     }
   }
   
   if (errors[name]) {
     setErrors((prev) => {
       const newErrors = {...prev};
       delete newErrors[name];
       return newErrors;
     })
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
         {errors.date && <span className="error-message-record">{errors.date}</span>}
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