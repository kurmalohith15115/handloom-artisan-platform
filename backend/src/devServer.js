const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const { validateEnv } = require('./config/env');
const User = require('./models/User');
const ArtisanProfile = require('./models/ArtisanProfile');
const Category = require('./models/Category');
const Product = require('./models/Product');

const app = require('./app');

async function startDevServer() {
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('\n[DEV-SERVER] No external MONGODB_URI detected in .env.');
    console.log('[DEV-SERVER] Initializing embedded persistent MongoDB instance for local testing...');
    const mongoServer = await MongoMemoryServer.create({
      instance: { port: 27017, dbName: 'handloom_artisan_platform' },
    });
    uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;
  }

  // Connect to database
  await connectDB(uri);

  // Auto-seed initial demonstration categories and master artisans if database is fresh
  const catCount = await Category.countDocuments();
  if (catCount === 0) {
    console.log('[DEV-SERVER] Seeding authentic GI craft categories and master artisans...');

    // Categories
    const categories = await Category.create([
      {
        name: 'Pochampally Ikat',
        slug: 'pochampally-ikat',
        description: 'Traditional geometric double ikat resist-dye weaving heritage from Telangana.',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        craftType: 'Double Ikat Weaving',
        featured: true,
      },
      {
        name: 'Kalamkari Art & Handloom',
        slug: 'kalamkari-art-handloom',
        description: 'Organic natural dye hand-painted and block-printed heritage from Srikalahasti.',
        image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
        craftType: 'Natural Dye Painting & Block Print',
        featured: true,
      },
      {
        name: 'Mangalagiri Cotton & Silk',
        slug: 'mangalagiri-cotton-silk',
        description: 'Crisp counts and signature Nizam borders woven on pit looms in Guntur district.',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        craftType: 'Pit Loom Nizam Border Weaving',
        featured: true,
      },
      {
        name: 'Gadwal Handwoven Sarees',
        slug: 'gadwal-handwoven-sarees',
        description: 'Distinctive cotton body joined seamlessly with pure silk borders using kuttu technique.',
        image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
        craftType: 'Kuttu Interlocked Border Weaving',
        featured: true,
      },
    ]);

    // Master Artisan User & Profile
    const artisanUser = await User.create({
      name: 'Narasimha Chary',
      email: 'narasimha@artisan-demo.org',
      password: 'ArtisanPassword123!',
      phone: '+91 98480 12345',
      role: 'artisan',
      languagePreference: 'en',
      isActive: true,
    });

    const artisanProfile = await ArtisanProfile.create({
      user: artisanUser._id,
      craftType: 'Pochampally Ikat',
      craftStory: 'Three generations of master weavers from Bhoodan Pochampally village, dedicated to preserving authentic natural indigo and telia rumal geometric patterns on pedal looms.',
      experienceYears: 28,
      location: {
        village: 'Bhoodan Pochampally',
        district: 'Yadadri Bhuvanagiri',
        state: 'Telangana',
        country: 'India',
        postalCode: '508284',
      },
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      applicationStatus: 'approved',
      rating: 4.9,
      totalReviews: 24,
    });

    // Sample Products
    await Product.create([
      {
        title: 'Pure Silk Pochampally Ikat Saree in Crimson & Indigo',
        description: 'Authentic double-ikat handwoven pure silk saree featuring geometric diamond motifs in deep crimson and indigo.',
        category: categories[0]._id,
        artisan: artisanProfile._id,
        price: 8499,
        originalPrice: 9999,
        stock: 6,
        material: '100% Pure Mulberry Silk (Silk Mark Certified)',
        dimensions: '6.25 meters with unstitched blouse piece',
        craftOrigin: 'Pochampally, Telangana',
        images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'],
        featured: true,
        tags: ['silk mark', 'pochampally', 'double ikat'],
        isPublished: true,
        isApprovedByAdmin: true,
      },
      {
        title: 'Hand-Painted Srikalahasti Tree of Life Kalamkari Dupatta',
        description: 'Exquisite hand-drawn Tree of Life motif rendered with natural fermented vegetable dyes on handspun fabric using bamboo pens.',
        category: categories[1]._id,
        artisan: artisanProfile._id,
        price: 2899,
        originalPrice: 3499,
        stock: 10,
        material: 'Pure Handspun Chanderi Cotton-Silk',
        dimensions: '2.5 meters length, 36 inches width',
        craftOrigin: 'Srikalahasti, Andhra Pradesh',
        images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'],
        featured: true,
        tags: ['natural dyes', 'kalamkari', 'organic'],
        isPublished: true,
        isApprovedByAdmin: true,
      },
    ]);

    // Bootstrap Administrator
    await User.create({
      name: 'Platform Administrator',
      email: 'admin@handloom-artisan.org',
      password: 'AdminPassword123!',
      role: 'admin',
      isActive: true,
    });

    console.log('[DEV-SERVER] Seeding completed successfully.');
  }

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log('\n================================================================');
    console.log('  HANDLOOM ARTISAN SUPPORT PLATFORM — LOCAL DEVELOPMENT SERVER');
    console.log('================================================================');
    console.log(`  Backend API:  http://localhost:${PORT}/api`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log('');
    console.log('  PRE-CONFIGURED TEST CREDENTIALS:');
    console.log('  1. Administrator Portal (/admin/login):');
    console.log('     Email    : admin@handloom-artisan.org');
    console.log('     Password : AdminPassword123!');
    console.log('');
    console.log('  2. Artisan Partner Portal (/artisan/login):');
    console.log('     Email    : narasimha@artisan-demo.org');
    console.log('     Password : ArtisanPassword123!');
    console.log('');
    console.log('  3. Customer Portal (/login):');
    console.log('     Register freely at /register or use any registered email');
    console.log('================================================================\n');
  });
}

startDevServer().catch((err) => {
  console.error('[DEV-SERVER-FATAL]', err);
  process.exit(1);
});
