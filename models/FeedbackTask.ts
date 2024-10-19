import mongoose, { Schema, Document } from "mongoose";

export interface IFeedbackTask extends Document {
  _id: string;
  title: string; //feedback task title
  course_id: string;
  created_by: string; //faculty id
  timestamp: string;
  active: boolean; //feedback is active or not
  feedbacks: string[]; //all student feedback ids
}

const FeedbackTaskSchema: Schema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  course_id: {
    type: String,
    required: true,
  },
  created_by: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  feedbacks: {
    type: [String],
    required: true,
  },
});

export default mongoose.models.FeedbackTask ||
  mongoose.model<IFeedbackTask>("FeedbackTask", FeedbackTaskSchema);
