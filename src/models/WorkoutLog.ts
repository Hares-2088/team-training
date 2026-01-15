import mongoose from 'mongoose';

const workoutLogSchema = new mongoose.Schema(
    {
        training: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Training',
            required: true,
        },
        member: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        exercises: [
            {
                exerciseName: String,
                setNumber: Number,
                weight: Number,
                reps: Number,
                notes: String,
            },
        ],
        completedAt: {
            type: Date,
            default: Date.now,
        },
        notes: String,
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.WorkoutLog || mongoose.model('WorkoutLog', workoutLogSchema);
