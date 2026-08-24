require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const createAdminIfMissing = async () => {
  try {
    await connectDB();

    const adminEmail = 'admin@nshagro.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      console.log(`Admin user with email ${adminEmail} already exists.`);
      // Just in case, update the password to the default
      adminExists.password = 'adminpassword123';
      await adminExists.save();
      console.log('Password successfully reset to default: adminpassword123');
    } else {
      await User.create({
        name: 'NSH Agro Admin',
        email: adminEmail,
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
      console.log(`Successfully created Admin account!`);
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: adminpassword123`);
    }
    process.exit(0);
  } catch (error) {
    console.error(`Error managing admin user: ${error.message}`);
    process.exit(1);
  }
};

createAdminIfMissing();
