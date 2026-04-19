const mongoose = require('mongoose');

const donationSchema = mongoose.Schema(
    {
        donorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        donorName: {
            type: String,
            required: true,
        },
        ngoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        ngoName: {
            type: String,
            default: '',
        },
        amount: {
            type: Number,
            required: true,
        },
        campaign: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Completed', 'Failed'],
            default: 'Completed',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Donation', donationSchema);
