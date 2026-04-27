const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, ngoName, city, skills, phone } = req.body;
    const parsedSkills = skills ? JSON.parse(skills) : [];

    console.log("RAW skills from frontend:", skills);
    console.log("PARSED skills:", parsedSkills);
    try {
        // Block Admin registration from UI
        if (role === 'Admin') {
            return res.status(403).json({ message: 'Admin accounts cannot be registered. Contact system administrator.' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // NGO users start as unapproved
        const isApproved = role === 'NGO' ? false : true;

        // Identity Verification
        let idProofPath = null;
        let vStatus = 'Approved';

        if (role === 'NGO' || role === 'Volunteer') {
            vStatus = 'Pending';
            if (req.file) {
                // store relative path
                idProofPath = req.file.filename;
            } else {
                return res.status(400).json({ message: 'ID Proof document is required for NGO and Volunteer registration.' });
            }
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'Volunteer',
            ngoName: role === 'NGO' ? ngoName : '',
            isApproved,
            idProof: idProofPath,
            verificationStatus: vStatus,
            city: role === 'Volunteer' ? city : '',
            skills: role === 'Volunteer' ? parsedSkills : [],
            phone: role === 'Volunteer' ? phone : '',
        });

        // Auto-create volunteer record when a user registers as Volunteer
        if (role === 'Volunteer') {
            await Volunteer.create({
                userId: user._id,
                name: user.name,
                email: user.email,
                skills: parsedSkills,
                city: city,
                phone: phone,
                status: 'Available',
            });
        }

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                ngoName: user.ngoName,
                isApproved: user.isApproved,
                verificationStatus: user.verificationStatus,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                ngoName: user.ngoName,
                isApproved: user.isApproved,
                verificationStatus: user.verificationStatus,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
};
