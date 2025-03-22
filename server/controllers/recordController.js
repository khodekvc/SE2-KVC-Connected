const { 
    getAllVisitRecords, insertDiagnosis, insertSurgeryInfo, insertRecord, insertMatchRecLab, 
    getLabIdByDescription, updateRecordInDB, updateMatchRecLab, getRecordById, updateDiagnosisText 
} = require("../models/recordModel");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { sendEmail } = require("../utils/emailUtility");
const crypto = require("crypto");

const getVisitRecords = async (req, res) => {
    try {
        const records = await getAllVisitRecords();
        res.json(records);
    } catch (error) {
        console.error("Error fetching visit records:", error);
        res.status(500).json({ error: "Failed to fetch visit records" });
    }
};

// Ensure clinicians request an access code before adding a diagnosis
const addRecord = async (req, res) => {
    try {
        const { role } = req.user; // Assuming user role is available in req.user
        const { petId } = req.params;
        const { 
            record_date, record_weight, record_temp, record_condition, record_symptom, 
            lab_description, diagnosis_text, surgery_type, surgery_date, 
            record_recent_visit, record_purchase, record_purpose 
        } = req.body;

        // Validate required fields
        if (!record_date || !record_weight || !record_temp || !record_condition || !record_symptom || !record_recent_visit || !record_purchase || !record_purpose) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        // ❌ Prevent clinicians from adding diagnosis
        if (role === "clinician" && diagnosis_text) {
            return res.status(403).json({ error: "Clinicians cannot add a diagnosis when creating a record." });
        }

        let lab_id = null;
        if (lab_description) {
            lab_id = await getLabIdByDescription(lab_description);
            if (!lab_id) {
                return res.status(400).json({ error: "Invalid lab description." });
            }
        }

        let diagnosis_id = null;
        if (role === "doctor" && diagnosis_text) {
            diagnosis_id = await insertDiagnosis(diagnosis_text);
        }

        let surgery_id = null;
        if (surgery_type && surgery_date) {
            surgery_id = await insertSurgeryInfo(surgery_type, surgery_date);
        }

        const recordId = await insertRecord(petId, {
            record_date, record_weight, record_temp, record_condition, 
            record_symptom, record_recent_visit, record_purchase, 
            record_purpose, lab_id, diagnosis_id, surgery_id, record_lab_file: null
        });

        if (lab_id) {
            await insertMatchRecLab(recordId, lab_id);
        }

        res.status(201).json({ message: "Medical record added successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error while adding medical record." });
    }
};


// Enforce access code validation for updating diagnosis
const updateRecord = async (req, res) => {
    try {
        const { role } = req.user;
        const { recordId } = req.params;
        const { 
            record_date, record_weight, record_temp, record_condition, record_symptom, 
            lab_description, diagnosis_text, surgery_type, surgery_date, 
            record_recent_visit, record_purchase, record_purpose, accessCode 
        } = req.body;

        const currentRecord = await getRecordById(recordId);
        if (!currentRecord) {
            return res.status(404).json({ error: "Record not found." });
        }

        // 🔒 Enforce access code for clinicians trying to update a diagnosis
        if (role === "clinician" && diagnosis_text) {
            if (!req.session.diagnosisAccessCode || accessCode !== req.session.diagnosisAccessCode) {
                return res.status(403).json({ error: "Clinicians need a valid access code to update a diagnosis." });
            }
        }

        // Doctors can update without an access code

        const updatedRecordData = {
            record_date: record_date || currentRecord.record_date,
            record_weight: record_weight || currentRecord.record_weight,
            record_temp: record_temp || currentRecord.record_temp,
            record_condition: record_condition || currentRecord.record_condition,
            record_symptom: record_symptom || currentRecord.record_symptom,
            record_recent_visit: record_recent_visit || currentRecord.record_recent_visit,
            record_purchase: record_purchase || currentRecord.record_purchase,
            record_purpose: record_purpose || currentRecord.record_purpose,
            lab_id: currentRecord.lab_id,
            diagnosis_id: currentRecord.diagnosis_id,
            surgery_id: currentRecord.surgery_id,
            record_lab_file: currentRecord.record_lab_file
        };

        if (lab_description) {
            const lab_id = await getLabIdByDescription(lab_description);
            if (!lab_id) {
                return res.status(400).json({ error: "Invalid lab description." });
            }
            updatedRecordData.lab_id = lab_id;
        }

        if (diagnosis_text) {
            if (role === "doctor") {
                if (!currentRecord.diagnosis_id) {
                    // Insert new diagnosis
                    const newDiagnosisId = await insertDiagnosis(diagnosis_text);
                    updatedRecordData.diagnosis_id = newDiagnosisId; // ✅ Use updatedRecordData
                    console.log(`New diagnosis added with ID: ${newDiagnosisId} and linked to record ID: ${recordId}`);
                } else {
                    await updateDiagnosisText(currentRecord.diagnosis_id, diagnosis_text);
                }
            } else {
                // Clinicians need an access code
                if (req.session.diagnosisAccessCode && accessCode === req.session.diagnosisAccessCode) {
                    if (!currentRecord.diagnosis_id) {
                        const newDiagnosisId = await insertDiagnosis(diagnosis_text);
                        console.log("Updating record_info...");
                        updatedRecordData.diagnosis_id = newDiagnosisId; // ✅ Use updatedRecordData
                        console.log(`New diagnosis added with ID: ${newDiagnosisId} and linked to record ID: ${recordId}`);
                    } else {
                        await updateDiagnosisText(currentRecord.diagnosis_id, diagnosis_text);
                    }
                } else {
                    return res.status(403).json({ error: "Invalid or missing access code for diagnosis update." });
                }
            }
        }
        
        // ✅ Ensure diagnosis_id is preserved if not updated
        if (!("diagnosis_id" in updatedRecordData)) {
            updatedRecordData.diagnosis_id = currentRecord.diagnosis_id;
        }
        
        // ✅ Now update the record correctly
        await updateRecordInDB(recordId, updatedRecordData);
        console.log("Final Update Executed!");
        
        

        if (surgery_type && surgery_date) {
            const surgery_id = await insertSurgeryInfo(surgery_type, surgery_date);
            updatedRecordData.surgery_id = surgery_id;
        }

        await updateRecordInDB(recordId, updatedRecordData);

        if (updatedRecordData.lab_id !== currentRecord.lab_id) {
            await updateMatchRecLab(recordId, updatedRecordData.lab_id);
        }

        res.status(200).json({ message: "Medical record updated successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error while updating medical record." });
    }
};


// Allow clinicians to request an access code
const requestDiagnosisAccessCode = async (req, res) => {
    try {
        const accessCode = crypto.randomBytes(4).toString("hex").toUpperCase();

        if (!req.session) {
            return res.status(500).json({ error: "❌ Session is not initialized." });
        }

        req.session.diagnosisAccessCode = accessCode;

        const clinicOwnerEmail = process.env.CLINIC_OWNER_EMAIL;
        if (!clinicOwnerEmail) {
            return res.status(500).json({ error: "❌ Clinic owner email is not set." });
        }

        const subject = "Diagnosis Access Code Request - PAWtient Tracker";
        const body = `Hello Clinic Owner,\n\nA clinician has requested an access code to add or edit a diagnosis.\n\nAccess Code: ${accessCode}\n\nIf this request is unauthorized, please ignore this email.`;

        await sendEmail(clinicOwnerEmail, subject, body);

        res.json({ message: "✅ Access code request sent. Await access code from the clinic owner." });
    } catch (error) {
        console.error("Access Code Request Error:", error);
        res.status(500).json({ error: "❌ Server error while requesting access code." });
    }
};

module.exports = { getVisitRecords, addRecord, updateRecord, requestDiagnosisAccessCode };
