const request = require('supertest');
const { setupTestDB } = require('./setup');
const app = require('../app');
const User = require('../models/User');
const Category = require('../models/Category');
const ArtisanProfile = require('../models/ArtisanProfile');
const Product = require('../models/Product');
const Order = require('../models/Order');

setupTestDB();

describe('Products, Artisan Approvals, and Order Verification Tests', () => {
  it('should return empty list gracefully when product catalogue is empty', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.products).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  it('should prevent pending artisans from creating products until approved', async () => {
    // 1. Create artisan
    const artisanRes = await request(app)
      .post('/api/auth/register-artisan')
      .send({
        name: 'Pending Weaver',
        email: 'pending@artisan.test',
        password: 'password123',
        craftType: 'Kalamkari',
        craftStory: 'Traditional artisan background story for testing',
        experienceYears: 10,
        location: { state: 'Andhra Pradesh' },
      });
    const artisanToken = artisanRes.body.token;

    // 2. Create category
    const category = await Category.create({
      name: 'Ikat Sarees',
      slug: 'ikat-sarees',
      craftType: 'Weaving',
    });

    // 3. Attempt to add product while pending
    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${artisanToken}`)
      .send({
        title: 'New Ikat Saree',
        description: 'Handwoven saree description',
        category: category._id,
        price: 4500,
        stock: 5,
        material: 'Pure Silk',
        craftOrigin: 'Pochampally',
        images: ['https://example.com/saree.jpg'],
      });

    expect(productRes.status).toBe(403);
    expect(productRes.body.message).toContain('pending');

    // 4. Approve artisan
    await ArtisanProfile.findOneAndUpdate(
      { user: artisanRes.body.user._id },
      { applicationStatus: 'approved' }
    );

    // 5. Retry product creation - should succeed
    const approvedProductRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${artisanToken}`)
      .send({
        title: 'Approved Ikat Saree',
        description: 'Handwoven saree description after approval',
        category: category._id,
        price: 4500,
        stock: 5,
        material: 'Pure Silk',
        craftOrigin: 'Pochampally',
        images: ['https://example.com/saree.jpg'],
      });

    expect(approvedProductRes.status).toBe(201);
    expect(approvedProductRes.body.success).toBe(true);
    expect(approvedProductRes.body.product.title).toBe('Approved Ikat Saree');
  });

  it('should enforce verified purchase before submitting a product review', async () => {
    // Register customer
    const custRes = await request(app)
      .post('/api/auth/register-customer')
      .send({
        name: 'Reviewing Customer',
        email: 'reviewer@customer.test',
        password: 'password123',
      });
    const customerToken = custRes.body.token;

    // Create a dummy product
    const category = await Category.create({ name: 'Dupattas', slug: 'dupattas' });
    const dummyArtisanUser = await User.create({
      name: 'Artisan Subba',
      email: 'subba@artisan.test',
      password: 'password123',
      role: 'artisan',
    });
    const artisanProfile = await ArtisanProfile.create({
      user: dummyArtisanUser._id,
      craftType: 'Mangalagiri',
      craftStory: 'Traditional craft artisan story',
      experienceYears: 12,
      location: { state: 'Andhra Pradesh' },
      applicationStatus: 'approved',
    });

    const product = await Product.create({
      title: 'Handloom Dupatta',
      description: 'Pure cotton dupatta',
      category: category._id,
      artisan: artisanProfile._id,
      price: 1200,
      stock: 4,
      material: 'Cotton',
      craftOrigin: 'Mangalagiri',
      images: ['https://example.com/dupatta.jpg'],
    });

    // Try to review WITHOUT purchasing
    const reviewRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productId: product._id,
        rating: 5,
        comment: 'I love this item although I never bought it!',
      });

    expect(reviewRes.status).toBe(403);
    expect(reviewRes.body.message).toContain('Verified Purchase Required');
  });

  it('should create order and verify payment signature in simulated test mode', async () => {
    // 1. Customer
    const custRes = await request(app)
      .post('/api/auth/register-customer')
      .send({
        name: 'Checkout Customer',
        email: 'checkout@customer.test',
        password: 'password123',
      });
    const customerToken = custRes.body.token;

    // 2. Category & Artisan & Product
    const category = await Category.create({ name: 'Shawls', slug: 'shawls' });
    const artisanUser = await User.create({
      name: 'Shawl Artisan',
      email: 'shawl@artisan.test',
      password: 'password123',
      role: 'artisan',
    });
    const artisanProfile = await ArtisanProfile.create({
      user: artisanUser._id,
      craftType: 'Pashmina',
      craftStory: 'Weaving heritage story',
      experienceYears: 10,
      location: { state: 'Kashmir' },
      applicationStatus: 'approved',
    });

    const product = await Product.create({
      title: 'Silk Weave Shawl',
      description: 'Warm artisan shawl',
      category: category._id,
      artisan: artisanProfile._id,
      price: 2500,
      stock: 10,
      material: 'Silk-Wool',
      craftOrigin: 'India',
      images: ['https://example.com/shawl.jpg'],
    });

    // 3. Create Order
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ product: product._id, quantity: 2 }],
        shippingAddress: {
          fullName: 'Checkout Customer',
          phone: '+91 9876543210',
          addressLine1: 'Plot 42, Artisan Colony',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500081',
        },
      });

    expect(orderRes.status).toBe(201);
    expect(orderRes.body.success).toBe(true);
    expect(orderRes.body.order.orderStatus).toBe('Pending Payment');
    expect(orderRes.body.order.totalAmount).toBe(5000); // 2500 * 2 (free shipping over 1999)

    const orderId = orderRes.body.order._id;
    const rzpOrderId = orderRes.body.razorpayOrder.id;

    // 4. Verify Payment with simulated signature
    const verifyRes = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId,
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: 'pay_sim_test_12345',
        razorpay_signature: `sig_sim_${rzpOrderId}_pay_sim_test_12345`,
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.order.paymentStatus).toBe('paid');
    expect(verifyRes.body.order.orderStatus).toBe('Confirmed');

    // 5. Verify stock was deducted (10 - 2 = 8)
    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct.stock).toBe(8);
  });
});
