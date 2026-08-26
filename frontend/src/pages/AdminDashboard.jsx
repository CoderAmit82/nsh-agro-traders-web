import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { API_BASE } from '../config/api';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, Package, ShoppingCart, CreditCard, MessageSquare, Star, Plus, Edit, Trash2, ShieldAlert, ArrowRight } from 'lucide-react';

const AdminDashboard = ({ setCurrentTab }) => {
  const { token, user } = useContext(AuthContext);
  const { conversations, fetchConversations, messages, fetchHistory, sendMessage } = useContext(ChatContext);

  const [activeSubTab, setActiveSubTab] = useState('metrics'); // metrics, products, orders, payments, chat, reviews
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Products CRUD State
  const [products, setProducts] = useState([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Product Form Fields
  const [prodName, setProdName] = useState('');
  const [prodCat, setProdCat] = useState('Pesticides');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDisc, setProdDisc] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodUsage, setProdUsage] = useState('');
  const [prodManufacturer, setProdManufacturer] = useState('');
  const [prodExpiry, setProdExpiry] = useState('');
  const [prodBatch, setProdBatch] = useState('');
  const [prodImages, setProdImages] = useState(null);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Payments State
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [adjustingPayment, setAdjustingPayment] = useState(null);
  const [adjPaidAmt, setAdjPaidAmt] = useState('');
  const [adjMethod, setAdjMethod] = useState('');
  const [submittingAdjustment, setSubmittingAdjustment] = useState(false);

  // Active chat farmer ID
  const [activeFarmerId, setActiveFarmerId] = useState(null);
  const [adminChatText, setAdminChatText] = useState('');

  // Reviews list
  const [allReviews, setAllReviews] = useState([]);

  // Fetch Dashboard Stats
  const fetchDashboardStats = async () => {
    if (!token) return;
    setLoadingStats(true);
    try {
      const response = await fetch(`${API_BASE}/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setLowStock(data.lowStockAlerts);
        setCategoryData(data.categoryBreakdown);
        setRecentOrders(data.recentOrders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Products
  const fetchProductsList = async () => {
    setProdLoading(true);
    try {
      const response = await fetch(`${API_BASE}/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);

        // Aggregate reviews
        const reviewsArr = [];
        data.products.forEach(p => {
          p.reviews.forEach(r => {
            reviewsArr.push({
              ...r,
              productName: p.name,
              productId: p._id
            });
          });
        });
        setAllReviews(reviewsArr);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProdLoading(false);
    }
  };

  // Fetch Orders (Admin)
  const fetchAllOrders = async () => {
    if (!token) return;
    setOrdersLoading(true);
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch Payments (Admin)
  const fetchAllPayments = async () => {
    if (!token) return;
    setPaymentsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === 'admin') {
      fetchDashboardStats();
      fetchProductsList();
      fetchAllOrders();
      fetchAllPayments();
      fetchConversations();
    }
  }, [token, user, activeSubTab]);

  // Load chat messages when activeFarmerId updates
  useEffect(() => {
    if (activeFarmerId) {
      fetchHistory(activeFarmerId);
    }
  }, [activeFarmerId]);

  // Restructure form inputs when editing product
  const handleOpenProductEdit = (product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdCat(product.category);
    setProdPrice(product.price);
    setProdDisc(product.discount || 0);
    setProdStock(product.stock);
    setProdDesc(product.description);
    setProdUsage(product.usageDetails);
    setProdManufacturer(product.manufacturingDetails?.manufacturer || '');
    setProdExpiry(product.manufacturingDetails?.expiryDate ? product.manufacturingDetails.expiryDate.split('T')[0] : '');
    setProdBatch(product.manufacturingDetails?.batchNumber || '');
    setProdImages(null);
    setShowProductModal(true);
  };

  const handleOpenProductCreate = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCat('Pesticides');
    setProdPrice('');
    setProdDisc('');
    setProdStock('');
    setProdDesc('');
    setProdUsage('');
    setProdManufacturer('');
    setProdExpiry('');
    setProdBatch('');
    setProdImages(null);
    setShowProductModal(true);
  };

  // Submit Product (Create / Update)
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setSubmittingProduct(true);

    try {
      // Use FormData to allow file uploads
      const formData = new FormData();
      formData.append('name', prodName);
      formData.append('category', prodCat);
      formData.append('price', prodPrice);
      formData.append('discount', prodDisc);
      formData.append('stock', prodStock);
      formData.append('description', prodDesc);
      formData.append('usageDetails', prodUsage);
      formData.append('manufacturer', prodManufacturer);
      formData.append('expiryDate', prodExpiry);
      formData.append('batchNumber', prodBatch);

      if (prodImages) {
        for (let i = 0; i < prodImages.length; i++) {
          formData.append('images', prodImages[i]);
        }
      }

      let url = `${API_BASE}/products`;
      let method = 'POST';

      if (editingProduct) {
        url += `/${editingProduct._id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData // Content-Type is auto-configured by browser for multipart/form-data
      });
      const data = await response.json();

      if (data.success) {
        alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
        setShowProductModal(false);
        fetchProductsList();
      } else {
        alert(data.message || 'Product action failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Product action connection error.');
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this product? This will remove all catalog details.')) return;
    try {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert('Product deleted successfully.');
        fetchProductsList();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update order status
  const handleOrderStatusUpdate = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Order status set to ${status}.`);
        fetchAllOrders();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Payment Adjust Modal
  const handleOpenPaymentAdjust = (pay) => {
    setAdjustingPayment(pay);
    setAdjPaidAmt(pay.paidAmount);
    setAdjMethod(pay.paymentMethod);
  };

  // Submit Payment Adjust
  const handlePaymentAdjustSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAdjustment(true);
    try {
      const response = await fetch(`${API_BASE}/payments/${adjustingPayment._id}/adjust`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ paidAmount: Number(adjPaidAmt), paymentMethod: adjMethod })
      });
      const data = await response.json();
      if (data.success) {
        alert('Payment balances updated and invoice regenerated!');
        setAdjustingPayment(null);
        fetchAllPayments();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAdjustment(false);
    }
  };

  // Submit Admin Chat text
  const handleAdminChatSend = async (e) => {
    e.preventDefault();
    if (!adminChatText.trim() || !activeFarmerId) return;

    const res = await sendMessage(adminChatText, activeFarmerId);
    if (res.success) {
      setAdminChatText('');
      // Reload history
      fetchHistory(activeFarmerId);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="text-xs text-gray-500">Only authorized administrators are allowed to access this workspace.</p>
        <button
          onClick={() => setCurrentTab('home')}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2 rounded-lg text-xs"
        >
          Return Home
        </button>
      </div>
    );
  }

  const COLORS = ['#2e7d32', '#8d6e63', '#f57c00', '#25D366', '#d32f2f'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary-dark font-sans flex items-center">
            <LayoutDashboard className="h-6 w-6 text-harvest mr-2" />
            <span>Admin Support Center</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Manage stock inventory, catalog sales, payment records, and user queries</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Navigation Sidebar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-fit space-y-1">
          <button
            onClick={() => setActiveSubTab('metrics')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'metrics' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            <span>Analytics Dashboard</span>
          </button>
          <button
            onClick={() => setActiveSubTab('products')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'products' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Package className="h-4.5 w-4.5" />
            <span>Inventory Catalog</span>
          </button>
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'orders' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <ShoppingCart className="h-4.5 w-4.5" />
            <span>Farmer Purchases</span>
          </button>
          <button
            onClick={() => setActiveSubTab('payments')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'payments' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <CreditCard className="h-4.5 w-4.5" />
            <span>Billing & Payments</span>
          </button>
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'chat' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <MessageSquare className="h-4.5 w-4.5" />
            <span>Farmer Support Desk</span>
          </button>
          <button
            onClick={() => setActiveSubTab('reviews')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'reviews' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Star className="h-4.5 w-4.5" />
            <span>Product Reviews</span>
          </button>
        </div>

        {/* Action Panel Container */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-[500px]">
          {/* ANALYTICS METRICS */}
          {activeSubTab === 'metrics' && (
            <div className="space-y-8">
              {/* Metrics grid */}
              {loadingStats ? (
                <div className="text-center py-12 text-xs text-gray-400 animate-pulse">Computing stats...</div>
              ) : !stats ? (
                <div className="text-center py-12 text-xs text-gray-400">Failed to aggregate statistics.</div>
              ) : (
                <div className="space-y-8">
                  {/* Grid cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Total Farmers</span>
                      <span className="text-2xl font-black text-gray-800 mt-1 block">{stats.totalFarmers}</span>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Total Orders</span>
                      <span className="text-2xl font-black text-gray-800 mt-1 block">{stats.totalOrders}</span>
                    </div>
                    <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                      <span className="text-primary-dark block text-[10px] uppercase font-bold tracking-wider">Gross Sales Revenue</span>
                      <span className="text-2xl font-black text-primary-dark mt-1 block">Rs. {stats.totalRevenue}</span>
                    </div>
                    <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                      <span className="text-red-600 block text-[10px] uppercase font-bold tracking-wider">Pending Balances</span>
                      <span className="text-2xl font-black text-red-600 mt-1 block">Rs. {stats.pendingPayments}</span>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Paid Revenues</span>
                      <span className="text-2xl font-black text-green-600 mt-1 block">Rs. {stats.completedPayments}</span>
                    </div>
                    <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                      <span className="text-orange-700 block text-[10px] uppercase font-bold tracking-wider">Low Stock Products</span>
                      <span className="text-2xl font-black text-orange-700 mt-1 block">{stats.lowStockCount}</span>
                    </div>
                  </div>

                  {/* Graph & Alerts row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Category Recharts Chart */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                      <h3 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider">Sales Share by Category</h3>
                      {categoryData.length === 0 ? (
                        <div className="text-center text-[10px] text-gray-400 py-12">No sales aggregated yet.</div>
                      ) : (
                        <div className="h-60 w-full text-xs">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip formatter={(value) => [`Rs. ${value}`, 'Revenue']} />
                              <Bar dataKey="value" fill="#2e7d32">
                                {categoryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <div className="flex items-center space-x-2 text-orange-700 border-b border-gray-50 pb-2">
                        <ShieldAlert className="h-4.5 w-4.5" />
                        <h3 className="font-extrabold text-xs uppercase tracking-wider">Low Stock Inventory Warnings</h3>
                      </div>
                      {lowStock.length === 0 ? (
                        <p className="text-[11px] text-gray-500 py-6 text-center">All product stocks are stable!</p>
                      ) : (
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {lowStock.map((prod) => (
                            <div key={prod._id} className="flex justify-between items-center bg-orange-50/50 p-3 rounded-xl border border-orange-100 text-xs">
                              <div>
                                <span className="font-bold text-gray-800 block">{prod.name}</span>
                                <span className="text-[10px] text-gray-500">Category: {prod.category}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-orange-700 font-extrabold block">{prod.stock} units left</span>
                                <button
                                  onClick={() => {
                                    handleOpenProductEdit(prod);
                                    setActiveSubTab('products');
                                  }}
                                  className="text-[10px] text-primary hover:underline font-bold"
                                >
                                  Restock Now
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Orders List */}
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider">Recent Orders placed</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs text-gray-700 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <thead className="bg-gray-50">
                          <tr className="border-b border-gray-100">
                            <th className="py-3 px-4 text-left font-bold text-gray-500">Farmer</th>
                            <th className="py-3 px-4 text-left font-bold text-gray-500">Amount</th>
                            <th className="py-3 px-4 text-left font-bold text-gray-500">Status</th>
                            <th className="py-3 px-4 text-left font-bold text-gray-500">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                          {recentOrders.map((ord) => (
                            <tr key={ord._id} className="hover:bg-gray-50/50">
                              <td className="py-3 px-4 font-bold">{ord.farmerId?.name || 'Ramesh Kumar'}</td>
                              <td className="py-3 px-4 font-extrabold text-primary-dark">Rs. {ord.totalAmount}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${ord.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {ord.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-400">{new Date(ord.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* INVENTORY CATALOG (CRUD) */}
          {activeSubTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h2 className="text-base font-extrabold text-primary-dark">Product Stock Inventory</h2>
                <button
                  onClick={handleOpenProductCreate}
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-xl text-xs shadow flex items-center space-x-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {prodLoading ? (
                <div className="text-center py-12 text-xs text-gray-400 animate-pulse">Loading products list...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-gray-700 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-100">
                        <th className="py-3 px-4 text-left font-bold text-gray-500">Name</th>
                        <th className="py-3 px-4 text-left font-bold text-gray-500">Category</th>
                        <th className="py-3 px-4 text-left font-bold text-gray-500">Price (Rs.)</th>
                        <th className="py-3 px-4 text-left font-bold text-gray-500">Stock</th>
                        <th className="py-3 px-4 text-center font-bold text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                      {products.map((prod) => (
                        <tr key={prod._id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-4 font-bold text-gray-800 max-w-[200px] truncate">{prod.name}</td>
                          <td className="py-3 px-4">{prod.category}</td>
                          <td className="py-3 px-4 font-bold">
                            {prod.price} {prod.discount > 0 && <span className="text-[10px] text-red-500">({prod.discount}% off)</span>}
                          </td>
                          <td className={`py-3 px-4 font-bold ${prod.stock < 5 ? 'text-red-500' : 'text-gray-700'}`}>{prod.stock}</td>
                          <td className="py-3 px-4 flex justify-center space-x-2.5">
                            <button
                              onClick={() => handleOpenProductEdit(prod)}
                              className="p-1.5 rounded-lg text-primary hover:bg-green-50 transition-colors"
                              title="Edit product"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod._id)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* FARMER PURCHASES (ORDERS) */}
          {activeSubTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-base font-extrabold text-primary-dark border-b border-gray-100 pb-3">All Farmer Orders</h2>
              {ordersLoading ? (
                <div className="text-center py-12 text-xs text-gray-400 animate-pulse">Loading orders...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-gray-700 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-100">
                        <th className="py-3 px-4 text-left font-bold text-gray-500">Order ID</th>
                        <th className="py-3 px-4 text-left font-bold text-gray-500">Farmer</th>
                        <th className="py-3 px-4 text-left font-bold text-gray-500">Value (Rs.)</th>
                        <th className="py-3 px-4 text-left font-bold text-gray-500">Status</th>
                        <th className="py-3 px-4 text-left font-bold text-gray-500">Change Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                      {orders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-4 font-bold">{ord._id.toString().substring(0, 12)}...</td>
                          <td className="py-3 px-4">
                            <span className="font-bold block text-gray-800">{ord.farmerId?.name}</span>
                            <span className="text-[10px] text-gray-400">Mob: {ord.farmerId?.mobile}</span>
                          </td>
                          <td className="py-3 px-4 font-extrabold text-primary-dark">Rs. {ord.totalAmount}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${ord.status === 'Delivered' ? 'bg-green-100 text-green-700' : ord.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={ord.status}
                              onChange={(e) => handleOrderStatusUpdate(ord._id, e.target.value)}
                              className="bg-gray-50 border border-gray-200 rounded p-1 outline-none text-[10px] cursor-pointer text-gray-700"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* BILLING & PAYMENTS */}
          {activeSubTab === 'payments' && (
            <div className="space-y-6">
              <h2 className="text-base font-extrabold text-primary-dark border-b border-gray-100 pb-3">Billing & Payment Ledgers</h2>
              {paymentsLoading ? (
                <div className="text-center py-12 text-xs text-gray-400 animate-pulse">Loading billing details...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-gray-700 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-100">
                        <th className="py-3 px-4 text-left font-bold text-gray-500">Order Ref</th>
                        <th className="py-3 px-4 text-left font-bold text-gray-500">Farmer</th>
                        <th className="py-3 px-4 text-left font-bold text-gray-500">Total (Rs.)</th>
                        <th className="py-3 px-4 text-left font-bold text-gray-500">Paid / Pending</th>
                        <th className="py-3 px-4 text-left font-bold text-gray-500">Status</th>
                        <th className="py-3 px-4 text-center font-bold text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                      {payments.map((pay) => (
                        <tr key={pay._id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-4 font-bold">{pay.orderId?._id?.substring(0, 10) || 'N/A'}...</td>
                          <td className="py-3 px-4">
                            <span className="font-bold block text-gray-800">{pay.farmerId?.name}</span>
                            <span className="text-[10px] text-gray-400">{pay.farmerId?.mobile}</span>
                          </td>
                          <td className="py-3 px-4 font-bold">Rs. {pay.totalAmount}</td>
                          <td className="py-3 px-4">
                            <span className="text-green-600 block">Paid: Rs. {pay.paidAmount}</span>
                            <span className="text-red-500 block">Pend: Rs. {pay.pendingAmount}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${pay.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {pay.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleOpenPaymentAdjust(pay)}
                              className="text-[10px] font-bold text-primary hover:underline border border-primary/25 rounded px-2.5 py-1 bg-white hover:bg-green-50"
                            >
                              Adjust Balance
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* FARMER SUPPORT CHAT CENTER */}
          {activeSubTab === 'chat' && (
            <div className="space-y-6">
              <h2 className="text-base font-extrabold text-primary-dark border-b border-gray-100 pb-3">Farmer Chats</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[400px]">
                {/* Farmer Threads list */}
                <div className="border border-gray-100 rounded-2xl overflow-y-auto divide-y divide-gray-50 p-2 space-y-1 bg-gray-50/20 h-full">
                  <h3 className="font-bold text-[10px] text-gray-400 uppercase tracking-wider p-2">Active Conversations</h3>
                  {conversations.length === 0 ? (
                    <p className="text-[10px] text-gray-500 py-6 text-center">No farmer messages logged yet.</p>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.farmer._id}
                        onClick={() => setActiveFarmerId(conv.farmer._id)}
                        className={`p-3 rounded-xl cursor-pointer text-xs transition-all ${activeFarmerId === conv.farmer._id ? 'bg-primary text-white' : 'bg-white border border-gray-100 hover:bg-gray-50'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold truncate max-w-[120px]">{conv.farmer.name}</span>
                          <span className={`text-[8px] ${activeFarmerId === conv.farmer._id ? 'text-green-200' : 'text-gray-400'}`}>
                            {new Date(conv.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className={`line-clamp-1 mt-1 text-[10px] ${activeFarmerId === conv.farmer._id ? 'text-green-50' : 'text-gray-500'}`}>
                          {conv.lastMessage}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Selected Thread Messages */}
                <div className="md:col-span-2 flex flex-col border border-gray-100 rounded-2xl overflow-hidden h-full">
                  {activeFarmerId ? (
                    <>
                      {/* Thread Messages List */}
                      <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-gray-50/50 flex flex-col">
                        {messages.map((msg) => {
                          const isSelf = msg.senderId === user._id || msg.senderId?._id === user._id;
                          return (
                            <div
                              key={msg._id}
                              className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${isSelf ? 'bg-primary text-white self-end rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 self-start rounded-tl-none'}`}
                            >
                              <p>{msg.messageText}</p>
                              <span className={`text-[8px] block text-right mt-1 ${isSelf ? 'text-green-100' : 'text-gray-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Reply Input Bar */}
                      <form onSubmit={handleAdminChatSend} className="p-3 border-t border-gray-100 bg-white flex gap-2">
                        <input
                          type="text"
                          placeholder="Type reply to farmer..."
                          value={adminChatText}
                          onChange={(e) => setAdminChatText(e.target.value)}
                          className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                          type="submit"
                          className="bg-primary hover:bg-primary-dark text-white font-bold px-5 rounded-xl text-xs transition-colors shadow"
                        >
                          Reply
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-500">
                      Select a farmer thread from the panel to open active support chat.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PRODUCT REVIEWS */}
          {activeSubTab === 'reviews' && (
            <div className="space-y-6">
              <h2 className="text-base font-extrabold text-primary-dark border-b border-gray-100 pb-3">Farming Reviews & Ratings</h2>
              {allReviews.length === 0 ? (
                <p className="text-xs text-gray-500 py-12 text-center bg-gray-50 border border-dashed rounded-xl">No product reviews available.</p>
              ) : (
                <div className="space-y-3">
                  {allReviews.map((rev, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-gray-800 block">Farmer: {rev.name}</span>
                          <span className="text-[10px] text-primary-dark">Product: {rev.productName}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">{new Date(rev.createdAt || rev.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-gray-600 leading-relaxed bg-white p-2.5 rounded border border-gray-100">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Create / Edit Modal Overlay */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto text-xs my-8">
            <h3 className="font-extrabold text-sm text-primary-dark border-b border-gray-100 pb-2">
              {editingProduct ? `Edit Catalog Product: ${editingProduct.name.substring(0, 20)}...` : 'Add New Agricultural Product'}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 mb-1 font-bold">Product Name</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-bold">Category</label>
                  <select
                    value={prodCat}
                    onChange={(e) => setProdCat(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-primary text-gray-700"
                  >
                    <option>Pesticides</option>
                    <option>Insecticides</option>
                    <option>Herbicides</option>
                    <option>Fertilizers</option>
                    <option>Farming Tools</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-bold">Base Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-bold">Discount Percentage (%)</label>
                  <input
                    type="number"
                    value={prodDisc}
                    onChange={(e) => setProdDisc(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-bold">Initial Stock (units)</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-bold">Manufacturer / Brand</label>
                  <input
                    type="text"
                    value={prodManufacturer}
                    onChange={(e) => setProdManufacturer(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-bold">Batch Number</label>
                  <input
                    type="text"
                    value={prodBatch}
                    onChange={(e) => setProdBatch(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1 font-bold">Expiry Date</label>
                  <input
                    type="date"
                    value={prodExpiry}
                    onChange={(e) => setProdExpiry(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-primary text-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-bold">Product Description</label>
                <textarea
                  rows={2}
                  required
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-bold">Usage Directions / Guidelines for Farmers</label>
                <textarea
                  rows={2}
                  required
                  value={prodUsage}
                  onChange={(e) => setProdUsage(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-bold">Product Images (Upload files)</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setProdImages(e.target.files)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 outline-none cursor-pointer"
                />
                <span className="text-[10px] text-gray-400 block mt-0.5">JPEG, PNG, WebP supported. Max 5 files.</span>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProduct}
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-lg shadow"
                >
                  {submittingProduct ? 'Saving details...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Adjust Modal Overlay */}
      {adjustingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-gray-100 text-xs">
            <h3 className="font-extrabold text-sm text-primary-dark border-b border-gray-100 pb-2">Override Billing / Payments</h3>

            <div className="space-y-1.5 text-gray-600 bg-gray-50 p-3 rounded-xl">
              <div className="flex justify-between">
                <span>Order Total:</span>
                <span className="font-bold">Rs. {adjustingPayment.totalAmount}</span>
              </div>
              <div className="flex justify-between text-red-500 font-bold">
                <span>Current Pending:</span>
                <span>Rs. {adjustingPayment.pendingAmount}</span>
              </div>
            </div>

            <form onSubmit={handlePaymentAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Overwrite Paid Amount (Rs.)</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={adjustingPayment.totalAmount}
                  value={adjPaidAmt}
                  onChange={(e) => setAdjPaidAmt(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Payment Method</label>
                <select
                  value={adjMethod}
                  onChange={(e) => setAdjMethod(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary cursor-pointer text-gray-700"
                >
                  <option>COD</option>
                  <option>Mock UPI</option>
                  <option>Bank Transfer</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingPayment(null)}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdjustment}
                  className="w-1/2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-lg shadow"
                >
                  {submittingAdjustment ? 'Saving...' : 'Apply Adjustments'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
