const Cause = require('../models/Cause');

// @desc    Create a new cause/campaign
// @route   POST /api/causes
// @access  Private/NGO
const createCause = async (req, res) => {
    try {
        const { title, description, targetAmount } = req.body;
        
        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        const cause = await Cause.create({
            title,
            description,
            targetAmount,
            image: imageUrl,
            ngoId: req.user._id,
        });

        res.status(201).json(cause);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all causes for a specific NGO (with NGO details)
// @route   GET /api/causes/ngo/:id
// @access  Public or Private
const getCausesByNGO = async (req, res) => {
    try {
        const User = require('../models/User');
        const ngo = await User.findById(req.params.id).select('name ngoName email city verificationStatus isApproved createdAt');
        const causes = await Cause.find({ ngoId: req.params.id }).sort({ createdAt: -1 });
        res.status(200).json({ ngo, causes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single cause by ID
// @route   GET /api/causes/:id
// @access  Public or Private
const getCauseById = async (req, res) => {
    try {
        const cause = await Cause.findById(req.params.id);
        if (!cause) {
            return res.status(404).json({ message: 'Cause not found' });
        }
        res.status(200).json(cause);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    createCause,
    getCausesByNGO,
    getCauseById,
};
