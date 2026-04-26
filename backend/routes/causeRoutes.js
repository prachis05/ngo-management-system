const express = require('express');
const router = express.Router();
const { createCause, getCausesByNGO, getCauseById } = require('../controllers/causeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, authorize('NGO'), upload.single('image'), createCause);
router.get('/ngo/:id', protect, getCausesByNGO);
router.get('/:id', protect, getCauseById);

module.exports = router;
