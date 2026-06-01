import mongoose, { Schema } from 'mongoose';

const trainingGenerationRequestSchema = new Schema(
  {
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    generator: {
      provider: { type: String, default: 'openai' },
      model: { type: String },
      source: { type: String, enum: ['ai', 'ai-fallback'], default: 'ai' },
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    inputPayload: {
      title: { type: String },
      goalSummary: { type: String },
      availability: [{ type: String }],
      weeks: { type: Number },
      preferences: { type: String },
      injuries: { type: String },
      notes: { type: String },
      uploadedImageIds: [{ type: Schema.Types.ObjectId, ref: 'UserProgressImage' }],
      isPersonal: { type: Boolean },
    },
    requestSnapshot: {
      type: Schema.Types.Mixed,
      required: true,
    },
    responseSnapshot: {
      type: Schema.Types.Mixed,
    },
    createdPlan: {
      type: Schema.Types.ObjectId,
      ref: 'WorkoutPlan',
    },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export default
  mongoose.models.TrainingGenerationRequest ||
  mongoose.model('TrainingGenerationRequest', trainingGenerationRequestSchema);
