import mongoose, { Schema } from 'mongoose';

const exerciseSchema = new Schema(
  {
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: String, required: true },
    restTime: { type: Number, default: 90 },
    notes: { type: String },
  },
  { _id: false }
);

const cardioBlockSchema = new Schema(
  {
    type: { type: String },
    durationMinutes: { type: Number },
    intensity: { type: String },
    instructions: { type: String },
  },
  { _id: false }
);

const trainingSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a training title'],
    },
    description: {
      type: String,
    },
    exercises: [exerciseSchema],
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    isPersonal: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: 'WorkoutPlan',
    },
    warmup: [{ type: String }],
    dayFocus: { type: String },
    cardioBlock: cardioBlockSchema,
    intensityNotes: { type: String },
    instructions: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Training || mongoose.model('Training', trainingSchema);
