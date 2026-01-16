require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Announcement = require('./models/Announcement');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mlmver2', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Announcement.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@mlmver2.com',
      password: 'admin123',
      role: 'admin',
      status: 'active',
      profile: {
        firstName: 'System',
        lastName: 'Administrator',
        phone: '1234567890'
      }
    });

    console.log('Created admin user:', admin.email);

    // Create sample users
    const user1 = await User.create({
      username: 'manager1',
      email: 'manager1@mlmver2.com',
      password: 'manager123',
      role: 'manager',
      status: 'active',
      profile: {
        firstName: 'John',
        lastName: 'Manager',
        phone: '1234567891'
      }
    });

    const user2 = await User.create({
      username: 'distributor1',
      email: 'distributor1@mlmver2.com',
      password: 'dist123',
      role: 'distributor',
      status: 'active',
      sponsor: admin._id,
      genealogy: {
        upline: admin._id,
        level: 1
      },
      profile: {
        firstName: 'Jane',
        lastName: 'Distributor',
        phone: '1234567892'
      }
    });

    const user3 = await User.create({
      username: 'member1',
      email: 'member1@mlmver2.com',
      password: 'member123',
      role: 'member',
      status: 'active',
      sponsor: user2._id,
      genealogy: {
        upline: user2._id,
        level: 2
      },
      profile: {
        firstName: 'Bob',
        lastName: 'Member',
        phone: '1234567893'
      }
    });

    console.log('Created sample users');

    // Create sample products
    const products = await Product.insertMany([
      {
        name: 'Starter Package',
        description: 'Essential starter package for new members',
        price: 99.99,
        points: 100,
        category: 'package',
        stock: 100
      },
      {
        name: 'Premium Package',
        description: 'Premium package with advanced benefits',
        price: 299.99,
        points: 300,
        category: 'package',
        stock: 50
      },
      {
        name: 'Health Supplement A',
        description: 'High-quality health supplement',
        price: 49.99,
        points: 50,
        category: 'product',
        stock: 200
      },
      {
        name: 'Skincare Product B',
        description: 'Premium skincare solution',
        price: 79.99,
        points: 80,
        category: 'product',
        stock: 150
      },
      {
        name: 'Wellness Kit',
        description: 'Complete wellness kit',
        price: 149.99,
        points: 150,
        category: 'product',
        stock: 75
      }
    ]);

    console.log('Created sample products');

    // Create sample announcement
    const announcement = await Announcement.create({
      title: 'Welcome to MLMVER2',
      content: 'Welcome to the Dermasan MLMVER2 platform! This is your gateway to success in multi-level marketing. Explore all features and start building your network today.',
      author: admin._id,
      category: 'general',
      isPinned: true
    });

    console.log('Created welcome announcement');

    console.log('\n=== Seed Data Summary ===');
    console.log('Admin credentials:');
    console.log('  Email: admin@mlmver2.com');
    console.log('  Password: admin123');
    console.log('\nManager credentials:');
    console.log('  Email: manager1@mlmver2.com');
    console.log('  Password: manager123');
    console.log('\nDistributor credentials:');
    console.log('  Email: distributor1@mlmver2.com');
    console.log('  Password: dist123');
    console.log('\nMember credentials:');
    console.log('  Email: member1@mlmver2.com');
    console.log('  Password: member123');
    console.log('\nProducts created:', products.length);
    console.log('========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
