import mongoose, { Schema, Document } from "mongoose";

interface IAdmin extends Document {
  id_: string;
  username: string;
  password: string;
}

const AdminSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export default mongoose.models.Admin ||
  mongoose.model<IAdmin>("Admin", AdminSchema);
