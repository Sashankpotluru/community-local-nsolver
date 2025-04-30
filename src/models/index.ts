// models/index.ts
import mongoose from 'mongoose';
import './User';  // Just import the files
import './Category';
import './Comments';
import './Issues';

export function registerModels() {
  // The models will be registered automatically when the files are imported
  // No need to manually register them again
  console.log('Available models:', mongoose.modelNames());
  return;
}