import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
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

// Category interface
interface ICategory {
  name: string;
  description?: string;
  icon?: string;
}

// Category schema
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String },
});

// Get the Category model
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

async function createInitialCategories() {
    try {
      await connectToDatabase();
    const categories = [
      {
        name: 'Potholes',
        description: 'Road surface damage and holes',
        icon: '🚗'
      },
      {
        name: 'Streetlights',
        description: 'Non-functioning or damaged streetlights',
        icon: '💡'
      },
      {
        name: 'Waste Management',
        description: 'Garbage collection and waste-related issues',
        icon: '🗑️'
      },
      {
        name: 'Parks & Recreation',
        description: 'Issues related to parks and recreational areas',
        icon: '🌳'
      },
      {
        name: 'Water Supply',
        description: 'Water-related issues including leaks and supply',
        icon: '💧'
      },
      {
        name: 'Traffic Signals',
        description: 'Malfunctioning traffic lights and signals',
        icon: '🚦'
      },
      {
        name: 'Sidewalk Issues',
        description: 'Damaged or blocked sidewalks and pedestrian paths',
        icon: '🚶'
      },
      {
        name: 'Graffiti',
        description: 'Unauthorized graffiti and vandalism',
        icon: '🎨'
      },
      {
        name: 'Noise Complaints',
        description: 'Excessive noise and disturbances',
        icon: '📢'
      },
      {
        name: 'Tree Issues',
        description: 'Fallen trees, dangerous branches, or tree maintenance',
        icon: '🌲'
      },
      {
        name: 'Public Transport',
        description: 'Issues with bus stops, stations, or public transport facilities',
        icon: '🚌'
      },
      {
        name: 'Road Signs',
        description: 'Missing, damaged, or unclear road signs',
        icon: '🚸'
      },
      {
        name: 'Drainage Issues',
        description: 'Blocked drains, flooding, or water drainage problems',
        icon: '🌊'
      },
      {
        name: 'Public Buildings',
        description: 'Issues with government buildings or public facilities',
        icon: '🏛️'
      },
      {
        name: 'Pest Control',
        description: 'Reports of pests or rodents in public areas',
        icon: '🐀'
      },
      {
        name: 'Air Quality',
        description: 'Air pollution and environmental concerns',
        icon: '💨'
      },
      {
        name: 'Parking Issues',
        description: 'Illegal parking or parking facility problems',
        icon: '🅿️'
      },
      {
        name: 'Public Safety',
        description: 'General safety concerns in public areas',
        icon: '🚨'
      },
      {
        name: 'Beach & Waterfront',
        description: 'Issues related to beaches and waterfront areas',
        icon: '🏖️'
      },
      {
        name: 'Construction',
        description: 'Unsafe or problematic construction sites',
        icon: '🏗️'
      },
      {
        name: 'Public Events',
        description: 'Issues related to public events or gatherings',
        icon: '🎪'
      },
      {
        name: 'School Zone',
        description: 'Issues affecting school zones and student safety',
        icon: '🏫'
      },
      {
        name: 'Accessibility',
        description: 'Issues affecting accessibility for disabled persons',
        icon: '♿'
      },
      {
        name: 'Animal Control',
        description: 'Stray animals or animal-related issues',
        icon: '🐕'
      },
      {
        name: 'Others',
        description: 'Other community issues not listed above',
        icon: '📝'
      }
    ];

    for (const category of categories) {
        const existingCategory = await Category.findOne({ name: category.name });
        if (!existingCategory) {
          await Category.create(category);
          console.log(`Created category: ${category.name}`);
        } else {
          console.log(`Category already exists: ${category.name}`);
        }
      }
  
      console.log('Initial categories setup completed');
      
      // List all categories
      const allCategories = await Category.find({});
      console.log('\nAll categories in database:');
      console.table(allCategories.map(cat => ({
        name: cat.name,
        description: cat.description,
        icon: cat.icon
      })));
  
    } catch (error) {
      console.error('Error creating categories:', error);
    } finally {
      await mongoose.disconnect();
      process.exit(0);
    }
  }
  
  // Run the function
  createInitialCategories();