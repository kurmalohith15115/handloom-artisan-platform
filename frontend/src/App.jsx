import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Marketplace Pages
import { Home } from './pages/Home';
import { AllProducts } from './pages/AllProducts';
import { ProductDetails } from './pages/ProductDetails';
import { ArtisanDirectory } from './pages/ArtisanDirectory';
import { ArtisanProfilePage } from './pages/ArtisanProfilePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AboutUs } from './pages/AboutUs';
import { CommunityImpact } from './pages/CommunityImpact';
import { ContactSupport } from './pages/ContactSupport';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsConditions } from './pages/TermsConditions';
import { ShippingRefundPolicy } from './pages/ShippingRefundPolicy';

// Customer Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CustomerAccount } from './pages/CustomerAccount';

// Artisan Pages
import { ArtisanRegister } from './pages/ArtisanRegister';
import { ArtisanLogin } from './pages/ArtisanLogin';
import { ArtisanDashboard } from './pages/ArtisanDashboard';

// Admin Pages
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

// 404 Not Found Page
const NotFound = () => (
  <div className="page-wrapper container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
    <div className="card" style={{ maxWidth: '520px', margin: '0 auto', padding: '3rem 2rem' }}>
      <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>🧵</span>
      <h2 className="heading-serif" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
        Page Not Found (404)
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        The handloom page or craft resource you requested does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        Return to Marketplace Home
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public Marketplace Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<AllProducts />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/artisans" element={<ArtisanDirectory />} />
                <Route path="/artisans/:id" element={<ArtisanProfilePage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                <Route path="/order-tracking" element={<OrderTrackingPage />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/impact" element={<CommunityImpact />} />
                <Route path="/support" element={<ContactSupport />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-conditions" element={<TermsConditions />} />
                <Route path="/shipping-refund-policy" element={<ShippingRefundPolicy />} />

                {/* Customer Login & Account Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute requiredRole="customer">
                      <CustomerAccount />
                    </ProtectedRoute>
                  }
                />

                {/* Artisan Portal Routes */}
                <Route path="/artisan/register" element={<ArtisanRegister />} />
                <Route path="/artisan/login" element={<ArtisanLogin />} />
                <Route
                  path="/artisan/dashboard"
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <ArtisanDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Portal Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
