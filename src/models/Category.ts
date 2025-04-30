// models/Category.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  icon?: string;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String },
});

// Export the model directly
const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
export default Category;