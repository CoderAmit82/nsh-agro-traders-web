import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import { Truck, CreditCard, CheckCircle2, ArrowLeft } from 'lucide-react';

const Checkout = ({ setCurrentTab }) => {
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');

  // Pre-fill address on load
  useEffect(() => {
    if (user?.address) {
      setStreet(user.address.street || '');
      setCity(user.address.city || '');
      setState(user.address.state || '');
      setZip(user.address.zip || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !zip) {
      alert('Please fill out all address details!');
      return;
    }

    setLoading(true);
    try {
      // Map cartItems to fit backend expectation
      const itemsPayload = cartItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      }));

      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: itemsPayload,
          shippingAddress: { street, city, state, zip },
          paymentMethod
        })
      });
      const data = await response.json();

      if (data.success) {
        if (paymentMethod === 'Razorpay' && data.razorpayOrder) {
          const options = {
            key: data.keyId,
            amount: data.razorpayOrder.amount,
            currency: data.razorpayOrder.currency,
            name: "NSH Agro Traders",
            description: "Purchase of Agricultural Supplies",
            order_id: data.razorpayOrder.id,
            handler: async function (response) {
              setLoading(true);
              try {
                const verifyRes = await fetch(`${API_BASE}/payments/verify-razorpay`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    orderId: data.order._id,
                    paymentId: data.payment._id
                  })
                });
                const verifyData = await verifyRes.json();
                if (verifyData.success) {
                  setCreatedOrderId(data.order._id);
                  clearCart();
                  setOrderSuccess(true);
                } else {
                  alert(verifyData.message || "Razorpay payment verification failed.");
                }
              } catch (verifyErr) {
                console.error(verifyErr);
                alert("Network error during Razorpay payment verification.");
              } finally {
                setLoading(false);
              }
            },
            prefill: {
              name: user?.name || "",
              contact: user?.mobile || "",
              email: user?.email || ""
            },
            theme: {
              color: "#15803d"
            },
            modal: {
              ondismiss: function () {
                alert("Payment cancelled. You can complete the payment later from your Dashboard under Farming Orders.");
                setCreatedOrderId(data.order._id);
                clearCart();
                setOrderSuccess(true);
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          setCreatedOrderId(data.order._id);
          clearCart();
          setOrderSuccess(true);
        }
      } else {
        alert(data.message || 'Failed to place order.');
      }
    } catch (err) {
      console.error(err);
      alert('Server error connection. Order failed.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-primary">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-primary-dark">Order Placed Successfully!</h2>
          <p className="text-xs text-gray-500">
            Thank you for buying from NSH Agro Traders! Your order reference is: <strong className="text-gray-700">{createdOrderId.substring(0, 12)}...</strong>.
          </p>
          <p className="text-xs text-gray-400">
            A PDF invoice has been compiled. You can review the shipment status and download your invoice at any time from your dashboard.
          </p>
        </div>
        <div className="flex flex-col gap-2 pt-4">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg text-xs shadow-md transition-colors w-full"
          >
            Go to Farmer Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('catalog')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg text-xs transition-colors w-full"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => setCurrentTab('cart')}
        className="flex items-center space-x-2 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Cart</span>
      </button>

      <div>
        <h1 className="text-2xl font-extrabold text-primary-dark">Checkout & Shipping</h1>
        <p className="text-xs text-gray-500 mt-1">Please confirm shipping coordinates and farm metadata</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Forms */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Shipping details */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-extrabold text-sm text-gray-800 flex items-center border-b border-gray-100 pb-3">
              <Truck className="h-4.5 w-4.5 text-primary mr-2" />
              <span>Farming Shipping Address</span>
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Street Address / Village</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Village, Landmark, Street"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-600 mb-1">City / Town</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-600 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-600 mb-1">ZIP / PIN Code</label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="PIN Code"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Farm Details Display */}
          <div className="bg-green-50/30 p-6 rounded-2xl border border-green-100/50 space-y-3">
            <h3 className="font-bold text-xs text-primary-dark uppercase tracking-wider">Registered Farm Profile</h3>
            <p className="text-[11px] text-gray-600">
              The products ordered will be tagged to your registered farm layout details:
            </p>
            <div className="grid grid-cols-3 gap-4 text-xs text-gray-700 bg-white p-4 rounded-xl border border-green-100">
              <div>
                <span className="text-[10px] text-gray-400 block">Farm Size</span>
                <span className="font-bold">{user?.farmDetails?.sizeInAcres || 0} Acres</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">Soil Type</span>
                <span className="font-bold">{user?.farmDetails?.soilType || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">Primary Crops</span>
                <span className="font-bold">{user?.farmDetails?.primaryCrops || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Payment Method selector */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="font-extrabold text-sm text-gray-800 flex items-center border-b border-gray-100 pb-3">
              <CreditCard className="h-4.5 w-4.5 text-primary mr-2" />
              <span>Payment Methods</span>
            </h2>

            <div className="space-y-3">
              <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-primary bg-green-50/20 font-bold' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-primary focus:ring-primary mr-3"
                  />
                  <div>
                    <span className="text-xs text-gray-800">Cash on Delivery (COD)</span>
                    <span className="text-[10px] text-gray-500 block font-normal">Pay in cash or UPI when products arrive at your farm.</span>
                  </div>
                </div>
              </label>

              <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'Mock UPI' ? 'border-primary bg-green-50/20 font-bold' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Mock UPI'}
                    onChange={() => setPaymentMethod('Mock UPI')}
                    className="text-primary focus:ring-primary mr-3"
                  />
                  <div>
                    <span className="text-xs text-gray-800">Mock UPI Payment Gateway</span>
                    <span className="text-[10px] text-gray-500 block font-normal">Simulate instant online payment via PhonePe/GPay.</span>
                  </div>
                </div>
              </label>

              <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'Razorpay' ? 'border-primary bg-green-50/20 font-bold' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={() => setPaymentMethod('Razorpay')}
                    className="text-primary focus:ring-primary mr-3"
                  />
                  <div>
                    <span className="text-xs text-gray-800 font-bold">Razorpay Secure Checkout</span>
                    <span className="text-[10px] text-gray-500 block font-normal">Pay securely online using Cards, Netbanking, UPI or Wallets.</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </form>

        {/* Right Column: Order Summary */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 h-fit">
          <h2 className="font-extrabold text-sm text-gray-800 border-b border-gray-100 pb-3">
            Summary & Finalize
          </h2>

          <div className="divide-y divide-gray-100 max-h-44 overflow-y-auto pr-2">
            {cartItems.map((item) => (
              <div key={item.product._id} className="py-2.5 flex justify-between text-xs text-gray-600">
                <span className="line-clamp-1 w-2/3">{item.product.name} (x{item.quantity})</span>
                <span className="font-bold">Rs. {Math.round(item.product.price * (1 - (item.product.discount || 0) / 100) * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 text-xs text-gray-700 space-y-2">
            <div className="flex justify-between font-extrabold text-sm text-gray-800 border-t border-gray-100 pt-3">
              <span>Grand Total</span>
              <span className="text-primary-dark">Rs. {Math.round(getCartTotal())}</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-lg text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? 'Processing Order...' : 'Place Agricultural Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
