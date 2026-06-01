import mongoose, { Schema } from 'mongoose';

const exerciseSchema = new Schema(
  {
    exerciseName: { type: String, required: true },
    setNumber: { type: Number, required: true },
    weight: { type: Number, required: true },
    weightUnit: { type: String, enum: ['lbs', 'kg', 'bodyweight'], default: 'lbs' },
    reps: { type: Number, required: true },
    rpe: { type: Number },
    notes: { type: String },
  },
  { _id: false }
);

const workoutLogSchema = new Schema(
  {
    training: {
      type: Schema.Types.ObjectId,
      ref: 'Training',
      required: true,
    },
    member: {
      type: Schema.Types.ObjectId,
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
    sessionFeeling: {
      type: String,
      enum: ['great', 'good', 'okay', 'low', 'bad'],
    },
    completionStatus: {
      type: String,
      enum: ['completed', 'partial', 'skipped'],
      default: 'completed',
    },
    skippedExercises: [{ type: String }],
    overallFeedback: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.WorkoutLog || mongoose.model('WorkoutLog', workoutLogSchema);
