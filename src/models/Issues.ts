
// src/models/Issues.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IIssue extends Document {
  title: string;
  description: string;
  photo?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  category: mongoose.Types.ObjectId;
  status: 'Reported' | 'In Progress' | 'Resolved';
  upvotes: number;
  reported_by: mongoose.Types.ObjectId;
  assigned_to?: mongoose.Types.ObjectId;
  comments: mongoose.Types.ObjectId[];
  created_at: Date;
  updated_at: Date;
}

const IssueSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  photo: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  status: { type: String, enum: ['Reported', 'In Progress', 'Resolved'], default: 'Reported' },
  upvotes: { type: Number, default: 0 },
  reported_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assigned_to: { type: Schema.Types.ObjectId, ref: 'User' },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  resolved_at: { type: Date },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

IssueSchema.index({ location: '2dsphere' });

IssueSchema.index({ status: 1 });            // Filter by status
IssueSchema.index({ resolved_at: -1 });      // Sort by resolution date descending
IssueSchema.index({ category: 1 });          // Filter by category
IssueSchema.index({ assigned_to: 1 });       // Filter by assigned user

// Check if the model exists before creating a new one
const Issue = mongoose.models.Issue || mongoose.model<IIssue>('Issue', IssueSchema);

export default Issue;