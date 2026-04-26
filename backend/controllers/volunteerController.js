const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');
const Task = require('../models/Task');

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

// @desc    Get volunteers associated with NGO's events
// @route   GET /api/ngo/volunteers
// @access  Private/NGO
const getNGOVolunteers = async (req, res) => {
    try {
        const events = await Event.find({ createdBy: req.user.id });
        const eventIds = events.map(e => e._id);
        const volunteers = await Volunteer.find({ assignedEvents: { $in: eventIds } }).populate('assignedEvents', 'title date');
        res.status(200).json(volunteers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single volunteer drill-down (NGO specific)
// @route   GET /api/ngo/volunteer/:id
// @access  Private/NGO
const getNGOVolunteerById = async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id).populate('userId', '-password');
        if (!volunteer) return res.status(404).json({ message: 'Volunteer not found' });

        const events = await Event.find({ volunteersAssigned: volunteer.userId, createdBy: req.user.id });
        const eventIds = events.map(e => e._id);
        const tasks = await Task.find({ assignedTo: volunteer.userId, eventId: { $in: eventIds } }).populate('eventId', 'title');

        res.status(200).json({
            volunteer,
            events,
            tasks
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my volunteer drill-down dashboard
// @route   GET /api/volunteers/me/dashboard
// @access  Private/Volunteer
const getVolunteerActivity = async (req, res) => {
    try {
        const volunteer = await Volunteer.findOne({ userId: req.user._id });
        if (!volunteer) return res.status(404).json({ message: 'Volunteer profile not found' });

        const events = await Event.find({ volunteersAssigned: req.user.id }).populate('createdBy', 'ngoName name');
        const tasks = await Task.find({ assignedTo: req.user.id }).populate('eventId', 'title');
        
        const ngosWorkedWith = [...new Set(events.map(e => e.createdBy?.ngoName || e.createdBy?.name).filter(Boolean))];

        res.status(200).json({
            events,
            tasks,
            ngosWorkedWith
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getVolunteers,
    addVolunteer,
    updateVolunteer,
    deleteVolunteer,
    getMyVolunteerProfile,
    updateMySkills,
    getNGOVolunteers,
    getNGOVolunteerById,
    getVolunteerActivity,
};
