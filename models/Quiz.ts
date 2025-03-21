import mongoose, { Schema, Document } from "mongoose";

// Interface for individual questions
interface IQuestion {
  question_text: string;
  options: string[];
  correct_answer: string;
}

// Quiz Interface
export interface IQuiz extends Document {
  quiz_code: string;
  title: string;
  num_questions: number;
  created_by: mongoose.Types.ObjectId; // Faculty ID
  course_id: mongoose.Types.ObjectId; // Course ID
  active: boolean;
  time: number; // Duration in minutes
  syllabus?: string; // Course topics covered
  started_on?: Date;
  ended_on?: Date;
  responses: mongoose.Types.ObjectId[]; // Array of QuizResponse IDs
  questions: IQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

// Quiz Schema
const QuizSchema: Schema = new Schema(
  {
    quiz_code: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    num_questions: { type: Number, required: true },
    created_by: { type: Schema.Types.ObjectId, ref: "Faculty", required: true },
    course_id: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    active: { type: Boolean, default: false },
    time: { type: Number, required: true }, // Quiz duration
    syllabus: { type: String },
    started_on: { type: Date },
    ended_on: { type: Date },
    responses: [{ type: Schema.Types.ObjectId, ref: "QuizResponse" }], // Tracks submitted responses
    questions: [
      {
        question_text: { type: String, required: true },
        options: [{ type: String, required: true }],
        correct_answer: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Quiz = mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);
export default Quiz;
