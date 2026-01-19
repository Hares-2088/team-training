import mongoose, { Schema, Document, Model } from 'mongoose';

interface ExerciseTemplate {
    name: string;
    sets: number;
    reps: string;
    restTime: number;
    notes?: string;
}

export interface WorkoutTemplateDocument extends Document {
    title: string;
    description?: string;
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
    estimatedDuration?: number; // minutes
    exercises: ExerciseTemplate[];
    createdAt: Date;
    updatedAt: Date;
}

const ExerciseSchema = new Schema<ExerciseTemplate>({
    name: { type: String, required: true },
    sets: { type: Number, required: true, min: 1 },
    reps: { type: String, required: true },
    restTime: { type: Number, required: true, min: 0 },
    notes: { type: String },
});

const WorkoutTemplateSchema = new Schema<WorkoutTemplateDocument>({
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    tags: [{ type: String }],
    estimatedDuration: { type: Number },
    exercises: { type: [ExerciseSchema], required: true },
}, { timestamps: true });

const WorkoutTemplate: Model<WorkoutTemplateDocument> = mongoose.models.WorkoutTemplate || mongoose.model<WorkoutTemplateDocument>('WorkoutTemplate', WorkoutTemplateSchema);

export default WorkoutTemplate;
