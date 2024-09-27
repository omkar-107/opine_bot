import mongoose, { Schema, Document } from "mongoose";

interface IStudent extends Document {
  username: string;
  password: string;
  branch: string;
  year: number;
  student_courses: string[];
}

const StudentSchema: Schema = new Schema({
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
});

export default mongoose.models.Student ||
  mongoose.model<IStudent>("Student", StudentSchema);
