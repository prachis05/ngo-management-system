const express = require('express');
const router = express.Router();
const {
    getNGOVolunteers,
    getNGOVolunteerById,
} = require('../controllers/volunteerController');
const { protect, authorize, verified } = require('../middleware/authMiddleware');

router.get('/volunteers', protect, verified, authorize('NGO'), getNGOVolunteers);
router.get('/volunteer/:id', protect, verified, authorize('NGO'), getNGOVolunteerById);

module.exports = router;
