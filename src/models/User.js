import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  socialOnly: { type: Boolean, default: false },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String },
  location: { type: String },
  avatarUrl: { type: String },
});

userSchema.pre('save', async function () {
  if (this.password !== '') {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

const User = mongoose.model('User', userSchema);

export default User;
