import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true, 
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'admin','faculty'], 
    default: 'student',
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
