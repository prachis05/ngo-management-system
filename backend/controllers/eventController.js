const Event = require('../models/Event');

// @desc    Get all events (role-aware)
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
    try {
        let events;
        if (req.user.role === 'NGO') {
            events = await Event.find({ createdBy: req.user._id })
                .populate('volunteersAssigned', 'name email')
                .populate('createdBy', 'name ngoName')
                .sort({ date: -1 });
        } else {
            events = await Event.find()
                .populate('volunteersAssigned', 'name email')
                .populate('createdBy', 'name ngoName')
                .sort({ date: -1 });
        }
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create an event
// @route   POST /api/events
// @access  Private/Admin,NGO
const addEvent = async (req, res) => {
    try {
        const event = await Event.create({
            ...req.body,
            createdBy: req.user._id,
        });
        const populated = await Event.findById(event._id)
            .populate('volunteersAssigned', 'name email')
            .populate('createdBy', 'name ngoName');
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin,NGO(own)
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        // NGO can only update own events
        if (req.user.role === 'NGO' && event.createdBy?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this event' });
        }
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('volunteersAssigned', 'name email').populate('createdBy', 'name ngoName');
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin,NGO(own)
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        if (req.user.role === 'NGO' && event.createdBy?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }
        await event.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Volunteer joins an event
// @route   POST /api/events/:id/join
// @access  Private/Volunteer
const joinEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        if (event.volunteersAssigned.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already joined this event' });
        }
        event.volunteersAssigned.push(req.user._id);
        await event.save();
        const populated = await Event.findById(event._id)
            .populate('volunteersAssigned', 'name email')
            .populate('createdBy', 'name ngoName');
        res.status(200).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    joinEvent,
};
