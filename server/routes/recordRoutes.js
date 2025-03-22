const express = require("express");
const recordController = require("../controllers/recordController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/visit-records", authenticate, recordController.getVisitRecords);

router.post("/records/:petId", authenticate, authorize(["doctor", "clinician"]), recordController.addRecord);
router.put("/records/:recordId", authenticate, authorize(["doctor", "clinician"]), recordController.updateRecord);
router.get("/records/request-access-code", authenticate, authorize(["clinician"]), recordController.requestDiagnosisAccessCode);

module.exports = router;
