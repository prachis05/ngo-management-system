const Volunteer = require('../models/Volunteer');

// @desc    Get volunteers
// @route   GET /api/volunteers
// @access  Private
const getVolunteers = async (req, res) => {
    try {
        const volunteers = await Volunteer.find().populate('assignedEvents', 'title date');
        res.status(200).json(volunteers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add volunteer
// @route   POST /api/volunteers
// @access  Private/Admin
const addVolunteer = async (req, res) => {
    try {
        const volunteer = await Volunteer.create(req.body);
        res.status(201).json(volunteer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update volunteer
// @route   PUT /api/volunteers/:id
// @access  Private/Admin
const updateVolunteer = async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id);
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }
        const updatedVolunteer = await Volunteer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(updatedVolunteer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete volunteer
// @route   DELETE /api/volunteers/:id
// @access  Private/Admin
const deleteVolunteer = async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id);
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }
        await volunteer.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get my volunteer profile (for logged-in volunteer)
// @route   GET /api/volunteers/me
// @access  Private/Volunteer
const getMyVolunteerProfile = async (req, res) => {
    try {
        const volunteer = await Volunteer.findOne({ userId: req.user._id }).populate('assignedEvents', 'title date location status');
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer profile not found' });
        }
        res.status(200).json(volunteer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update my volunteer skills
// @route   PUT /api/volunteers/me/skills
// @access  Private/Volunteer
const updateMySkills = async (req, res) => {
    try {
        const volunteer = await Volunteer.findOne({ userId: req.user._id });
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer profile not found' });
        }
        volunteer.skills = req.body.skills || volunteer.skills;
        await volunteer.save();
        res.status(200).json(volunteer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getVolunteers,
    addVolunteer,
    updateVolunteer,
    deleteVolunteer,
    getMyVolunteerProfile,
    updateMySkills,
};
