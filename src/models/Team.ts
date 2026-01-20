import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a team name'],
        },
        description: {
            type: String,
        },
        trainer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // Flat member ids kept for compatibility with existing code paths
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        // Memberships with per-user role assignment
        memberRoles: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                role: {
                    type: String,
                    enum: ['trainer', 'member', 'coach'],
                    default: 'member',
                },
            },
        ],
        inviteCode: {
            type: String,
            unique: true,
            sparse: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Team || mongoose.model('Team', teamSchema);
