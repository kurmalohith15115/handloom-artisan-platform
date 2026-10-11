const mongoose = require('mongoose');
const { validateEnv } = require('../config/env');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const ArtisanProfile = require('../models/ArtisanProfile');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

validateEnv();

const categoriesData = [
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
    description: 'Organic natural dye hand-painted and block-printed heritage from Srikalahasti & Machilipatnam.',
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
    description: 'Distinctive cotton body joined seamlessly with pure silk borders using kuttu interlocking technique.',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    craftType: 'Kuttu Interlocked Border Weaving',
    featured: true,
  },
  {
    name: 'Venkatagiri Jamdani',
    slug: 'venkatagiri-jamdani',
    description: 'Feather-light fine count cottons woven with delicate gold zari floral bootis.',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    craftType: 'Jamdani Extra-Weft Weaving',
    featured: false,
  },
  {
    name: 'Bidriware Handicraft',
    slug: 'bidriware-handicraft',
    description: 'Centuries-old metal inlay art using blackened zinc-copper alloy inlaid with pure silver wire.',
    image: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
    craftType: 'Silver Inlay Metalcraft',
    featured: true,
  },
];

const sampleArtisans = [
  {
    name: 'Narasimha Chary',
    email: 'narasimha.pochampally@artisan-demo.org',
    password: 'ArtisanDemoPassword123!',
    phone: '+91 98480 12345',
    craftType: 'Pochampally Ikat',
    craftStory: 'Three generations of master weavers from Bhoodan Pochampally, dedicated to preserving authentic natural indigo and telia rumal geometric patterns on pedal looms.',
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
  },
  {
    name: 'Lakshmi Devi',
    email: 'lakshmi.kalamkari@artisan-demo.org',
    password: 'ArtisanDemoPassword123!',
    phone: '+91 98490 67890',
    craftType: 'Kalamkari Art & Handloom',
    craftStory: 'Passionate folk artist practicing traditional Srikalahasti kalam (bamboo pen) painting with natural vegetable dyes, myrobalan mordants, and flowing organic motifs.',
    experienceYears: 19,
    location: {
      village: 'Srikalahasti',
      district: 'Tirupati',
      state: 'Andhra Pradesh',
      country: 'India',
      postalCode: '517644',
    },
    profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    applicationStatus: 'approved',
  },
  {
    name: 'Subba Rao',
    email: 'subbarao.mangalagiri@artisan-demo.org',
    password: 'ArtisanDemoPassword123!',
    phone: '+91 94400 54321',
    craftType: 'Mangalagiri Cotton & Silk',
    craftStory: 'Master pit-loom artisan hand-weaving 80s count combed cotton with pure zari Nizam borders along the Krishna river valley.',
    experienceYears: 24,
    location: {
      village: 'Mangalagiri',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      country: 'India',
      postalCode: '522503',
    },
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    applicationStatus: 'approved',
  },
];

const sampleProducts = [
  {
    title: '[Sample] Pure Silk Pochampally Ikat Saree in Crimson & Indigo',
    artisanEmail: 'narasimha.pochampally@artisan-demo.org',
    categorySlug: 'pochampally-ikat',
    price: 8499,
    originalPrice: 9999,
    stock: 6,
    material: '100% Pure Mulberry Silk (Silk Mark Certified)',
    dimensions: '6.25 meters (includes 80cm unstitched blouse piece)',
    craftOrigin: 'Pochampally, Yadadri Bhuvanagiri, Telangana',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    ],
    featured: true,
    tags: ['silk mark', 'pochampally', 'double ikat', 'handwoven'],
    description: 'Authentic double-ikat handwoven pure silk saree featuring geometric diamond motifs in deep crimson and indigo. Requires over 14 days of hand-tying and weaving on traditional pit looms.',
  },
  {
    title: '[Sample] Hand-Painted Srikalahasti Tree of Life Kalamkari Dupatta',
    artisanEmail: 'lakshmi.kalamkari@artisan-demo.org',
    categorySlug: 'kalamkari-art-handloom',
    price: 2899,
    originalPrice: 3499,
    stock: 10,
    material: 'Pure Handspun Chanderi Cotton-Silk',
    dimensions: '2.5 meters length, 36 inches width',
    craftOrigin: 'Srikalahasti, Tirupati District, Andhra Pradesh',
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    ],
    featured: true,
    tags: ['natural dyes', 'kalamkari', 'hand painted', 'organic'],
    description: 'Exquisite hand-drawn Tree of Life motif rendered with natural fermented jaggery, alum mordants, and vegetable dyes on handspun fabric using bamboo pens.',
  },
  {
    title: '[Sample] Authentic Mangalagiri 80s Count Cotton Fabric with Nizam Zari Border',
    artisanEmail: 'subbarao.mangalagiri@artisan-demo.org',
    categorySlug: 'mangalagiri-cotton-silk',
    price: 3199,
    originalPrice: 3800,
    stock: 14,
    material: 'Combed Pure Cotton 80s Count with Fine Zari',
    dimensions: '6.0 meters with matching blouse piece',
    craftOrigin: 'Mangalagiri, Guntur, Andhra Pradesh',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    ],
    featured: true,
    tags: ['mangalagiri', 'pure cotton', 'nizam border', 'summer wear'],
    description: 'Crisp, breathable pure cotton woven on traditional pit looms in Mangalagiri town. Accented with the iconic golden Nizam temple border.',
  },
  {
    title: '[Sample] Handcrafted Pure Silver Inlay Floral Bidriware Keepsake Box',
    artisanEmail: 'narasimha.pochampally@artisan-demo.org',
    categorySlug: 'bidriware-handicraft',
    price: 4499,
    originalPrice: 5200,
    stock: 5,
    material: 'Blackened Zinc Alloy with 99.9% Pure Silver Wire Inlay',
    dimensions: '12 cm x 8 cm x 5 cm',
    craftOrigin: 'Hyderabad / Bidar Artisan Cluster',
    images: [
      'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
    ],
    featured: false,
    tags: ['bidriware', 'silver inlay', 'handicraft', 'heritage'],
    description: 'Centuries-old metal art utilizing soil from historical fort grounds to create the deep velvet black finish contrasting against hand-inlaid pure silver florals.',
  },
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('[SEED] Connected to MongoDB. Seeding initial categories and demonstration artisans...');

    // 1. Seed Categories (Upsert)
    const categoryMap = {};
    for (const catData of categoriesData) {
      let cat = await Category.findOne({ slug: catData.slug });
      if (!cat) {
        cat = await Category.create(catData);
        console.log(`[SEED] Created Category: ${cat.name}`);
      } else {
        cat.name = catData.name;
        cat.description = catData.description;
        cat.image = catData.image;
        cat.craftType = catData.craftType;
        cat.featured = catData.featured;
        await cat.save();
      }
      categoryMap[cat.slug] = cat;
    }

    // 2. Seed Sample Artisans (Upsert)
    const artisanMap = {};
    for (const artData of sampleArtisans) {
      let user = await User.findOne({ email: artData.email.toLowerCase() });
      if (!user) {
        user = await User.create({
          name: artData.name,
          email: artData.email.toLowerCase(),
          password: artData.password,
          phone: artData.phone,
          role: 'artisan',
          languagePreference: 'en',
          isActive: true,
        });
        console.log(`[SEED] Created Demonstration Artisan User: ${user.name} (${user.email})`);
      }

      let profile = await ArtisanProfile.findOne({ user: user._id });
      if (!profile) {
        profile = await ArtisanProfile.create({
          user: user._id,
          craftType: artData.craftType,
          craftStory: artData.craftStory,
          experienceYears: artData.experienceYears,
          location: artData.location,
          profilePhoto: artData.profilePhoto,
          applicationStatus: artData.applicationStatus,
        });
        console.log(`[SEED] Created Artisan Profile for: ${user.name}`);
      }
      artisanMap[user.email] = profile;
    }

    // 3. Seed Sample Demonstration Products (Upsert)
    for (const prodData of sampleProducts) {
      const category = categoryMap[prodData.categorySlug];
      const artisanProfile = artisanMap[prodData.artisanEmail];

      if (!category || !artisanProfile) continue;

      let product = await Product.findOne({ title: prodData.title });
      if (!product) {
        product = await Product.create({
          title: prodData.title,
          description: prodData.description,
          category: category._id,
          artisan: artisanProfile._id,
          price: prodData.price,
          originalPrice: prodData.originalPrice,
          stock: prodData.stock,
          material: prodData.material,
          dimensions: prodData.dimensions,
          craftOrigin: prodData.craftOrigin,
          images: prodData.images,
          featured: prodData.featured,
          tags: prodData.tags,
          isPublished: true,
          isApprovedByAdmin: true,
        });
        console.log(`[SEED] Created Demonstration Product: "${product.title}"`);
      }
    }

    console.log('[SEED-SUCCESS] Database initialization completed safely without deleting existing records.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('[SEED-ERROR] Seeding failed:', err.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedData();
