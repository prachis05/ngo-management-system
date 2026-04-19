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
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Volunteer', volunteerSchema);
