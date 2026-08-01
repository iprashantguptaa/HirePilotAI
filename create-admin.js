// ============================================================================
// HirePilot AI - Create Admin User Script
// ============================================================================
// Run this script to create an admin user in the database
// Usage: node create-admin.js
// ============================================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/interview-ai';

// Admin user details (change these!)
const ADMIN_USER = {
    username: 'admin',
    email: 'admin@hirepilot.ai',
    password: 'Admin@123456',  // Change this to a strong password!
    role: 'admin',
    isActive: true,
    isEmailVerified: true
};

// User Schema (simplified)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ 
            $or: [
                { email: ADMIN_USER.email },
                { username: ADMIN_USER.username }
            ]
        });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Username: ${existingAdmin.username}`);
            console.log(`   Role: ${existingAdmin.role}`);
            
            if (existingAdmin.role !== 'admin') {
                console.log('\n🔧 Updating existing user to admin role...');
                existingAdmin.role = 'admin';
                existingAdmin.isEmailVerified = true;
                await existingAdmin.save();
                console.log('✅ User updated to admin role!');
            }
        } else {
            // Hash password
            console.log('🔐 Hashing password...');
            const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 10);

            // Create admin user
            console.log('👤 Creating admin user...');
            const admin = new User({
                ...ADMIN_USER,
                password: hashedPassword
            });

            await admin.save();
            console.log('✅ Admin user created successfully!');
        }

        console.log('\n📋 Admin Credentials:');
        console.log(`   Email: ${ADMIN_USER.email}`);
        console.log(`   Username: ${ADMIN_USER.username}`);
        console.log(`   Password: ${ADMIN_USER.password}`);
        console.log('\n🚀 You can now login at: http://localhost:5173/login');
        console.log('📊 Admin panel: http://localhost:5173/admin');
        console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

// Run the script
createAdminUser();
