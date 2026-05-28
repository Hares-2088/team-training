import mongoose, { Schema, Document, Model } from 'mongoose';

export interface WorkoutPlanDocument extends Document {
    title: string;
    description?: string;
    team: mongoose.Types.ObjectId;
    isPersonal: boolean;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const WorkoutPlanSchema = new Schema<WorkoutPlanDocument>(
    {
        title: { type: String, required: [true, 'Please provide a plan title'] },
        description: { type: String },
        team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
        isPersonal: { type: Boolean, default: false },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

const WorkoutPlan: Model<WorkoutPlanDocument> =
    mongoose.models.WorkoutPlan ||
    mongoose.model<WorkoutPlanDocument>('WorkoutPlan', WorkoutPlanSchema);

export default WorkoutPlan;
