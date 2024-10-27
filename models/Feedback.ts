import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  given_by: string;
  for_task: string;
  for_course: string;
  faculty: string;
  timestamp: string;
  user_chat: string[];
  gpt_chat: string[];
}

const FeedbackSchema: Schema = new Schema({
  given_by: {
    //student username
    type: String,
    required: true,
  },
  for_task: {
    //feedbacktask id
    type: String,
    required: true,
  },
  for_course: {
    //course id
    type: String,
    required: true,
  },
  faculty: {
    //faculty username
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
});

export default mongoose.models.Feedback ||
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);
