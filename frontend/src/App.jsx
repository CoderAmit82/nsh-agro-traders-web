import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

// State Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ChatProvider } from './context/ChatContext';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'home':
        return (
          <Home
            setCurrentTab={setCurrentTab}
            setSelectedProductId={setSelectedProductId}
            setCategoryFilter={setCategoryFilter}
          />
        );
      case 'catalog':
        return (
          <Catalog
            setCurrentTab={setCurrentTab}
            setSelectedProductId={setSelectedProductId}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
          />
        );
      case 'product-details':
        return (
          <ProductDetails
            productId={selectedProductId}
            setSelectedProductId={setSelectedProductId}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'cart':
        return <Cart setCurrentTab={setCurrentTab} />;
      case 'checkout':
        return <Checkout setCurrentTab={setCurrentTab} />;
      case 'login':
        return <Login setCurrentTab={setCurrentTab} />;
      case 'signup':
        return <Signup setCurrentTab={setCurrentTab} />;
      case 'contact':
        return <Contact setCurrentTab={setCurrentTab} />;
      case 'dashboard':
        return <Dashboard setCurrentTab={setCurrentTab} />;
      case 'admin-dashboard':
        return <AdminDashboard setCurrentTab={setCurrentTab} />;
      default:
        return (
          <Home
            setCurrentTab={setCurrentTab}
            setSelectedProductId={setSelectedProductId}
            setCategoryFilter={setCategoryFilter}
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/30">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <main className="flex-grow">
        {renderActiveTab()}
      </main>
      <Footer setCurrentTab={setCurrentTab} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
