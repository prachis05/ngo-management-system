const User = require('../models/User');
const Donation = require('../models/Donation');
const Event = require('../models/Event');
const Volunteer = require('../models/Volunteer');

// @desc    Get all users (with optional role filter)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const filter = {};
        if (req.query.role) {
            filter.role = req.query.role;
        }
        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending NGO registrations
// @route   GET /api/admin/pending-ngos
// @access  Private/Admin
const getPendingNGOs = async (req, res) => {
    try {
        const pendingNGOs = await User.find({ role: 'NGO', isApproved: false }).select('-password').sort({ createdAt: -1 });
        res.status(200).json(pendingNGOs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve NGO registration
// @route   PUT /api/admin/approve/:id
// @access  Private/Admin
const approveNGO = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role !== 'NGO') {
            return res.status(400).json({ message: 'User is not an NGO' });
        }
        user.isApproved = true;
        await user.save();
        res.status(200).json({ message: 'NGO approved successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject NGO registration
// @route   PUT /api/admin/reject/:id
// @access  Private/Admin
const rejectNGO = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role !== 'NGO') {
            return res.status(400).json({ message: 'User is not an NGO' });
        }
        await user.deleteOne();
        res.status(200).json({ message: 'NGO registration rejected and removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all NGOs with basic stats
// @route   GET /api/admin/ngos
// @access  Private/Admin
const getAllNGOs = async (req, res) => {
    try {
        const ngos = await User.find({ role: 'NGO' }).select('-password').sort({ createdAt: -1 });

        // Enrich each NGO with aggregated stats
        const ngosWithStats = await Promise.all(
            ngos.map(async (ngo) => {
                const donations = await Donation.find({ ngoId: ngo._id });
                const totalDonations = donations.length;
                const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
                const totalEvents = await Event.countDocuments({ createdBy: ngo._id });

                return {
                    _id: ngo._id,
                    name: ngo.name,
                    email: ngo.email,
                    ngoName: ngo.ngoName,
                    isApproved: ngo.isApproved,
                    createdAt: ngo.createdAt,
                    totalDonations,
                    totalAmount,
                    totalEvents,
                };
            })
        );

        res.status(200).json(ngosWithStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get detailed info for a single NGO (donations, events, volunteers)
// @route   GET /api/admin/ngo/:id/details
// @access  Private/Admin
const getNGODetails = async (req, res) => {
    try {
        const ngo = await User.findById(req.params.id).select('-password');
        if (!ngo || ngo.role !== 'NGO') {
            return res.status(404).json({ message: 'NGO not found' });
        }

        // Donations for this NGO
        const donations = await Donation.find({ ngoId: ngo._id }).sort({ createdAt: -1 });

        // Events created by this NGO
        const events = await Event.find({ createdBy: ngo._id })
            .populate('volunteersAssigned', 'name email')
            .sort({ date: -1 });

        // Volunteers assigned to this NGO's events
        // Extract volunteers safely from events
        let volunteers = [];

        events.forEach(event => {
            if (!event.volunteersAssigned) return;

            event.volunteersAssigned.forEach(vol => {
                if (!vol || !vol._id) return;

                let existing = volunteers.find(v => v._id.toString() === vol._id.toString());

                const eventData = {
                    _id: event._id,
                    title: event.title,
                    date: event.date
                };

                if (!existing) {
                    volunteers.push({
                        _id: vol._id,
                        name: vol.name || 'Unknown',
                        email: vol.email || '',
                        status: vol.status || 'Active',
                        skills: vol.skills || [],
                        assignedEvents: [eventData]
                    });
                } else {
                    existing.assignedEvents.push(eventData);
                }
            });
        });

        // Aggregate stats
        const totalDonations = donations.length;
        const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
        const totalEvents = events.length;
        const totalVolunteers = volunteers.length;

        console.log("VOLUNTEERS:", volunteers);

        res.status(200).json({
            ngo,
            donations,
            events,
            volunteers,
            stats: {
                totalDonations,
                totalAmount,
                totalEvents,
                totalVolunteers,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending verifications
// @route   GET /api/admin/pending-verifications
// @access  Private/Admin
const getPendingVerifications = async (req, res) => {
    try {
        const pending = await User.find({ verificationStatus: 'Pending', role: { $in: ['NGO', 'Volunteer'] } }).select('-password');
        res.status(200).json(pending);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve identity verification
// @route   PUT /api/admin/approve-verification/:id
// @access  Private/Admin
const approveVerification = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.verificationStatus = 'Approved';
        if (user.role === 'NGO') {
            user.isApproved = true; // Auto-approve NGO status when ID is verified
        }
        await user.save();
        res.status(200).json({ message: 'Verification approved', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject identity verification
// @route   PUT /api/admin/reject-verification/:id
// @access  Private/Admin
const rejectVerification = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.verificationStatus = 'Rejected';
        await user.save();
        res.status(200).json({ message: 'Verification rejected' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all volunteers with drill-down info
// @route   GET /api/admin/volunteers
// @access  Private/Admin
const getAdminVolunteers = async (req, res) => {
    try {
        const volunteers = await Volunteer.find().populate('assignedEvents');
        res.status(200).json(volunteers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single volunteer drill-down details
// @route   GET /api/admin/volunteer/:id
// @access  Private/Admin
const getAdminVolunteerById = async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id).populate('userId', '-password');
        if (!volunteer) return res.status(404).json({ message: 'Volunteer not found' });

        // populate events and tasks
        const events = await Event.find({ volunteersAssigned: volunteer.userId }).populate('createdBy', 'name ngoName');
        const tasks = await require('../models/Task').find({ assignedTo: volunteer.userId }).populate('eventId', 'title');

        const ngosWorkedWith = [...new Set(events.map(e => e.createdBy?.ngoName || e.createdBy?.name).filter(Boolean))];

        res.status(200).json({
            volunteer,
            events,
            tasks,
            ngosWorkedWith
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    getPendingNGOs,
    approveNGO,
    rejectNGO,
    getAllNGOs,
    getNGODetails,
    getPendingVerifications,
    approveVerification,
    rejectVerification,
    getAdminVolunteers,
    getAdminVolunteerById,
};
