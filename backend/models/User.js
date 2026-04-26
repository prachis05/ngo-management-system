const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['Admin', 'Volunteer', 'Donor', 'NGO'],
            default: 'Volunteer',
        },
        ngoName: {
            type: String,
            default: '',
        },
        idProof: {
            type: String,
            default: null,
        },
        verificationStatus: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Approved',
            // Donors and Admins skip verification. NGOs and Volunteers are set to Pending during registration logic.
        },
        isApproved: {
            type: Boolean,
            default: true,
        },
        city: {
            type: String,
            default: ''
        },
        skills: {
            type: [String],
            default: []
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);
