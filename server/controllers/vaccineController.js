const VaccineModel = require("../models/vaccineModel");
exports.getPetVaccinationRecords = async (req, res) => {
    const { pet_id } = req.params; // Extract pet_id from the URL

    try {
        // Fetch vaccination records from the database
        const vaccinationRecords = await VaccineModel.getVaccinationRecordsByPetId(pet_id);

        if (!vaccinationRecords || vaccinationRecords.length === 0) {
            return res.status(404).json({ error: "No vaccination records found for this pet." });
        }

        res.status(200).json(vaccinationRecords); // Send the vaccination records as a response
    } catch (error) {
        console.error("Error fetching vaccination records:", error);
        res.status(500).json({ error: "❌ Server error while fetching vaccination records." });
    }
};
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
