const mongoose = require('mongoose');

const causeSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        image: {
            type: String,
        },
        targetAmount: {
            type: Number,
            required: true,
        },
        raisedAmount: {
            type: Number,
            default: 0,
        },
        ngoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Cause', causeSchema);
