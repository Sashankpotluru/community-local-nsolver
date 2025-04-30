import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  issue: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  text: string;
  created_at: Date;
  updated_at: Date;
}

const CommentSchema: Schema = new Schema({
  issue: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);