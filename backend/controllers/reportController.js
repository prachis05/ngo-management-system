const Donation = require('../models/Donation');
const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Generate filtered reports
// @route   GET /api/admin/reports
// @access  Private/Admin
const getReport = async (req, res) => {
    try {
        const { startDate, endDate, ngoId, eventId } = req.query;

        // --- Build donation filter ---
        const donationFilter = {};
        if (startDate || endDate) {
            donationFilter.createdAt = {};
            if (startDate) donationFilter.createdAt.$gte = new Date(startDate);
            if (endDate) donationFilter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
        }
        if (ngoId) {
            donationFilter.ngoId = ngoId;
        }

        // --- Build event filter ---
        const eventFilter = {};
        if (startDate || endDate) {
            eventFilter.date = {};
            if (startDate) eventFilter.date.$gte = new Date(startDate);
            if (endDate) eventFilter.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
        }
        if (ngoId) {
            eventFilter.createdBy = ngoId;
        }
        if (eventId) {
            eventFilter._id = eventId;
        }

        // --- Fetch data ---
        const donations = await Donation.find(donationFilter).sort({ createdAt: -1 });
        const events = await Event.find(eventFilter)
            .populate('createdBy', 'name ngoName')
            .populate('volunteersAssigned', 'name')
            .sort({ date: -1 });

        // --- Aggregate ---
        const totalDonations = donations.length;
        const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
        const totalEvents = events.length;

        // --- Donation breakdown by NGO ---
        const ngoBreakdown = {};
        donations.forEach(d => {
            const key = d.ngoName || 'Unspecified';
            if (!ngoBreakdown[key]) {
                ngoBreakdown[key] = { ngoName: key, count: 0, amount: 0 };
            }
            ngoBreakdown[key].count += 1;
            ngoBreakdown[key].amount += d.amount || 0;
        });
        const donationsByNGO = Object.values(ngoBreakdown);

        // --- Monthly trend (last 6 months) ---
        const monthlyTrend = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
            const monthLabel = monthStart.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
            const monthDonations = donations.filter(d => {
                const dt = new Date(d.createdAt);
                return dt >= monthStart && dt <= monthEnd;
            });
            monthlyTrend.push({
                month: monthLabel,
                count: monthDonations.length,
                amount: monthDonations.reduce((s, d) => s + (d.amount || 0), 0),
            });
        }

        res.status(200).json({
            totalDonations,
            totalAmount,
            totalEvents,
            donations,
            events,
            donationsByNGO,
            monthlyTrend,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getReport };
