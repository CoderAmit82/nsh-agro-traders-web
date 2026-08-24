import React, { useContext, useState } from 'react';
import { Leaf, ShoppingCart, User, Bell, LogOut, Menu, X, Heart } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = ({ currentTab, setCurrentTab }) => {
  const { user, logout, notifications, markNotificationRead } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleTabChange = (tabName) => {
    setCurrentTab(tabName);
    setShowMobileMenu(false);
    setShowNotifications(false);
  };

  const handleNotificationClick = (id) => {
    markNotificationRead(id);
    handleTabChange('dashboard');
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <nav className="sticky top-0 z-50 bg-primary-dark text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => handleTabChange('home')}>
            <img src="/favicon.png" alt="NSH Agro Traders Logo" className="h-8 w-8 object-contain mr-2 rounded-full border border-green-700/30 bg-white" />
            <span className="font-extrabold text-xl tracking-tight font-sans">
              NSH <span className="text-harvest">Agro</span> Traders
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => handleTabChange('home')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentTab === 'home' ? 'text-harvest font-bold' : 'hover:text-primary-light'}`}
            >
              Home
            </button>
            <button
              onClick={() => handleTabChange('catalog')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentTab === 'catalog' ? 'text-harvest font-bold' : 'hover:text-primary-light'}`}
            >
              Products
            </button>
            <button
              onClick={() => handleTabChange('contact')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentTab === 'contact' ? 'text-harvest font-bold' : 'hover:text-primary-light'}`}
            >
              Contact
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => handleTabChange('admin-dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-semibold bg-harvest hover:bg-orange-600 text-white shadow transition-colors`}
              >
                Admin Panel
              </button>
            )}
          </div>

          {/* Icon Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart Icon */}
            <button
              onClick={() => handleTabChange('cart')}
              className="relative p-2 rounded-full hover:bg-primary-DEFAULT transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {getCartCount() > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {getCartCount()}
                </span>
              )}
            </button>

            {/* Notifications Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full hover:bg-primary-DEFAULT transition-colors"
                >
                  <Bell className="h-6 w-6" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 text-[10px] font-bold text-white bg-red-600 rounded-full animate-bounce">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-lg shadow-xl py-2 z-50 border border-gray-100 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center bg-green-50">
                      <span className="font-bold text-sm text-primary-dark">Notifications</span>
                      {unreadNotifications.length > 0 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                          {unreadNotifications.length} New
                        </span>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-gray-500 text-xs">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif._id)}
                            className={`px-4 py-3 border-b border-gray-50 hover:bg-green-50/50 cursor-pointer text-xs transition-colors ${!notif.isRead ? 'bg-green-50/30 font-semibold' : ''}`}
                          >
                            <div className="flex justify-between items-start">
                              <span className={`font-bold ${notif.type === 'Payment Reminder' ? 'text-red-600' : 'text-primary-DEFAULT'}`}>
                                {notif.title}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div
                      onClick={() => handleTabChange('dashboard')}
                      className="px-4 py-2 text-center text-xs text-primary font-bold border-t border-gray-100 cursor-pointer hover:bg-gray-50"
                    >
                      View All in Dashboard
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile / Login */}
            {user ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleTabChange('dashboard')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-primary hover:bg-primary-dark transition-all border border-green-500/25"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    handleTabChange('home');
                  }}
                  title="Logout"
                  className="p-2 rounded-full hover:bg-red-700 text-red-200 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleTabChange('login')}
                className="flex items-center space-x-1 bg-harvest hover:bg-orange-600 px-4 py-2 rounded-md text-sm font-semibold shadow transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Farmer Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-2">
            {user && (
              <button
                onClick={() => handleTabChange('dashboard')}
                className="p-2 relative rounded-full hover:bg-primary-DEFAULT"
              >
                <User className="h-6 w-6" />
              </button>
            )}
            <button
              onClick={() => handleTabChange('cart')}
              className="p-2 relative rounded-full hover:bg-primary-DEFAULT"
            >
              <ShoppingCart className="h-6 w-6" />
              {getCartCount() > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center h-4 w-4 text-[10px] font-bold text-white bg-red-600 rounded-full">
                  {getCartCount()}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-md hover:bg-primary-DEFAULT focus:outline-none"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {showMobileMenu && (
        <div className="md:hidden bg-primary-dark px-2 pt-2 pb-4 space-y-1 sm:px-3 border-t border-green-800">
          <button
            onClick={() => handleTabChange('home')}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-primary"
          >
            Home
          </button>
          <button
            onClick={() => handleTabChange('catalog')}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-primary"
          >
            Products
          </button>
          <button
            onClick={() => handleTabChange('contact')}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-primary"
          >
            Contact
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => handleTabChange('admin-dashboard')}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-bold text-harvest"
            >
              Admin Panel
            </button>
          )}

          {user ? (
            <>
              <button
                onClick={() => handleTabChange('dashboard')}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-primary"
              >
                Farmer Dashboard
              </button>
              <button
                onClick={() => {
                  logout();
                  handleTabChange('home');
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-300 hover:bg-red-900"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => handleTabChange('login')}
              className="block w-full text-center bg-harvest text-white px-4 py-2 rounded-md text-base font-bold shadow mt-4"
            >
              Farmer Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
