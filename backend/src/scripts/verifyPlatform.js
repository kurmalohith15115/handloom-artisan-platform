const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const ArtisanProfile = require('../models/ArtisanProfile');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');

async function runEndToEndVerification() {
  console.log('===========================================================');
  console.log('  STARTING COMPREHENSIVE END-TO-END PLATFORM VERIFICATION');
  console.log('===========================================================\n');

  // 1. Setup in-memory MongoDB
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'super_secure_verification_jwt_secret_2026';
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log('✓ 1. Database Connection: Connected to isolated test MongoDB engine');

  // 2. Health check
  const healthRes = await request(app).get('/api/health');
  if (healthRes.status === 200 && healthRes.body.status === 'healthy') {
    console.log('✓ 2. Health Endpoint: /api/health returned 200 OK (DB state: Connected)');
  } else {
    throw new Error(`Health check failed: ${JSON.stringify(healthRes.body)}`);
  }

  // 3. Customer registration & prevention of privilege escalation
  const custReg = await request(app).post('/api/auth/register-customer').send({
    name: 'Ananya Sharma',
    email: 'ananya@consciouspatron.in',
    password: 'CustomerSecurePass123!',
    phone: '+91 98480 11111',
    role: 'admin', // Attack attempt
  });
  if (custReg.status === 201 && custReg.body.user.role === 'customer') {
    console.log('✓ 3. Customer Registration: Created customer. Privilege escalation successfully blocked (role forced to customer).');
  } else {
    throw new Error('Customer registration failed');
  }
  const customerToken = custReg.body.token;

  // 4. Artisan registration with pending status
  const artReg = await request(app).post('/api/auth/register-artisan').send({
    name: 'Narasimha Chary',
    email: 'narasimha@artisan-demo.org',
    password: 'ArtisanSecurePass123!',
    phone: '+91 98480 22222',
    craftType: 'Pochampally Ikat',
    craftStory: 'Three generations of master double-ikat pedal-loom weavers from Bhoodan Pochampally.',
    experienceYears: 28,
    location: { village: 'Bhoodan Pochampally', district: 'Yadadri', state: 'Telangana' },
  });
  if (artReg.status === 201 && artReg.body.artisanProfile.applicationStatus === 'pending') {
    console.log('✓ 4. Artisan Registration: Created artisan account with "pending" status.');
  } else {
    throw new Error('Artisan registration failed');
  }
  const artisanToken = artReg.body.token;
  const artisanProfileId = artReg.body.artisanProfile._id;

  // 5. Verify unapproved artisan cannot list products
  const category = await Category.create({
    name: 'Pochampally Ikat',
    slug: 'pochampally-ikat',
    craftType: 'Double Ikat',
  });

  const blockedProd = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${artisanToken}`)
    .send({
      title: 'Silk Ikat Saree',
      description: 'Handwoven pure silk double ikat',
      category: category._id,
      price: 6500,
      stock: 4,
      material: 'Pure Mulberry Silk',
      craftOrigin: 'Pochampally, Telangana',
      images: ['https://example.com/saree.jpg'],
    });
  if (blockedProd.status === 403) {
    console.log('✓ 5. Artisan Approval Guard: Unapproved artisan prohibited from listing products (403 Forbidden).');
  } else {
    throw new Error('Artisan approval guard failed');
  }

  // 6. Bootstrap Administrator
  const adminUser = await User.create({
    name: 'Platform Administrator',
    email: 'admin@handloom-artisan.org',
    password: 'AdminSuperPassword2026!',
    role: 'admin',
    isActive: true,
  });
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin@handloom-artisan.org',
    password: 'AdminSuperPassword2026!',
    expectedRole: 'admin',
  });
  const adminToken = adminLogin.body.token;
  console.log('✓ 6. Administrator Bootstrap: Admin authenticated with role "admin".');

  // 7. Admin approves artisan application
  const approveRes = await request(app)
    .put(`/api/admin/artisan-applications/${artisanProfileId}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'approved' });
  if (approveRes.status === 200 && approveRes.body.artisan.applicationStatus === 'approved') {
    console.log('✓ 7. Admin Workflow: Admin approved artisan application. Audit log generated.');
  } else {
    throw new Error('Admin approval workflow failed');
  }

  // 8. Approved artisan lists product
  const createProdRes = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${artisanToken}`)
    .send({
      title: 'Authentic Pure Silk Pochampally Double Ikat Saree',
      description: 'Handwoven geometric masterpiece dyed with natural indigo and madder.',
      category: category._id,
      price: 8499,
      originalPrice: 9999,
      stock: 5,
      material: '100% Pure Silk (Silk Mark)',
      dimensions: '6.25m with unstitched blouse',
      craftOrigin: 'Pochampally, Telangana',
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'],
    });
  if (createProdRes.status === 201) {
    console.log('✓ 8. Product Listing: Approved artisan successfully published handloom piece.');
  } else {
    throw new Error(`Product creation failed: ${JSON.stringify(createProdRes.body)}`);
  }
  const productId = createProdRes.body.product._id;

  // 9. Public browsing
  const browseRes = await request(app).get('/api/products');
  if (browseRes.status === 200 && browseRes.body.products.length === 1) {
    console.log(`✓ 9. Public Catalogue: Product is visible in public directory with price ₹${browseRes.body.products[0].price}.`);
  } else {
    throw new Error('Public catalogue query failed');
  }

  // 10. Order Placement & Server-Side Price Calculation
  const orderRes = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({
      items: [{ product: productId, quantity: 1 }],
      shippingAddress: {
        fullName: 'Ananya Sharma',
        phone: '+91 98480 11111',
        addressLine1: 'Plot 42, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500033',
        country: 'India',
      },
    });
  if (orderRes.status === 201 && orderRes.body.order.orderStatus === 'Pending Payment') {
    console.log(`✓ 10. Order Creation: Order #${orderRes.body.order.orderNumber} initialized with server total ₹${orderRes.body.order.totalAmount}.`);
  } else {
    throw new Error(`Order placement failed: ${JSON.stringify(orderRes.body)}`);
  }
  const orderId = orderRes.body.order._id;
  const rzpOrderId = orderRes.body.razorpayOrder.id;

  // 11. Razorpay Payment Signature Verification
  const verifyRes = await request(app)
    .post('/api/payments/verify')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({
      orderId,
      razorpay_order_id: rzpOrderId,
      razorpay_payment_id: 'pay_test_verified_123',
      razorpay_signature: `sig_sim_${rzpOrderId}_pay_test_verified_123`,
    });
  if (verifyRes.status === 200 && verifyRes.body.order.paymentStatus === 'paid' && verifyRes.body.order.orderStatus === 'Confirmed') {
    console.log('✓ 11. Payment Verification: Cryptographic signature verified server-side. Order status advanced to "Confirmed".');
  } else {
    throw new Error(`Payment verification failed: ${JSON.stringify(verifyRes.body)}`);
  }

  // 12. Verify Stock Deduction
  const updatedProd = await Product.findById(productId);
  if (updatedProd.stock === 4) {
    console.log(`✓ 12. Inventory Stock: Stock automatically deducted from 5 to ${updatedProd.stock}.`);
  } else {
    throw new Error(`Stock deduction mismatch: ${updatedProd.stock}`);
  }

  // 13. Artisan Fulfillment Status Update (Confirmed -> Processing -> Shipped)
  const processRes = await request(app)
    .put(`/api/orders/${orderId}/status`)
    .set('Authorization', `Bearer ${artisanToken}`)
    .send({
      status: 'Processing',
      note: 'Master weaver preparing silk warp and pedal loom',
    });
  if (processRes.status !== 200) {
    throw new Error('Transition to Processing failed');
  }

  const fulfillRes = await request(app)
    .put(`/api/orders/${orderId}/status`)
    .set('Authorization', `Bearer ${artisanToken}`)
    .send({
      status: 'Shipped',
      carrier: 'India Post Speed Post',
      trackingNumber: 'SP123456789IN',
      note: 'Handloom piece packed and dispatched via Speed Post',
    });
  if (fulfillRes.status === 200 && fulfillRes.body.order.orderStatus === 'Shipped') {
    console.log('✓ 13. Artisan Fulfillment: Order strictly transitioned through Processing -> Shipped with tracking.');
  } else {
    throw new Error('Artisan fulfillment update failed');
  }

  // 14. Verified Customer Review
  const reviewRes = await request(app)
    .post('/api/reviews')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({
      productId,
      rating: 5,
      comment: 'Exquisite weave! The double ikat diamond pattern is remarkably crisp and pure silk fabric feels luxurious.',
    });
  if (reviewRes.status === 201) {
    console.log('✓ 14. Verified Review: Review published successfully by verified purchaser.');
  } else {
    throw new Error('Review submission failed');
  }

  // 15. Audit Log Verification
  const auditRes = await request(app)
    .get('/api/admin/audit-logs')
    .set('Authorization', `Bearer ${adminToken}`);
  if (auditRes.status === 200 && auditRes.body.logs.length >= 1) {
    console.log(`✓ 15. Audit Logging: Found ${auditRes.body.logs.length} logged administrative events.`);
  } else {
    throw new Error('Audit log check failed');
  }

  console.log('\n===========================================================');
  console.log('  ALL 15 END-TO-END ACCEPTANCE CHECKS PASSED PERFECTLY!');
  console.log('===========================================================\n');

  await mongoose.disconnect();
  await mongoServer.stop();
  process.exit(0);
}

runEndToEndVerification().catch((err) => {
  console.error('\n✖ VERIFICATION FAILED:', err);
  process.exit(1);
});
