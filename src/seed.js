require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');
const ArtisanProfile = require('./models/artisanProfile');
const Product = require('./models/product');
const Order = require('./models/order');
const Review = require('./models/review');
const connectDB = require('./config/db');

const seedDatabase = async () => {
  try {
    // Connect to DB using helper (supports local JSON fallback)
    await connectDB();

    // Clear existing collections
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await ArtisanProfile.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});

    console.log('Seeding default profiles...');

    // 1. Create Admin
    const admin = new User({
      username: 'admin',
      email: 'admin@handloom.org',
      password: 'admin123',
      role: 'admin',
      status: 'approved'
    });
    await admin.save();
    console.log('- Admin Account Created: admin@handloom.org / admin123');

    // 2. Create Artisan
    const artisanUser = new User({
      username: 'weaver',
      email: 'weaver@handloom.org',
      password: 'weaver123',
      role: 'artisan',
      status: 'approved'
    });
    await artisanUser.save();

    const artisanProfile = new ArtisanProfile({
      user: artisanUser._id,
      shopName: 'Ramu Weaving Hub',
      bio: 'Preserving traditional Pochampally ikat and double ikat patterns passed down over three generations of master weavers.',
      location: 'Pochampally, Telangana',
      contactNumber: '+91 99988 88777',
      photoUrl: '/uploads/default-avatar.svg',
      rating: 5.0,
      reviewsCount: 1
    });
    await artisanProfile.save();
    console.log('- Artisan Account Created: weaver@handloom.org / weaver123');

    // 3. Create Customer
    const customer = new User({
      username: 'customer',
      email: 'customer@gmail.com',
      password: 'customer123',
      role: 'customer',
      status: 'approved'
    });
    await customer.save();
    console.log('- Customer Account Created: customer@gmail.com / customer123');

    // 4. Create Products
    console.log('Seeding products...');
    
    const p1 = new Product({
      artisan: artisanUser._id,
      title: 'Pure Pochampally Silk Saree',
      description: 'Authentic double ikat silk saree dyed in organic natural plant colors. Features intricate gold zari borders woven by hand over 12 days on a traditional fly-shuttle loom.',
      category: 'Saree',
      price: 4500,
      stock: 4, // 5 total, but 1 sold in the seeded order below
      imageUrl: '/uploads/saree.svg',
      rating: 5.0,
      reviewsCount: 1,
      status: 'active'
    });
    await p1.save();

    const p2 = new Product({
      artisan: artisanUser._id,
      title: 'Heritage Kashmiri Pashmina Shawl',
      description: 'Pure Pashmina woolen shawl from Ladakh, woven by hand in Srinagar. Super fine thread count (120+) with soft cashmere textures and traditional hand-embroidered border designs.',
      category: 'Shawl',
      price: 6200,
      stock: 3,
      imageUrl: '/uploads/shawl.svg',
      rating: 0,
      reviewsCount: 0,
      status: 'active'
    });
    await p2.save();

    const p3 = new Product({
      artisan: artisanUser._id,
      title: 'Organic Khadi Cotton Running Fabric',
      description: 'Charkha spun organic khadi cotton fabric. Standard 44-inch width. Loom-woven texture with a highly breathable weave, perfect for summer shirts, kurtas and lightweight garments.',
      category: 'Fabrics',
      price: 350,
      stock: 25,
      imageUrl: '/uploads/khadi.svg',
      rating: 0,
      reviewsCount: 0,
      status: 'active'
    });
    await p3.save();

    const p4 = new Product({
      artisan: artisanUser._id,
      title: 'Diamond Patterned Handloom Durry Carpet',
      description: 'Reversible flat-woven cotton durry rug. Geometric diamond motifs in warm earthy dye colors. Hand-knotted fringes at the ends make it extremely durable and heavy duty.',
      category: 'Home Decor',
      price: 2800,
      stock: 4,
      imageUrl: '/uploads/carpet.svg',
      rating: 0,
      reviewsCount: 0,
      status: 'active'
    });
    await p4.save();

    // 5. Seed Review
    console.log('Seeding product reviews...');
    const review = new Review({
      user: customer._id,
      product: p1._id,
      rating: 5,
      comment: 'Absolutely breathtaking craftsmanship. The silk is lightweight yet holds a rich luster. The gold borders are flawless.'
    });
    await review.save();

    // 6. Seed Past Order
    console.log('Seeding default completed transaction...');
    const order = new Order({
      customer: customer._id,
      products: [
        {
          product: p1._id,
          quantity: 1,
          price: 4500
        }
      ],
      totalAmount: 4500,
      paymentStatus: 'Paid',
      paymentId: 'pay_sample_12345678',
      razorpayOrderId: 'order_mock_sample123',
      orderStatus: 'Delivered',
      shippingAddress: {
        name: 'Ramesh Sharma',
        addressLine: 'Flat 402, Royal Gardens, Sector 15',
        city: 'Jaipur',
        state: 'Rajasthan',
        postalCode: '302001',
        phone: '+91 98765 12345'
      },
      estimatedDeliveryDate: new Date()
    });
    await order.save();

    console.log('Database seeding successfully finished!');
    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database: ', error);
    process.exit(1);
  }
};

seedDatabase();
