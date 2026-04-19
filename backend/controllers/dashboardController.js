const Volunteer = require('../models/Volunteer');
const Donation = require('../models/Donation');
const Event = require('../models/Event');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get dashboard summary statistics (role-aware)
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const role = req.user.role;

        if (role === 'Admin') {
            const totalUsers = await User.countDocuments();
            const totalNGOs = await User.countDocuments({ role: 'NGO', isApproved: true });
            const pendingNGOs = await User.countDocuments({ role: 'NGO', isApproved: false });
            const totalVolunteers = await User.countDocuments({ role: 'Volunteer' });
            const totalDonors = await User.countDocuments({ role: 'Donor' });
            const totalEvents = await Event.countDocuments();
            const totalTasks = await Task.countDocuments();
            const pendingTasks = await Task.countDocuments({ status: { $in: ['To Do', 'In Progress'] } });

            const donations = await Donation.aggregate([
                { $match: { status: 'Completed' } },
                { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
            ]);
            const totalDonations = donations.length > 0 ? donations[0].totalAmount : 0;

            const recentDonations = await Donation.find().sort({ createdAt: -1 }).limit(5);

            return res.status(200).json({
                totalUsers, totalNGOs, pendingNGOs, totalVolunteers, totalDonors,
                totalEvents, totalTasks, pendingTasks, totalDonations, recentDonations
            });
        }

        if (role === 'NGO') {
            const myEvents = await Event.countDocuments({ createdBy: req.user._id });
            const myEventsList = await Event.find({ createdBy: req.user._id });
            const myEventIds = myEventsList.map(e => e._id);

            const donations = await Donation.aggregate([
                { $match: { ngoId: req.user._id, status: 'Completed' } },
                { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
            ]);
            const totalDonations = donations.length > 0 ? donations[0].totalAmount : 0;
            const donationCount = donations.length > 0 ? donations[0].count : 0;

            const totalVolunteers = await Event.aggregate([
                { $match: { createdBy: req.user._id } },
                { $project: { count: { $size: '$volunteersAssigned' } } },
                { $group: { _id: null, total: { $sum: '$count' } } }
            ]);
            const volunteerCount = totalVolunteers.length > 0 ? totalVolunteers[0].total : 0;

            return res.status(200).json({
                myEvents, totalDonations, donationCount, volunteerCount
            });
        }

        if (role === 'Donor') {
            const donations = await Donation.aggregate([
                { $match: { donorId: req.user._id, status: 'Completed' } },
                { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
            ]);
            const totalDonated = donations.length > 0 ? donations[0].totalAmount : 0;
            const donationCount = donations.length > 0 ? donations[0].count : 0;
            const availableNGOs = await User.countDocuments({ role: 'NGO', isApproved: true });

            const recentDonations = await Donation.find({ donorId: req.user._id }).sort({ createdAt: -1 }).limit(5);

            return res.status(200).json({
                totalDonated, donationCount, availableNGOs, recentDonations
            });
        }

        if (role === 'Volunteer') {
            const joinedEvents = await Event.countDocuments({ volunteersAssigned: req.user._id });
            const myTasks = await Task.countDocuments({ assignedTo: req.user._id });
            const completedTasks = await Task.countDocuments({ assignedTo: req.user._id, status: 'Done' });
            const availableEvents = await Event.countDocuments({ status: { $in: ['Upcoming', 'Ongoing'] } });

            const myEventsList = await Event.find({ volunteersAssigned: req.user._id })
                .populate('createdBy', 'name ngoName')
                .sort({ date: -1 }).limit(5);

            return res.status(200).json({
                joinedEvents, myTasks, completedTasks, availableEvents, myEventsList
            });
        }

        // Fallback
        res.status(200).json({});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };
