import mongoose from "mongoose";
import MongooseDelete from "mongoose-delete";

const UserSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  emailInstitucional: {type: String, required: true, unique: true},
  passwordHash: {type: String, required: true},
  role: {type: String, enum: ['user', 'admin', 'moderator'], default: 'user'},
  tipo: {type: String, enum: ['PF', 'PJ'], default: 'PF'},
  isActive: {type: Boolean, default: true},
  lastLogin: {type: Date, default: null},
  profileId: {type: mongoose.Schema.Types.ObjectId, ref: 'profile', default: null},
  resetPasswordToken: {type: String, default: null},
  resetPasswordExpires: {type: Date, default: null}
}, {
  timestamps: true,
  versionKey: false
});

UserSchema.plugin(MongooseDelete, { overrideMethods: 'all', deletedAt: true});

export const User = mongoose.model('user', UserSchema);