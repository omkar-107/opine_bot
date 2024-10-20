import mongoose, { Schema, Document } from "mongoose";

interface IStudent extends Document {
  email: string;
  username: string;
  password: string;
  branch: string;
  year: number;
  student_courses: string[];
  semester: number;
}

const StudentSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  student_courses: {
    type: [String],
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
});

export default mongoose.models.Student ||
  mongoose.model<IStudent>("Student", StudentSchema);
