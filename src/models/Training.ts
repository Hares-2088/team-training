import mongoose from 'mongoose';

const trainingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a training title'],
        },
        description: {
            type: String,
        },
        exercises: [
            {
                name: String,
                sets: Number,
                reps: String,
                restTime: { type: Number, default: 90 }, // Rest time in seconds between sets
                notes: String,
            },
        ],
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: true,
        },
        scheduledDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['scheduled', 'completed', 'cancelled'],
            default: 'scheduled',
        },
        isPersonal: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Training || mongoose.model('Training', trainingSchema);
