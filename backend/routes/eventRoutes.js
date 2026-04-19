const express = require('express');
const router = express.Router();
const {
    getEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    joinEvent,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getEvents)
    .post(protect, authorize('Admin', 'NGO'), addEvent);

router.post('/:id/join', protect, authorize('Volunteer'), joinEvent);

router.route('/:id')
    .put(protect, authorize('Admin', 'NGO'), updateEvent)
    .delete(protect, authorize('Admin', 'NGO'), deleteEvent);

module.exports = router;
