const express = require('express');
const router = express.Router();
const {
    getVolunteers,
    addVolunteer,
    updateVolunteer,
    deleteVolunteer,
    getMyVolunteerProfile,
    updateMySkills,
    getVolunteerActivity,
} = require('../controllers/volunteerController');
const { protect, admin, authorize, verified } = require('../middleware/authMiddleware');

// Volunteer self-service routes (must be before /:id)
router.get('/me/dashboard', protect, verified, authorize('Volunteer'), getVolunteerActivity);
router.get('/me', protect, authorize('Volunteer'), getMyVolunteerProfile);
router.put('/me/skills', protect, authorize('Volunteer'), updateMySkills);

router.route('/')
    .get(protect, getVolunteers)
    .post(protect, admin, addVolunteer);

router.route('/:id')
    .put(protect, admin, updateVolunteer)
    .delete(protect, admin, deleteVolunteer);

module.exports = router;
