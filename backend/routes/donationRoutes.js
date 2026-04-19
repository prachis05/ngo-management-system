const express = require('express');
const router = express.Router();
const {
    getDonations,
    addDonation,
    updateDonationStatus,
    getApprovedNGOs,
} = require('../controllers/donationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/ngos', protect, getApprovedNGOs);

router.route('/')
    .get(protect, getDonations)
    .post(protect, addDonation);

router.route('/:id')
    .put(protect, admin, updateDonationStatus);

module.exports = router;
