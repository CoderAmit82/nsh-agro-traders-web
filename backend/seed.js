require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Payment = require('./models/Payment');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('Clearing database tables...');
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Payment.deleteMany();
    await Message.deleteMany();
    await Notification.deleteMany();

    console.log('Creating Admin and Farmer accounts...');

    // Create Admin User
    const adminUser = await User.create({
      name: 'NSH Agro Admin',
      email: 'admin@nshagro.com',
      password: 'adminpassword123',
      mobile: '+919876543210',
      address: {
        street: 'Admin Office, Agro Market Road',
        city: 'Guntur',
        state: 'Andhra Pradesh',
        zip: '522001'
      },
      role: 'admin'
    });

    // Create Farmer User
    const farmerUser = await User.create({
      name: 'Ramesh Kumar',
      email: 'farmer@gmail.com',
      password: 'farmerpassword123',
      mobile: '+919876543222',
      address: {
        street: 'Flat 12, Village Rampur',
        city: 'Bhatinda',
        state: 'Punjab',
        zip: '151001'
      },
      farmDetails: {
        sizeInAcres: 8,
        soilType: 'Loamy Clay',
        primaryCrops: 'Wheat, Rice, Cotton'
      },
      role: 'farmer'
    });

    console.log('Accounts created successfully.');
    console.log('Inserting mock agricultural products...');

    const products = [
      {
        name: 'EcoShield Bio-Pesticide 1L',
        category: 'Pesticides',
        price: 850,
        discount: 10,
        description: 'Organic neem-based bio-pesticide designed to control sucking pests, caterpillars, and mites. Formulated with cold-pressed pure neem oil. Completely environment-friendly.',
        usageDetails: 'Mix 5-10 ml of EcoShield Bio-Pesticide per Litre of clean water. Spray thoroughly on the leaves during early morning or late evening hours.',
        stock: 50,
        images: [],
        manufacturingDetails: {
          manufacturer: 'EcoOrganic Ltd.',
          expiryDate: new Date('2028-12-31'),
          batchNumber: 'ESBP-2026-098'
        }
      },
      {
        name: 'Force-Multiplier Insecticide 500ml',
        category: 'Insecticides',
        price: 600,
        discount: 15,
        description: 'Broad-spectrum chemical insecticide for control of aphids, whiteflies, thrips, and leafminers in vegetables and field crops.',
        usageDetails: 'Dilute 1.5 ml in 1 Litre of water and apply uniformly as a foliar spray at the first sign of insect infestation.',
        stock: 12,
        images: [],
        manufacturingDetails: {
          manufacturer: 'AgroChem Solutions Corp',
          expiryDate: new Date('2028-05-15'),
          batchNumber: 'FMIC-7742'
        }
      },
      {
        name: 'WeedOut Selective Herbicide 1L',
        category: 'Herbicides',
        price: 1200,
        discount: 5,
        description: 'Post-emergence selective herbicide for controlling broad-leaved weeds in paddy, wheat, and sugarcane. Minimizes hand-weeding labor cost.',
        usageDetails: 'Apply 1 Litre per acre diluted in 150-200 Litres of water. Spray using a flat-fan nozzle when weeds are at 2-4 leaf stage.',
        stock: 35,
        images: [],
        manufacturingDetails: {
          manufacturer: 'SafeCrop Crop Protection',
          expiryDate: new Date('2027-10-20'),
          batchNumber: 'WOHB-9981'
        }
      },
      {
        name: 'CropMax NPK 19-19-19 Fertilizer 25kg',
        category: 'Fertilizers',
        price: 2400,
        discount: 8,
        description: '100% water-soluble fertilizer containing all essential macro-nutrients in equal proportion. Boosts vegetative growth and root system.',
        usageDetails: 'For drip irrigation, apply 5 kg per acre. For foliar application, dissolve 10-15 g per Litre of water and spray at vegetative stage.',
        stock: 80,
        images: [],
        manufacturingDetails: {
          manufacturer: 'Bharat Fertilizers Joint Venture',
          expiryDate: new Date('2029-01-01'),
          batchNumber: 'CMPK-1919-X8'
        }
      },
      {
        name: 'Premium Potash Bio-Fertilizer 5kg',
        category: 'Fertilizers',
        price: 450,
        discount: 20,
        description: 'Bio-potassium mobilizing bacteria fertilizer. Enhances grain filling, fruit size, sweetness, and drought tolerance in crops.',
        usageDetails: 'Mix 5 kg Potash with 100 kg farmyard manure or soil per acre. Apply near root zones during planting or pre-flowering stage.',
        stock: 3, // Low stock for dashboard stock alert check
        images: [],
        manufacturingDetails: {
          manufacturer: 'OrganicRoots BioLabs',
          expiryDate: new Date('2027-08-30'),
          batchNumber: 'PPBF-344'
        }
      },
      {
        name: 'Heavy Duty Soil Probe Sampler',
        category: 'Farming Tools',
        price: 1800,
        discount: 0,
        description: 'Stainless steel core soil sampler. Designed to easily extract core soil samples up to 12 inches deep for laboratory testing.',
        usageDetails: 'Push the probe vertically into the soil up to the desired depth. Twist slightly and extract the core sample into a clean soil bag.',
        stock: 15,
        images: [],
        manufacturingDetails: {
          manufacturer: 'AgriTools Tech India',
          expiryDate: null,
          batchNumber: 'ATTS-2026'
        }
      },
      {
        name: 'Knapsack Manual Battery Sprayer 16L',
        category: 'Farming Tools',
        price: 3500,
        discount: 12,
        description: '2-in-1 dual operation knapsack sprayer. Features both battery-powered automatic spray and manual hand pump backup. Durable build.',
        usageDetails: 'Charge the battery for 6 hours. Fill the 16L tank with diluted fertilizer/pesticide, strap to back, switch on power, and press lever.',
        stock: 20,
        images: [],
        manufacturingDetails: {
          manufacturer: 'SprayerMax Innovations',
          expiryDate: null,
          batchNumber: 'SMBS-509'
        }
      }
    ];

    await Product.create(products);
    console.log(`Mock products inserted successfully: ${products.length} products.`);

    console.log('Seeding process complete! You can run the server now.');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
