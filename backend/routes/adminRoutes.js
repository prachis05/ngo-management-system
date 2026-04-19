const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getPendingNGOs,
    approveNGO,
    rejectNGO,
    getAllNGOs,
    getNGODetails,
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

module.exports = router;
