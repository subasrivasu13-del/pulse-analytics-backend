const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./src/models/User');
const Analytics = require('./src/models/Analytics');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/analytics_db';

const routes = [
  '/',
  '/dashboard',
  '/analytics',
  '/profile',
  '/settings',
  '/reports',
  '/notifications'
];

const ips = [
  '192.168.1.1',
  '192.168.1.45',
  '82.165.12.98',
  '203.0.113.195',
  '198.51.100.4',
  '12.34.56.78',
  '98.76.54.32',
  '172.56.21.9'
];

const mockUsersData = [
  {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    provider: 'google',
    profilePic: 'https://api.dicebear.com/7.x/adventurer/svg?seed=John'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@gmail.com',
    provider: 'google',
    profilePic: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jane'
  },
  {
    name: 'Developer Sandbox',
    email: 'sandbox@pulseanalytics.dev',
    provider: 'mock',
    profilePic: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sandbox'
  }
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB. Clearing existing collections...');

    await User.deleteMany({});
    await Analytics.deleteMany({});

    console.log('Creating users...');
    const users = await User.insertMany(mockUsersData);
    console.log(`Created ${users.length} users.`);

    console.log('Generating historical logs for the last 7 days...');
    const logs = [];

    // Session IDs mapped to users
    const sessions = {
      'sess_user_0': 'sess_session_1a2b3c',
      'sess_user_1': 'sess_session_4d5e6f',
      'sess_user_2': 'sess_session_7g8h9i',
      'sess_guest': 'sess_session_guest99'
    };

    // Populate data for the last 7 days
    for (let i = 7; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Number of logs for this day
      const dailyCount = Math.floor(Math.random() * 20) + 15; // 15 to 34 logs per day

      for (let j = 0; j < dailyCount; j++) {
        // Random hour & minute
        const timestamp = new Date(date);
        timestamp.setHours(Math.floor(Math.random() * 24));
        timestamp.setMinutes(Math.floor(Math.random() * 60));
        timestamp.setSeconds(Math.floor(Math.random() * 60));

        // Choose user (75% probability of being registered, 25% anonymous/guest)
        const isRegistered = Math.random() > 0.25;
        let selectedUser = null;
        let sessionId = '';

        if (isRegistered) {
          const userIdx = Math.floor(Math.random() * users.length);
          selectedUser = users[userIdx];
          sessionId = sessions[`sess_user_${userIdx}`] || `sess_user_${userIdx}_${Math.floor(Math.random() * 1000)}`;
        } else {
          sessionId = sessions.sess_guest || `sess_guest_${Math.floor(Math.random() * 1000)}`;
        }

        // Random route
        const route = routes[Math.floor(Math.random() * routes.length)];

        // Random IP Address
        const ipAddress = ips[Math.floor(Math.random() * ips.length)];

        logs.push({
          userId: selectedUser ? selectedUser._id : null,
          route,
          sessionId,
          ipAddress,
          timestamp
        });
      }
    }

    console.log(`Inserting ${logs.length} activity log documents...`);
    await Analytics.insertMany(logs);
    console.log('Database seeded successfully!');

    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
