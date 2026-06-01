import mongoose, { type Document, type Model, Schema } from 'mongoose';

export type WorkoutPlanGenerationSource = 'manual' | 'ai' | 'ai-fallback';

export interface WorkoutPlanDocument extends Document {
  title: string;
  description?: string;
  team: mongoose.Types.ObjectId;
  isPersonal: boolean;
  createdBy?: mongoose.Types.ObjectId;
  assignee?: mongoose.Types.ObjectId;
  goalSummary?: string;
  weeklyStructure: string[];
  progressionNotes?: string;
  cardioSummary?: string;
  safetyNotes?: string;
  generationSource: WorkoutPlanGenerationSource;
  aiMetadata?: {
    generatedAt?: Date;
    generator?: string;
    model?: string;
    requestId?: mongoose.Types.ObjectId;
    promptVersion?: string;
    notes?: string;
  };
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
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    goalSummary: { type: String },
    weeklyStructure: [{ type: String }],
    progressionNotes: { type: String },
    cardioSummary: { type: String },
    safetyNotes: { type: String },
    generationSource: {
      type: String,
      enum: ['manual', 'ai', 'ai-fallback'],
      default: 'manual',
    },
    aiMetadata: {
      generatedAt: { type: Date },
      generator: { type: String },
      model: { type: String },
      requestId: { type: Schema.Types.ObjectId, ref: 'TrainingGenerationRequest' },
      promptVersion: { type: String },
      notes: { type: String },
    },
  },
  { timestamps: true }
);

const WorkoutPlan: Model<WorkoutPlanDocument> =
  mongoose.models.WorkoutPlan ||
  mongoose.model<WorkoutPlanDocument>('WorkoutPlan', WorkoutPlanSchema);

export default WorkoutPlan;
