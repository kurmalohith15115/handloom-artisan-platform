const mongoose = require('mongoose');
const { validateEnv } = require('../config/env');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Ensure env loaded
validateEnv();

const bootstrapAdmin = async () => {
  // Parse command line arguments or fallback to env vars
  const args = process.argv.slice(2);
  const getArg = (key) => {
    const idx = args.indexOf(`--${key}`);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
  };

  const name = getArg('name') || process.env.ADMIN_NAME || 'Platform Administrator';
  const email = (getArg('email') || process.env.ADMIN_EMAIL || 'admin@handloom-artisan.org').toLowerCase().trim();
  const password = getArg('password') || process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error('\n[BOOTSTRAP-ERROR] Admin password must be provided via --password argument or ADMIN_PASSWORD environment variable.');
    console.error('Example usage: npm run bootstrap:admin -- --name "Master Admin" --email "admin@handloom.org" --password "YourStrongPassword123!"\n');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('[BOOTSTRAP-ERROR] Admin password must be at least 8 characters long for security.');
    process.exit(1);
  }

  try {
    await connectDB();

    let admin = await User.findOne({ email }).select('+password');

    if (admin) {
      if (admin.role !== 'admin') {
        admin.role = 'admin';
      }
      admin.name = name;
      admin.password = password; // Will trigger bcrypt pre-save hook
      admin.isActive = true;
      await admin.save();

      console.log(`\n[BOOTSTRAP-SUCCESS] Administrator account updated successfully.`);
      console.log(`Email : ${email}`);
      console.log(`Role  : admin\n`);
    } else {
      admin = await User.create({
        name,
        email,
        password,
        role: 'admin',
        isActive: true,
      });

      console.log(`\n[BOOTSTRAP-SUCCESS] Initial Administrator created successfully.`);
      console.log(`Email : ${email}`);
      console.log(`Role  : admin\n`);
    }

    await AuditLog.create({
      actor: admin._id,
      actorEmail: admin.email,
      actorRole: 'admin',
      action: 'ADMIN_BOOTSTRAP_INITIALIZED',
      targetModel: 'User',
      targetId: admin._id.toString(),
      details: { email, initializedVia: 'CLI_BOOTSTRAP_SCRIPT' },
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[BOOTSTRAP-FATAL] Administrator setup failed:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

bootstrapAdmin();
