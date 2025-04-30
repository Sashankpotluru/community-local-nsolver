// scripts/create-admin.ts

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// MongoDB connection function
async function connectToDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// User interface
interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'Citizen' | 'Volunteer' | 'Authority' | 'Admin';
  age: number;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: Date;
  preferences: {
    notification_email: boolean;
    notification_sms: boolean;
    notification_push: boolean;
  };
}

// User schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Citizen', 'Volunteer', 'Authority', 'Admin'],
    required: true 
  },
  age: { type: Number, required: true },
  phone: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended'],
    default: 'active' 
  },
  created_at: { type: Date, default: Date.now },
  preferences: {
    notification_email: { type: Boolean, default: true },
    notification_sms: { type: Boolean, default: false },
    notification_push: { type: Boolean, default: true }
  }
});

// Get the User model
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
  try {
    await connectToDatabase();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'Admin',
      age: 25,
      phone: '1234567890',
      status: 'active',
      created_at: new Date(),
      preferences: {
        notification_email: true,
        notification_sms: false,
        notification_push: true
      }
    });

    console.log('Admin user created successfully:', {
      name: admin.name,
      email: admin.email,
      role: admin.role
    });
    
    console.log('\nAdmin Login Credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the function
createAdmin();