import mongoose, { Schema, Document } from "mongoose";

interface ICourse extends Document {
  id_: string;
  title: string;
  syllabus: string;
  faculty: string[];
  feedbacks: string[];
}

const CourseSchema: Schema = new Schema({
  id_: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  syllabus: {
    type: String,
    required: true,
  },
  faculty: {
    type: [String],
    required: true,
  },
  feedbacks: {
    type: [String],
    required: true,
  },
});

export default mongoose.models.Course ||
  mongoose.model<ICourse>("Course", CourseSchema);
