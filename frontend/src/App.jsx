import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Toast from './components/common/Toast';
import Loader from './components/common/Loader';
import ErrorBoundary from './components/common/ErrorBoundary';

// Layouts (loaded synchronously as shell)
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';

// Auth
const AdminLogin = lazy(() => import('./components/auth/AdminLogin'));

// User Pages (code-split via React.lazy)
const HomePage = lazy(() => import('./pages/user/HomePage'));
const ExplorePage = lazy(() => import('./pages/user/ExplorePage'));
const ProductPage = lazy(() => import('./pages/user/ProductPage'));
const CartPage = lazy(() => import('./pages/user/CartPage'));
const CheckoutPage = lazy(() => import('./pages/user/CheckoutPage'));
const WishlistPage = lazy(() => import('./components/wishlist/WishlistPage'));
const ProfilePage = lazy(() => import('./components/profile/ProfilePage'));
const OrderDetailPage = lazy(() => import('./pages/user/OrderDetailPage'));
const PaymentStatusPage = lazy(() => import('./pages/user/PaymentStatusPage'));

// Admin Pages (code-split to save mobile bandwidth)
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage'));
const AdminBannersPage = lazy(() => import('./pages/admin/AdminBannersPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminAuditPage = lazy(() => import('./pages/admin/AdminAuditPage'));
const AdminChatPage = lazy(() => import('./pages/admin/AdminChatPage'));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'));

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, openLoginModal } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openLoginModal();
    }
  }, [isLoading, isAuthenticated, openLoginModal]);

  if (isLoading) {
    return <Loader fullPage message="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <Loader fullPage message="Checking administrator privileges..." />;
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
      <CartProvider>
        <Router>
          <Suspense fallback={<Loader fullPage message="Loading LEO PAINTS experience..." />}>
            <Routes>
              {/* Storefront Layout */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/explore/:category" element={<ExplorePage />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <WishlistPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/payment/status" element={<PaymentStatusPage />} />
              </Route>

              {/* Admin Authentication */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected Admin Console */}
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminLayout />
                  </ProtectedAdminRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="coupons" element={<AdminCouponsPage />} />
                <Route path="banners" element={<AdminBannersPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="audit-logs" element={<AdminAuditPage />} />
                <Route path="chat" element={<AdminChatPage />} />
                <Route path="reviews" element={<AdminReviewsPage />} />
              </Route>

              {/* Fallback to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>

        {/* Global Toast Notifications */}
        <Toast />
      </CartProvider>
    </AuthProvider>
  </ErrorBoundary>
  );
}

export default App;
