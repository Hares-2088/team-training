import mongoose from 'mongoose';

const ExerciseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: true,
        },
        muscleGroups: {
            type: [String],
            default: [],
        },
        equipment: {
            type: String,
            default: '',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

// Create compound unique index: same exercise name can exist for different teams
ExerciseSchema.index({ name: 1, teamId: 1 }, { unique: true });
// Create text index for searching
ExerciseSchema.index({ name: 'text' });

export default mongoose.models.Exercise || mongoose.model('Exercise', ExerciseSchema);
