const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getPendingNGOs,
    approveNGO,
    rejectNGO,
    getAllNGOs,
    getNGODetails,
    getPendingVerifications,
    approveVerification,
    rejectVerification,
    getAdminVolunteers,
    getAdminVolunteerById,
} = require('../controllers/adminController');
const { getReport } = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/users', protect, admin, getAllUsers);
router.get('/pending-ngos', protect, admin, getPendingNGOs);
router.get('/ngos', protect, admin, getAllNGOs);
router.get('/ngo/:id/details', protect, admin, getNGODetails);
router.get('/reports', protect, admin, getReport);
router.put('/approve/:id', protect, admin, approveNGO);
router.put('/reject/:id', protect, admin, rejectNGO);

// Verifications
router.get('/pending-verifications', protect, admin, getPendingVerifications);
router.put('/approve-verification/:id', protect, admin, approveVerification);
router.put('/reject-verification/:id', protect, admin, rejectVerification);

// Drill-downs
router.get('/volunteers', protect, admin, getAdminVolunteers);
router.get('/volunteer/:id', protect, admin, getAdminVolunteerById);

module.exports = router;
