import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'Citizen' | 'Volunteer' | 'Authority'| 'Admin';
  age: number;
  phone: string;
  location?: string;
  department?: string;
  employeeNumber?: string;
  volunteer_points?: number;
  reported_issues?: mongoose.Types.ObjectId[];
  resolved_issues?: mongoose.Types.ObjectId[];
  notifications?: mongoose.Types.ObjectId[];
  created_at: Date;
  last_login?: Date;
  status: 'active' | 'inactive' | 'suspended';
  profile_image?: string;
  preferences?: {
    notification_email: boolean;
    notification_sms: boolean;
    notification_push: boolean;
  };
}

interface ValidationProps {
    value: string;
  }

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8
  },
  role: {
    type: String,
    enum: ['Citizen', 'Volunteer', 'Authority','Admin'],
    required: [true, 'Please specify your role']
  },
  age: {
    type: Number,
    required: [true, 'Please provide your age'],
    min: [18, 'Must be at least 18 years old']
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number'],
    validate: {
      validator: function(v: string) {
        return /\d{10}/.test(v);
      },
      message: (props: ValidationProps) => `${props.value} is not a valid phone number!`
    }
  },
  // Optional fields based on role
  location: {
    type: String,
    required: function(this: IUser) {
      return this.role === 'Volunteer';
    }
  },
  department: {
    type: String,
    required: function(this: IUser) {
      return this.role === 'Authority';
    }
  },
  employeeNumber: {
    type: String,
    required: function(this: IUser) {
      return this.role === 'Authority';
    }
  },
  // Additional fields
  volunteer_points: {
    type: Number,
    default: 0
  },
  reported_issues: [{
    type: Schema.Types.ObjectId,
    ref: 'Issue'
  }],
  resolved_issues: [{
    type: Schema.Types.ObjectId,
    ref: 'Issue'
  }],
  notifications: [{
    type: Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  profile_image: {
    type: String
  },
  preferences: {
    notification_email: {
      type: Boolean,
      default: true
    },
    notification_sms: {
      type: Boolean,
      default: false
    },
    notification_push: {
      type: Boolean,
      default: true
    }
  }
});

// Add indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

// Add a pre-save hook to hash password (we'll implement this later with bcrypt)
UserSchema.pre('save', function(next) {
  // Password hashing logic will go here
  next();
});

// Add instance methods (we'll add more as needed)
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);