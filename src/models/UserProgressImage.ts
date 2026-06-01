import mongoose, { Schema } from 'mongoose';

const userProgressImageSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    generationRequest: {
      type: Schema.Types.ObjectId,
      ref: 'TrainingGenerationRequest',
    },
    workoutPlan: {
      type: Schema.Types.ObjectId,
      ref: 'WorkoutPlan',
    },
    fileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    sizeBytes: {
      type: Number,
      required: true,
    },
    note: { type: String },
    capturedAt: { type: Date },
    imageData: {
      type: Buffer,
      select: false,
      required: true,
    },
  },
  { timestamps: true }
);

export default
  mongoose.models.UserProgressImage ||
  mongoose.model('UserProgressImage', userProgressImageSchema);
