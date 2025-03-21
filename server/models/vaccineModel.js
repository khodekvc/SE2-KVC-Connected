const db = require("../config/db");

class VaccineModel {
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
