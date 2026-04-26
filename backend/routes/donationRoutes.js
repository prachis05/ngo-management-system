const express = require('express');
const router = express.Router();
const {
    getDonations,
    addDonation,
    updateDonationStatus,
    getApprovedNGOs,
    getMyDonations,
    getDonationById,
} = require('../controllers/donationController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

router.get('/ngos', protect, getApprovedNGOs);

// Drill-downs
router.get('/my', protect, authorize('Donor'), getMyDonations);
router.get('/:id/details', protect, authorize('Donor'), getDonationById);

router.route('/')
    .get(protect, getDonations)
    .post(protect, addDonation);

router.route('/:id')
    .put(protect, admin, updateDonationStatus);

module.exports = router;
