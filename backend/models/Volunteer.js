const mongoose = require('mongoose');

const volunteerSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        skills: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            enum: ['Available', 'Assigned', 'Inactive'],
            default: 'Available',
        },
        assignedEvents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Event',
            },
        ],
        city: {
            type: String,
            default: ''
        },
        skills: {
            type: [String],
            default: []
        },
        phone: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Volunteer', volunteerSchema);
