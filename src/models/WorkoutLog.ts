import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
    {
        exerciseName: { type: String, required: true },
        setNumber: { type: Number, required: true },
        weight: { type: Number, required: true },
        reps: { type: Number, required: true },
        rpe: { type: Number },
        notes: { type: String },
    },
    { _id: false }
);

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
        exercises: [exerciseSchema],
        startTime: {
            type: Date,
        },
        endTime: {
            type: Date,
        },
        duration: {
            type: Number,
        },
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
