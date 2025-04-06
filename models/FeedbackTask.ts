import mongoose, { Schema, Document } from "mongoose";

export interface ISentimentData {
  id: string;
  sentiment: string; // e.g., "Positive", "Neutral", "Negative"
  rating: number;
  created_at?: string;
  course_name?: string;
  faculty_name?: string;
}

export interface IFinalSummary {
  message: string;
  average_rating: number;
  insights: string[];
  sentiment_data: ISentimentData[];
  generated_at: string;
}

export interface IFeedbackTask extends Document {
  title: string;
  course_id: string;
  created_by: string;
  active: boolean;
  feedbacks: string[];
  timestamp: Date;
  final_summary?: IFinalSummary;
}

const FeedbackTaskSchema: Schema = new Schema(
  {
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
      type: Date,
      default: Date.now,
    },
    active: {
      type: Boolean,
      required: true,
    },
    feedbacks: {
      type: [String],
      required: true,
    },
    final_summary: {
      type: new Schema(
        {
          message: { type: String, required: true },
          average_rating: { type: Number, required: true },
          insights: [{ type: String }],
          sentiment_data: [
            {
              id: { type: String },
              sentiment: { type: String },
              rating: { type: Number },
              created_at: { type: String },
              course_name: { type: String },
              faculty_name: { type: String },
            },
          ],
          generated_at: { type: String },
        },
        { _id: false } // prevent nested _id inside final_summary
      ),
      required: false,
    },
  },
  {
    timestamps: true,
  }
);


export default mongoose.models.FeedbackTask ||
  mongoose.model<IFeedbackTask>("FeedbackTask", FeedbackTaskSchema);
