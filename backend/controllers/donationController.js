const Donation = require('../models/Donation');
const User = require('../models/User');

// @desc    Get all donations (role-aware)
// @route   GET /api/donations
// @access  Private
const getDonations = async (req, res) => {
    try {
        let donations;
        if (req.user.role === 'Admin') {
            donations = await Donation.find().sort({ createdAt: -1 });
        } else if (req.user.role === 'NGO') {
            donations = await Donation.find({ ngoId: req.user._id }).sort({ createdAt: -1 });
        } else {
            donations = await Donation.find({ donorId: req.user._id }).sort({ createdAt: -1 });
        }
        res.status(200).json(donations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a donation
// @route   POST /api/donations
// @access  Private
const addDonation = async (req, res) => {
    const { amount, campaign, ngoId } = req.body;
    try {
        let ngoName = '';
        if (ngoId) {
            const ngo = await User.findById(ngoId);
            if (ngo) ngoName = ngo.ngoName || ngo.name;
        }

        const donation = await Donation.create({
            donorId: req.user._id,
            donorName: req.user.name,
            ngoId: ngoId || null,
            ngoName,
            amount,
            campaign,
            status: 'Completed'
        });
        res.status(201).json(donation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update donation status
// @route   PUT /api/donations/:id
// @access  Private/Admin
const updateDonationStatus = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }
        donation.status = req.body.status || donation.status;
        const updatedDonation = await donation.save();
        res.status(200).json(updatedDonation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get list of approved NGOs (for donor dropdown)
// @route   GET /api/donations/ngos
// @access  Private
const getApprovedNGOs = async (req, res) => {
    try {
        const ngos = await User.find({ role: 'NGO', isApproved: true }).select('_id name ngoName');
        res.status(200).json(ngos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDonations,
    addDonation,
    updateDonationStatus,
    getApprovedNGOs,
};
