import mongoose, { Schema, Document } from "mongoose";

// Interface for individual answers
interface IAnswer {
  question_text: string;
  selected_option: string;
  correct?: boolean; // Indicates if the answer was correct
}

// QuizResponse Interface
export interface IQuizResponse extends Document {
  quiz_id: mongoose.Types.ObjectId;
  student_id?: mongoose.Types.ObjectId; // Optional if students are registered
  email: string;
  answers: IAnswer[];
  feedback?: string;
  score?: number; // Optional: Quiz score based on correct answers
  submitted_at: Date;
  createdAt: Date;
  updatedAt: Date;
}

// QuizResponse Schema
const QuizResponseSchema: Schema = new Schema(
  {
    quiz_id: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    student_id: { type: Schema.Types.ObjectId, ref: "Student" },
    email: { type: String, required: true },
    answers: [
      {
        question_text: { type: String, required: true },
        selected_option: { type: String, required: true },
        correct: { type: Boolean },
      },
    ],
    feedback: { type: String },
    score: { type: Number, default: 0 },
    submitted_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const QuizResponse =
  mongoose.models.QuizResponse ||
  mongoose.model<IQuizResponse>("QuizResponse", QuizResponseSchema);

export default QuizResponse;
