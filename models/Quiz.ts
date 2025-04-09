import mongoose, { Schema, Document } from "mongoose";


export interface ISentimentData {
  id: string;
  sentiment: string; // e.g., "Positive", "Neutral", "Negative"
}

export interface IFinalSummary {
  message: string;
  insights: string[];
  sentiment_data: ISentimentData[];
  generated_at: string;
}

// Interface for individual questions
interface IQuestion {
  question_text: string;
  options: string[];
  correct_answer: string;
}

// Interface for response records stored in the Quiz
interface IResponseRecord {
  responseid: mongoose.Types.ObjectId;
  email: string;
  score: number;
  submitted_at: Date;
}

// Quiz Interface
export interface IQuiz extends Document {
  quiz_code: string;
  title: string;
  num_questions: number;
  created_by_id: mongoose.Types.ObjectId; // Faculty ID
  created_by_username: string; // Faculty username
  course_id: mongoose.Types.ObjectId; // Course ID
  course_name: string; // Course name
  active: boolean;
  time: number; // Duration in minutes
  syllabus?: string; // Course topics covered
  started_on?: Date;
  ended_on?: Date;
  responses: IResponseRecord[]; // Changed from ObjectId[] to object array
  questions: IQuestion[];
  createdAt: Date;
  updatedAt: Date;
  final_summary?: IFinalSummary;
}

// Quiz Schema
const QuizSchema: Schema = new Schema(
  {
    quiz_code: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    num_questions: { type: Number, required: true },
    created_by_id: {
      type: Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    created_by_username: { type: String, required: true },
    course_id: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    course_name: { type: String, required: true },
    active: { type: Boolean, default: false },
    time: { type: Number, required: true }, // Quiz duration
    syllabus: { type: String },
    started_on: { type: Date },
    ended_on: { type: Date },
    responses: [
      {
        responseid: { type: Schema.Types.ObjectId, ref: "QuizResponse" },
        email: { type: String },
        score: { type: Number },
        submitted_at: { type: Date },
      },
    ],
    questions: [
      {
        question_text: { type: String, required: true },
        options: [{ type: String, required: true }],
        correct_answer: { type: String, required: true },
      },
    ],
    final_summary: {
      type: new Schema(
        {
          message: { type: String, required: true },
          insights: [{ type: String }],
          sentiment_data: [
            {
              id: { type: String },
              sentiment: { type: String }
            },
          ],
          generated_at: { type: Date },
        },
        { _id: false } // prevent nested _id inside final_summary
      ),
      required: false,
    },
  },
  { timestamps: true }
);

const Quiz = mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);
export default Quiz;