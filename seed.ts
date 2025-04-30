
import mongoose from 'mongoose';
import User from '@/models/User';
import Issue from '@/models/Issues';
import Comment from '@/models/Comments';
import Notification from '@/models/Notification';
import Category from '@/models/Category';
import { faker,en } from '@faker-js/faker';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });




const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sashankpotluri1:x1Svwofi0iZx2iJ3@740project.clrllad.mongodb.net/?retryWrites=true&w=majority&appName=740Project';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // 1. Clear all data (except categories)
  await Issue.deleteMany({});
  await Comment.deleteMany({});
  await Notification.deleteMany({});
  await User.deleteMany({});

  // Function to generate a valid 10-digit phone number
  const generatePhoneNumber = () => {
    return '9' + faker.string.numeric(9); // Creates a 10-digit number starting with 9
  };

  // 2. Seed Users
  const users = [];
  for (let i = 0; i < 10; i++) {
    users.push(new User({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: 'password123',
      role: 'Citizen',
      age: faker.number.int({ min: 18, max: 60 }),
      phone: generatePhoneNumber(),
      created_at: faker.date.past(),
      status: 'active',
    }));
  }
  for (let i = 0; i < 5; i++) {
    users.push(new User({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: 'password123',
      role: 'Volunteer',
      age: faker.number.int({ min: 18, max: 60 }),
      phone: generatePhoneNumber(),
      location: faker.location.city(),
      created_at: faker.date.past(),
      status: 'active',
    }));
  }
  for (let i = 0; i < 4; i++) {
    users.push(new User({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: 'password123',
      role: 'Authority',
      age: faker.number.int({ min: 25, max: 60 }),
      phone: generatePhoneNumber(),
      department: faker.commerce.department(),
      employeeNumber: faker.string.uuid(),
      created_at: faker.date.past(),
      status: 'active',
    }));
  }

  await User.insertMany(users);
  const allUsers = await User.find();
  const allCitizens = allUsers.filter(u => u.role === 'Citizen');
  const allVolunteers = allUsers.filter(u => u.role === 'Volunteer');
  const allAuthorities = allUsers.filter(u => u.role === 'Authority');

  // 3. Seed Issues
  const allCategories = await Category.find();
  const issues = [];
  for (let i = 0; i < 20; i++) {
    const citizen = faker.helpers.arrayElement(allCitizens);
    const category = faker.helpers.arrayElement(allCategories);
    issues.push(new Issue({
      title: faker.lorem.words(3),
      description: faker.lorem.sentences(2),
      photo: '',
      location: {
        type: 'Point',
        coordinates: [
          faker.location.longitude(),
          faker.location.latitude()
        ]
      },
      category: category._id,
      status: faker.helpers.arrayElement(['Reported', 'In Progress', 'Resolved']),
      upvotes: faker.number.int({ min: 0, max: 50 }),
      reported_by: citizen._id,
      assigned_to: faker.helpers.arrayElement([...allVolunteers, ...allAuthorities])._id,
      comments: [],
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
    }));
  }
  await Issue.insertMany(issues);
  const allIssues = await Issue.find();

  // 4. Seed Comments
  const comments = [];
  for (let i = 0; i < 20; i++) {
    comments.push(new Comment({
      issue: faker.helpers.arrayElement(allIssues)._id,
      user: faker.helpers.arrayElement(allUsers)._id,
      text: faker.lorem.sentence(),
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
    }));
  }
  await Comment.insertMany(comments);

  // 5. Seed Notifications
  const notifications = [];
  for (let i = 0; i < 20; i++) {
    notifications.push(new Notification({
      user: faker.helpers.arrayElement(allUsers)._id,
      issue: faker.helpers.arrayElement(allIssues)._id,
      message: faker.lorem.sentence(),
      read: faker.datatype.boolean(),
      created_at: faker.date.recent(),
    }));
  }
  await Notification.insertMany(notifications);

  console.log('Database seeded!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});