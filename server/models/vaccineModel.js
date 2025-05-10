const db = require("../config/db");

class VaccineModel {
    static async getVaccinationRecordsByPetId(pet_id) {
    const [results] = await db.execute(
        `
        SELECT 
            v.vax_type AS type,
            ir.imm_rec_quantity AS doses,
            DATE_FORMAT(ir.imm_rec_date, '%m/%d/%Y') AS date
        FROM 
            immunization_record ir
        JOIN 
            vax_info v ON ir.vax_id = v.vax_id
        WHERE 
            ir.pet_id = ?
        ORDER BY 
            ir.imm_rec_date DESC
        `,
        [pet_id]
    );

    return results;
}
    static async getAllVaccines() {
        const [rows] = await db.execute("SELECT * FROM vax_info");
        return rows;
    }

    static async getVaccineByType(vax_type) {
        const [rows] = await db.execute("SELECT * FROM vax_info WHERE vax_type = ?", [vax_type]);
        return rows.length ? rows[0] : null;
    }

    static async addPetVaccinationRecord(vax_id, pet_id, quantity, date) {
        const [result] = await db.execute(
            `INSERT INTO immunization_record (vax_id, pet_id, imm_rec_quantity, imm_rec_date) 
             VALUES (?, ?, ?, ?)`,
            [vax_id, pet_id, quantity, date]
        );
        return result;
    }
}

module.exports = VaccineModel;
