import React, { useContext } from 'react';
import { ShoppingCart, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Cart = ({ setCurrentTab }) => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const handleCheckoutClick = () => {
    if (!user) {
      alert('You must create a Farmer account or Login before checkout!');
      setCurrentTab('login');
    } else {
      setCurrentTab('checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-primary/40">
          <ShoppingCart className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-primary-dark">Your Farming Cart is Empty</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You haven't added any insecticides, fertilizers, or farming equipment to your shopping cart yet.
          </p>
        </div>
        <button
          onClick={() => setCurrentTab('catalog')}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-lg text-xs shadow-md transition-colors inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Browse Products</span>
        </button>
      </div>
    );
  }

  // Calculate original value to show total savings
  const originalTotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const savings = originalTotal - getCartTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary-dark">Shopping Cart</h1>
        <p className="text-xs text-gray-500 mt-1">Review the seed/tool quantities before placing your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {cartItems.map((item) => {
              const discountedPrice = item.product.price * (1 - (item.product.discount || 0) / 100);
              return (
                <div key={item.product._id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Left: Product Info */}
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-green-50 rounded-lg flex items-center justify-center p-2 border border-gray-50 flex-shrink-0">
                      <img
                        src={item.product.images?.[0] ? `http://localhost:5000${item.product.images[0]}` : 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=150'}
                        alt={item.product.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=150';
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-primary">
                        {item.product.category}
                      </span>
                      <h3 className="font-bold text-xs text-gray-800 line-clamp-1">
                        {item.product.name}
                      </h3>
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="text-xs font-bold text-primary-dark">
                          Rs. {Math.round(discountedPrice)}
                        </span>
                        {item.product.discount > 0 && (
                          <span className="text-[10px] line-through text-gray-400">
                            Rs. {item.product.price}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-400 block mt-1">Stock Available: {item.product.stock} units</span>
                    </div>
                  </div>

                  {/* Right: Quantity Controls & Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        className="px-2 py-1 text-xs font-extrabold hover:bg-gray-200 transition-colors border-r"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-bold text-gray-700">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        className="px-2 py-1 text-xs font-extrabold hover:bg-gray-200 transition-colors border-l"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[70px]">
                      <span className="text-xs text-gray-400 block">Total</span>
                      <span className="text-xs font-extrabold text-gray-800">
                        Rs. {Math.round(discountedPrice * item.quantity)}
                      </span>
                    </div>

                    {/* Trash */}
                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove product"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue button */}
          <button
            onClick={() => setCurrentTab('catalog')}
            className="text-xs font-bold text-primary hover:text-primary-dark flex items-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Add More Farm Supplies</span>
          </button>
        </div>

        {/* Checkout Summary Sidebar */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 h-fit">
          <h2 className="font-extrabold text-sm text-gray-800 border-b border-gray-100 pb-3">
            Farming Order Summary
          </h2>

          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Items Total Value</span>
              <span>Rs. {Math.round(originalTotal)}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-red-500 font-medium">
                <span>Farming Coupon Discount</span>
                <span>- Rs. {Math.round(savings)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <span>Shipping / Delivery Charge</span>
              <span className="text-green-600 font-bold">FREE</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3 font-extrabold text-sm text-gray-800">
              <span>Net Payable Amount</span>
              <span className="text-primary-dark">Rs. {Math.round(getCartTotal())}</span>
            </div>
          </div>

          <button
            onClick={handleCheckoutClick}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
          >
            <span>Proceed to Billing Address</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
