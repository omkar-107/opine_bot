import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  given_by: string;
  for_task: string;
  for_course: string;
  faculty: string;
  timestamp: string;
  user_chat: string[];
  gpt_chat: string[];
  summary: object;
  completed: boolean;
  completedAt: Date;
}

const FeedbackSchema: Schema = new Schema({
  given_by: {
    type: String,
    required: true,
  },
  for_task: {
    type: String,
    required: true,
  },
  for_course: {
    type: String,
    required: true,
  },
  faculty: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
  user_chat: {
    type: [String],
    required: true,
  },
  gpt_chat: {
    type: [String],
    required: true,
  },
  summary: {
    type: Object,
    required: false,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

// delete mongoose.models.Feedback;

export default mongoose.models.Feedback ||
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);
