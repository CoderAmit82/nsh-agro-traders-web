import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { User, Sprout, ShoppingBag, MessageSquare, Bell, Download, Heart, DollarSign } from 'lucide-react';

const Dashboard = ({ setCurrentTab }) => {
  const { user, token, notifications, markNotificationRead, updateProfile } = useContext(AuthContext);
  const { messages, fetchHistory, sendMessage, loadingHistory } = useContext(ChatContext);

  const [activeTab, setActiveTab] = useState('orders'); // orders, profile, chat, notifications, wishlist
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Edit Profile Inputs
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [soilType, setSoilType] = useState('');
  const [crops, setCrops] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Chat input
  const [chatInput, setChatInput] = useState('');

  // Payment Modal/State
  const [payingRecord, setPayingRecord] = useState(null); // holds Payment details
  const [payAmt, setPayAmt] = useState('');
  const [payMethod, setPayMethod] = useState('Mock UPI');
  const [payLoading, setPayLoading] = useState(false);

  // Load profile inputs on user load
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setMobile(user.mobile || '');
      setStreet(user.address?.street || '');
      setCity(user.address?.city || '');
      setState(user.address?.state || '');
      setZip(user.address?.zip || '');
      setFarmSize(user.farmDetails?.sizeInAcres || '');
      setSoilType(user.farmDetails?.soilType || '');
      setCrops(user.farmDetails?.primaryCrops || '');
    }
  }, [user]);

  // Load orders and payments
  const fetchOrdersAndPayments = async () => {
    if (!token) return;
    setOrdersLoading(true);
    try {
      // 1. Fetch Orders
      const orderRes = await fetch('http://localhost:5000/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orderData = await orderRes.json();

      // 2. Fetch Payments
      const payRes = await fetch('http://localhost:5000/api/payments/my-payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payData = await payRes.json();

      if (orderData.success) setOrders(orderData.orders);
      if (payData.success) setPayments(payData.payments);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!token) return;
    setWishlistLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/products/wishlist/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setWishlist(data.wishlist);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrdersAndPayments();
      fetchHistory('admin'); // load chat history
      fetchWishlist();
    }
  }, [token, activeTab]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);

    const payload = {
      name,
      mobile,
      address: { street, city, state, zip },
      farmDetails: { sizeInAcres: Number(farmSize), soilType, primaryCrops: crops }
    };

    const result = await updateProfile(payload);
    setProfileLoading(false);

    if (result.success) {
      alert('Profile & Farm configurations saved successfully!');
    } else {
      alert(result.message || 'Profile save failed.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const res = await sendMessage(chatInput);
    if (res.success) {
      setChatInput('');
    } else {
      alert('Failed to send message: ' + res.message);
    }
  };

  const handleInvoiceDownload = async (orderId, invoiceFileName) => {
    if (!invoiceFileName) {
      alert('Invoice is not generated for this order yet.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Invoice file not found on server.');
      }

      // Convert response to blob for download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', invoiceFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(err.message);
    }
  };

  // Execute Mock Payment
  const handleMockPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payAmt || Number(payAmt) <= 0) return;

    setPayLoading(true);
    try {
      if (payMethod === 'Razorpay') {
        const response = await fetch(`http://localhost:5000/api/payments/razorpay-order/${payingRecord._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ amount: Number(payAmt) })
        });
        const data = await response.json();

        if (data.success) {
          const options = {
            key: data.keyId,
            amount: data.razorpayOrder.amount,
            currency: data.razorpayOrder.currency,
            name: "NSH Agro Traders",
            description: "Agricultural Order Balance Payment",
            order_id: data.razorpayOrder.id,
            handler: async function (response) {
              setPayLoading(true);
              try {
                const verifyRes = await fetch('http://localhost:5000/api/payments/verify-razorpay', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    orderId: payingRecord.orderId?._id || payingRecord.orderId,
                    paymentId: payingRecord._id
                  })
                });
                const verifyData = await verifyRes.json();
                if (verifyData.success) {
                  alert(`Payment balance paid successfully! Transaction reference: ${verifyData.transactionId}`);
                  setPayingRecord(null);
                  setPayAmt('');
                  fetchOrdersAndPayments();
                } else {
                  alert(verifyData.message || "Razorpay payment verification failed.");
                }
              } catch (verifyErr) {
                console.error(verifyErr);
                alert("Network error during Razorpay payment verification.");
              } finally {
                setPayLoading(false);
              }
            },
            prefill: {
              name: user?.name || "",
              contact: user?.mobile || "",
              email: user?.email || ""
            },
            theme: {
              color: "#15803d"
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          alert(data.message || 'Failed to create Razorpay payment order.');
        }
      } else {
        const response = await fetch(`http://localhost:5000/api/payments/pay/${payingRecord._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ amount: Number(payAmt), paymentMethod: payMethod })
        });
        const data = await response.json();

        if (data.success) {
          alert(`Payment successful! Transaction reference: ${data.transactionId}`);
          setPayingRecord(null);
          setPayAmt('');
          fetchOrdersAndPayments();
        } else {
          alert(data.message || 'Payment processing failed.');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Payment server offline.');
    } finally {
      setPayLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-gray-500 font-bold">Please log in to view your Farmer Dashboard.</p>
        <button
          onClick={() => setCurrentTab('login')}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2 rounded-lg text-xs"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile summary */}
      <div className="bg-gradient-to-r from-primary-dark to-primary text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="bg-white/10 p-4 rounded-full border border-white/20">
            <User className="h-10 w-10 text-harvest fill-harvest/25" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">{user.name}</h1>
            <p className="text-xs text-green-100 flex items-center mt-1">
              <Sprout className="h-3.5 w-3.5 mr-1" />
              <span>Registered Farmer | Soil Type: {user.farmDetails?.soilType || 'N/A'}</span>
            </p>
          </div>
        </div>
        <div className="bg-white/15 px-5 py-3 rounded-2xl border border-white/10 text-xs flex gap-6">
          <div>
            <span className="text-green-200 block text-[10px]">Registered Phone</span>
            <span className="font-bold">{user.mobile}</span>
          </div>
          <div className="border-l border-white/20 pl-6">
            <span className="text-green-200 block text-[10px]">Farm Size</span>
            <span className="font-bold">{user.farmDetails?.sizeInAcres || 0} Acres</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Tabs Sidebar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-fit space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'orders' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            <span>Farming Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'profile' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Sprout className="h-4.5 w-4.5" />
            <span>Profile & Farm Details</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'chat' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <MessageSquare className="h-4.5 w-4.5" />
            <span>Support Chat Desk</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'notifications' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Bell className="h-4.5 w-4.5" />
            <span>Alerts & Notifications</span>
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'wishlist' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Heart className="h-4.5 w-4.5" />
            <span>Wishlist</span>
          </button>
        </div>

        {/* Tab View Container */}
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-[400px]">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-base font-extrabold text-primary-dark border-b border-gray-100 pb-3">Your Orders</h2>
              {ordersLoading ? (
                <div className="text-center py-12 text-xs text-gray-500 animate-pulse">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                  No orders placed yet. Visit the catalog to buy seeds & insecticides!
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => {
                    const paymentRecord = payments.find(p => p.orderId?._id === ord._id || p.orderId === ord._id);
                    return (
                      <div key={ord._id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:border-green-100 transition-all">
                        {/* Order Header */}
                        <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-2 text-xs">
                          <div>
                            <span className="text-gray-400 block text-[10px]">ORDER ID</span>
                            <span className="font-bold text-gray-700">{ord._id}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px]">DATE PLACED</span>
                            <span className="font-bold text-gray-700">{new Date(ord.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px]">TOTAL VALUE</span>
                            <span className="font-extrabold text-primary-dark">Rs. {ord.totalAmount}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${ord.status === 'Delivered' ? 'bg-green-100 text-green-700' : ord.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {ord.status}
                          </span>
                        </div>

                        {/* Order Items */}
                        <div className="p-4 divide-y divide-gray-50 text-xs">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="py-2.5 flex justify-between items-center gap-4">
                              <div>
                                <span className="font-bold text-gray-800 line-clamp-1">{item.product?.name || 'Agro Product'}</span>
                                <span className="text-[10px] text-gray-400">Qty: {item.quantity} x Rs. {item.priceAtPurchase}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Action Footer */}
                        <div className="bg-green-50/20 p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                          {/* Invoice PDF download */}
                          <button
                            onClick={() => handleInvoiceDownload(ord._id, ord.invoiceFileName)}
                            className="text-xs font-bold text-primary hover:text-primary-dark flex items-center space-x-1 border border-primary/25 bg-white py-1.5 px-3 rounded-lg hover:bg-green-50 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download Invoice PDF</span>
                          </button>

                          {/* Payment Balance Info */}
                          {paymentRecord && (
                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                              <div className="text-right">
                                <span className="text-[10px] text-gray-400 block">PENDING BALANCE</span>
                                <span className={`font-bold ${paymentRecord.pendingAmount > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                  Rs. {paymentRecord.pendingAmount}
                                </span>
                              </div>
                              {paymentRecord.pendingAmount > 0 ? (
                                <button
                                  onClick={() => setPayingRecord(paymentRecord)}
                                  className="bg-harvest hover:bg-orange-600 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] shadow"
                                >
                                  Pay Balance Online
                                </button>
                              ) : (
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">Paid</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PROFILE & FARM DETAILS TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-base font-extrabold text-primary-dark border-b border-gray-100 pb-3">
                Edit Farm & Profile Coordinates
              </h2>
              <form onSubmit={handleProfileSubmit} className="space-y-6 text-xs">
                {/* Credentials */}
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">Contact details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-600 mb-1">Farmer Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Mobile Number</label>
                      <input
                        type="text"
                        required
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <h3 className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">Shipping Address</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-4">
                      <label className="block text-gray-600 mb-1">Street / Village</label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-gray-600 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">PIN Code</label>
                      <input
                        type="text"
                        required
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Farm Metadata */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <h3 className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">Registered Farming Metadata</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-600 mb-1">Farm Area Size (Acres)</label>
                      <input
                        type="number"
                        value={farmSize}
                        onChange={(e) => setFarmSize(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Soil Composition</label>
                      <select
                        value={soilType}
                        onChange={(e) => setSoilType(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary text-gray-700"
                      >
                        <option>Black Cotton Soil</option>
                        <option>Red Sandy Loam</option>
                        <option>Clay Loam</option>
                        <option>Alluvial Soil</option>
                        <option>Laterite Soil</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Primary Season Crops</label>
                      <input
                        type="text"
                        value={crops}
                        onChange={(e) => setCrops(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg shadow transition-colors"
                >
                  {profileLoading ? 'Saving Profile...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* SUPPORT CHAT TAB */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-extrabold text-primary-dark">Direct Support Chat Desk</h2>
                  <p className="text-[10px] text-gray-400">Ask us for fertilizers guidelines or invoice queries</p>
                </div>
              </div>

              {/* Chat messages container */}
              <div className="h-64 border border-gray-100 bg-gray-50/50 rounded-2xl p-4 overflow-y-auto space-y-3 flex flex-col">
                {loadingHistory ? (
                  <div className="text-center py-6 text-xs text-gray-500 animate-pulse m-auto">Loading message history...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-500 m-auto max-w-xs">
                    No support chat logged yet. Send a message below to reach NSH Agro admin staff!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSelf = msg.senderId === user._id || msg.senderId?._id === user._id;
                    return (
                      <div
                        key={msg._id}
                        className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed ${isSelf ? 'bg-primary text-white self-end rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 self-start rounded-tl-none'}`}
                      >
                        <p>{msg.messageText}</p>
                        <span className={`text-[8px] block text-right mt-1 ${isSelf ? 'text-green-200' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input bar */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type message regarding crops/supplies..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white font-bold px-5 rounded-xl text-xs transition-colors shadow"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-base font-extrabold text-primary-dark border-b border-gray-100 pb-3">Alert Inbox</h2>
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                  No payment alerts or status updates.
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => !notif.isRead && markNotificationRead(notif._id)}
                      className={`p-4 rounded-xl border flex items-start gap-4 transition-colors cursor-pointer ${!notif.isRead ? 'bg-green-50/20 border-green-200 font-medium' : 'bg-gray-50/50 border-gray-100'}`}
                    >
                      <Bell className={`h-5 w-5 mt-0.5 flex-shrink-0 ${notif.type === 'Payment Reminder' ? 'text-red-500' : 'text-primary'}`} />
                      <div className="text-xs space-y-1 w-full">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-800">{notif.title}</span>
                          <span className="text-[10px] text-gray-400">{new Date(notif.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">{notif.message}</p>
                        {!notif.isRead && (
                          <span className="text-[9px] text-primary font-bold block pt-1">Click to mark as read</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-base font-extrabold text-primary-dark border-b border-gray-100 pb-3">Your Wishlist</h2>
              {wishlistLoading ? (
                <div className="text-center py-12 text-xs text-gray-500 animate-pulse">Loading wishlist...</div>
              ) : wishlist.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                  No products added to wishlist yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {wishlist.map((prod) => (
                    <div
                      key={prod._id}
                      onClick={() => {
                        setCurrentTab('product-details');
                      }}
                      className="border border-gray-100 rounded-xl p-3 bg-gray-50 hover:bg-green-50/10 cursor-pointer flex flex-col items-center justify-between shadow-sm hover:shadow"
                    >
                      <img
                        src={prod.images?.[0] ? `http://localhost:5000${prod.images[0]}` : 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=150'}
                        alt={prod.name}
                        className="h-20 w-20 object-contain mb-2"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=150';
                        }}
                      />
                      <h3 className="font-bold text-[10px] text-gray-800 text-center line-clamp-2 h-7">{prod.name}</h3>
                      <span className="text-[10px] font-extrabold text-primary-dark mt-1">Rs. {prod.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mock Payment Gateway Modal Overlay */}
      {payingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-gray-100 animate-scaleIn text-xs">
            <div className="flex items-center space-x-2 text-primary border-b border-gray-100 pb-3">
              <DollarSign className="h-5 w-5 bg-primary-light rounded-full p-1" />
              <h3 className="font-extrabold text-sm text-gray-800">Execute Online Payment</h3>
            </div>

            <div className="space-y-1.5 text-gray-600 bg-gray-50 p-3 rounded-xl">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-bold">Rs. {payingRecord.totalAmount}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Amount Paid:</span>
                <span className="font-bold">Rs. {payingRecord.paidAmount}</span>
              </div>
              <div className="flex justify-between text-red-500 border-t border-gray-200/50 pt-1 font-bold">
                <span>Pending Balance:</span>
                <span>Rs. {payingRecord.pendingAmount}</span>
              </div>
            </div>

            <form onSubmit={handleMockPaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Payment Amount (Rs.)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={payingRecord.pendingAmount}
                  placeholder={`Max Rs. ${payingRecord.pendingAmount}`}
                  value={payAmt}
                  onChange={(e) => setPayAmt(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Select Gateway Provider</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary cursor-pointer text-gray-700 font-bold"
                >
                  <option value="Mock UPI">Mock UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Razorpay">Razorpay Payment Gateway</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingRecord(null)}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-lg text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payLoading}
                  className="w-1/2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-lg shadow"
                >
                  {payLoading ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
