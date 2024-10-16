import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  id_: string;
  given_by: string;
  for_course: string;
  faculty: string;
  timestamp: string;
  user_chat: string[];
  gpt_chat: string[];
}

const FeedbackSchema: Schema = new Schema({
  id_: {
    //feedback id
    type: String,
    required: true,
  },
  given_by: {
    //student username
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
