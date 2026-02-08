import { Component, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { WishlistProvider } from './context/WishlistContext';

// Layouts
import { Layout, AdminLayout } from './components/layout';

// Public Pages
import HomePage from './pages/public/HomePage';
import CatalogPage from './pages/public/CatalogPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import CartPage from './pages/public/CartPage';
import CheckoutPage from './pages/public/CheckoutPage';
import OrderConfirmationPage from './pages/public/OrderConfirmationPage';
import TrackingPage from './pages/public/TrackingPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import NotFoundPage from './pages/public/NotFoundPage';
import RegisterPage from './pages/public/RegisterPage';
import CustomerLoginPage from './pages/public/CustomerLoginPage';
import ProfilePage from './pages/public/ProfilePage';
import SizeGuidePage from './pages/public/SizeGuidePage';
import ShippingPage from './pages/public/ShippingPage';
import FAQPage from './pages/public/FAQPage';
import TermsPage from './pages/public/TermsPage';
import PrivacyPage from './pages/public/PrivacyPage';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import ProductsPage from './pages/admin/ProductsPage';
import ProductEditPage from './pages/admin/ProductEditPage';
import OrdersPage from './pages/admin/OrdersPage';
import OrderDetailPage from './pages/admin/OrderDetailPage';
import StockPage from './pages/admin/StockPage';
import SettingsPage from './pages/admin/SettingsPage';
import CustomersPage from './pages/admin/CustomersPage';
import CustomerDetailPage from './pages/admin/CustomerDetailPage';

// Error Boundary
class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0D0D0D',
          color: '#FAFAFA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: "'Inter', sans-serif",
          padding: '2rem',
        }}>
          <h1 style={{ color: '#C4A35A', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2rem', marginBottom: '1rem' }}>
            Algo salió mal
          </h1>
          <p style={{ color: '#999', marginBottom: '1rem', textAlign: 'center' }}>
            {this.state.error?.message}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{
              background: '#C4A35A',
              color: '#0D0D0D',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <AppErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
          <CustomerAuthProvider>
            <WishlistProvider>
              <CartProvider>
                <BrowserRouter>
                  <Routes>
                    {/* Public routes */}
                    <Route element={<Layout />}>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/catalogo" element={<CatalogPage />} />
                      <Route path="/catalogo/:categorySlug" element={<CatalogPage />} />
                      <Route path="/producto/:slug" element={<ProductDetailPage />} />
                      <Route path="/carrito" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/confirmacion" element={<OrderConfirmationPage />} />
                      <Route path="/confirmacion/:ref" element={<OrderConfirmationPage />} />
                      <Route path="/rastreo" element={<TrackingPage />} />
                      <Route path="/rastreo/:referenceCode" element={<TrackingPage />} />
                      <Route path="/nosotros" element={<AboutPage />} />
                      <Route path="/contacto" element={<ContactPage />} />
                      <Route path="/registro" element={<RegisterPage />} />
                      <Route path="/login" element={<CustomerLoginPage />} />
                      <Route path="/mi-cuenta" element={<ProfilePage />} />
                      <Route path="/mi-cuenta/pedidos" element={<ProfilePage />} />
                      <Route path="/mi-cuenta/favoritos" element={<ProfilePage />} />
                      <Route path="/guia-de-tallas" element={<SizeGuidePage />} />
                      <Route path="/envios-y-devoluciones" element={<ShippingPage />} />
                      <Route path="/preguntas-frecuentes" element={<FAQPage />} />
                      <Route path="/terminos-y-condiciones" element={<TermsPage />} />
                      <Route path="/politica-de-privacidad" element={<PrivacyPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>

                    {/* Admin login redirects to unified login */}
                    <Route path="/admin/login" element={<Navigate to="/login" replace />} />

                    {/* Admin routes (with sidebar layout) */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<DashboardPage />} />
                      <Route path="productos" element={<ProductsPage />} />
                      <Route path="productos/nuevo" element={<ProductEditPage />} />
                      <Route path="productos/:id/editar" element={<ProductEditPage />} />
                      <Route path="pedidos" element={<OrdersPage />} />
                      <Route path="pedidos/:id" element={<OrderDetailPage />} />
                      <Route path="clientes" element={<CustomersPage />} />
                      <Route path="clientes/:id" element={<CustomerDetailPage />} />
                      <Route path="inventario" element={<StockPage />} />
                      <Route path="configuracion" element={<SettingsPage />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </CartProvider>
            </WishlistProvider>
          </CustomerAuthProvider>
        </AuthProvider>
      </HelmetProvider>
    </AppErrorBoundary>
  );
}

export default App;
