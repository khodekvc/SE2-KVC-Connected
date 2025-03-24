const db = require("../config/db");

const getAllVisitRecords = async () => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.record_id AS id,
        r.record_date AS date,
        r.record_purpose AS purposeOfVisit,
        r.record_weight AS weight,
        r.record_temp AS temperature,
        r.record_condition AS conditions,
        r.record_symptom AS symptoms,
        r.record_recent_visit AS recentVisit,
        r.record_purchase AS recentPurchase,
        r.record_lab_file AS file,
        l.lab_description AS laboratories,
        s.surgery_type AS pastSurgeries,
        d.diagnosis_text AS latestDiagnoses,
        r.pet_id AS petId
      FROM record_info r
      LEFT JOIN lab_info l ON r.lab_id = l.lab_id
      LEFT JOIN surgery_info s ON r.surgery_id = s.surgery_id
      LEFT JOIN diagnosis d ON r.diagnosis_id = d.diagnosis_id
    `);
    return rows;
  } catch (error) {
    console.error("Error fetching visit records:", error);
    throw error;
  }
};

const insertLabInfo = async (lab_description) => {
    const [labResult] = await db.query("INSERT INTO lab_info (lab_description) VALUES (?)", [lab_description]);
    return labResult.insertId;
};

const getLabIdByDescription = async (lab_description) => {
    const [result] = await db.query("SELECT lab_id FROM lab_info WHERE lab_description = ?", [lab_description]);
    return result.length ? result[0].lab_id : null;
};

const insertDiagnosis = async (diagnosisText) => {
    const [result] = await db.query(
        "INSERT INTO diagnosis (diagnosis_text) VALUES (?)",
        [diagnosisText]
    );
    console.log("New diagnosis ID:", result.insertId); // Debugging
    return result.insertId; // Return the new diagnosis ID
};


const insertSurgeryInfo = async (surgery_type, surgery_date) => {
    const [surgeryResult] = await db.query("INSERT INTO surgery_info (surgery_type, surgery_date) VALUES (?, ?)", [surgery_type, surgery_date]);
    return surgeryResult.insertId;
};

const insertRecord = async (petId, recordData) => {
    const { record_date, record_weight, record_temp, record_condition, record_symptom, record_recent_visit, record_purchase, record_purpose, lab_id, diagnosis_id, surgery_id, record_lab_file } = recordData;
    const [result] = await db.query(
        `INSERT INTO record_info (pet_id, record_date, record_weight, record_temp, record_condition, 
            record_symptom, record_recent_visit, record_purchase, record_purpose, lab_id, diagnosis_id, surgery_id, record_lab_file)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [petId, record_date, record_weight, record_temp, record_condition, record_symptom, record_recent_visit, record_purchase, record_purpose, lab_id, diagnosis_id, surgery_id, record_lab_file]
    );
    return result.insertId;
};

const updateRecordInDB = async (recordId, recordData) => {
    // Fetch current record to preserve diagnosis_id
    const [currentRecord] = await db.query(
        `SELECT diagnosis_id FROM record_info WHERE record_id = ?`, 
        [recordId]
    );

    // If diagnosis_id is missing from update, keep the existing one
    if (!("diagnosis_id" in recordData)) {
        recordData.diagnosis_id = currentRecord[0].diagnosis_id;
    }

    const fields = Object.keys(recordData);
    const values = Object.values(recordData);

    if (fields.length === 0) {
        throw new Error("No fields provided for update.");
    }

    const setClause = fields.map(field => `${field} = ?`).join(", ");

    console.log("DEBUG: Running SQL Query:");
    console.log(`UPDATE record_info SET ${setClause} WHERE record_id = ?`);
    console.log("DEBUG: Values:", [...values, recordId]);

    const [result] = await db.query(
        `UPDATE record_info SET ${setClause} WHERE record_id = ?`,
        [...values, recordId]
    );

    console.log("DEBUG: Update affected rows:", result.affectedRows);
    return result.affectedRows;
};






const getRecordById = async (recordId) => {
    const [result] = await db.query("SELECT * FROM record_info WHERE record_id = ?", [recordId]);
    return result.length ? result[0] : null;
};

const insertMatchRecLab = async (recordId, labId) => {
    await db.query("INSERT INTO match_rec_lab (record_id, lab_id) VALUES (?, ?)", [recordId, labId]);
};

const updateMatchRecLab = async (recordId, labId) => {
    await db.query("DELETE FROM match_rec_lab WHERE record_id = ?", [recordId]);
    await db.query("INSERT INTO match_rec_lab (record_id, lab_id) VALUES (?, ?)", [recordId, labId]);
};

const updateDiagnosisText = async (diagnosisId, newDiagnosisText) => {
    try {
        console.log(`Updating diagnosis ${diagnosisId} with text: "${newDiagnosisText}"`);
        const [result] = await db.query(
            "UPDATE diagnosis SET diagnosis_text = ? WHERE diagnosis_id = ?",
            [newDiagnosisText, diagnosisId]
        );
        console.log("SQL Update Result:", result);
        return result;
    } catch (error) {
        console.error("❌ Error updating diagnosis:", error);
        throw error;
    }
};


module.exports = { getAllVisitRecords, insertLabInfo, getLabIdByDescription, insertDiagnosis, insertSurgeryInfo, insertRecord, updateRecordInDB, getRecordById, insertMatchRecLab, updateMatchRecLab, updateDiagnosisText };
