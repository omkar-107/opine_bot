import mongoose, { Schema, Document } from "mongoose";

interface IFaculty extends Document {
  username: string;
  password: string;
  faculty_courses: string[];
  department: string;
}

const FacultySchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  faculty_courses: {
    type: [String],
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
});

export default mongoose.models.Faculty ||
  mongoose.model<IFaculty>("Faculty", FacultySchema);
