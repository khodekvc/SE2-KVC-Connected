const VaccineModel = require("../models/vaccineModel");

exports.addPetVaccinationRecord = async (req, res) => {
    const { pet_id } = req.params; // Extract pet_id from the URL
    const { vax_type, imm_rec_quantity, imm_rec_date } = req.body;

    // Check if required fields are provided
    if (!vax_type || !imm_rec_quantity) {
        return res.status(400).json({ error: "❌ Vaccine type and dose quantity are required." });
    }

    try {
        // Validate vaccine type
        const vaccine = await VaccineModel.getVaccineByType(vax_type);
        if (!vaccine) {
            return res.status(400).json({ error: "❌ Invalid vaccine type. Please select a valid vaccine." });
        }

        const vax_id = vaccine.vax_id; // Get vaccine ID from the database

        // Insert vaccination record
        await VaccineModel.addPetVaccinationRecord(vax_id, pet_id, imm_rec_quantity, imm_rec_date);
        res.json({ message: "✅ Vaccination record added successfully!" });

    } catch (error) {
        console.error("Error adding vaccination record:", error);
        res.status(500).json({ error: "❌ Server error while adding record." });
    }
};
