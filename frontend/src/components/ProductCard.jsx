import React, { useContext, useState } from 'react';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { API_BASE, assetUrl } from '../config/api';

const ProductCard = ({ product, setSelectedProductId, setCurrentTab }) => {
  const { addToCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const [isWishlisted, setIsWishlisted] = useState(() => {
    if (!user) return false;
    // user.wishlist is array of product ids or fully populated products
    return user.wishlist?.some(id => (id._id || id) === product._id) || false;
  });
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const handleCardClick = () => {
    setSelectedProductId(product._id);
    setCurrentTab('product-details');
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (!token) {
      alert('Please Login to add products to your wishlist!');
      setCurrentTab('login');
      return;
    }
    setWishlistLoading(true);
    try {
      const response = await fetch(`${API_BASE}/products/wishlist/${product._id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setIsWishlisted(data.isWishlisted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    alert(`${product.name} added to cart successfully!`);
  };

  // Calculate final discounted price
  const discountedPrice = product.price * (1 - (product.discount || 0) / 100);

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow hover:shadow-lg border border-gray-100 overflow-hidden hover-card cursor-pointer flex flex-col relative"
    >
      {/* Discount Badge */}
      {product.discount > 0 && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
          {product.discount}% OFF
        </span>
      )}

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        disabled={wishlistLoading}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow text-gray-500 hover:text-red-500 transition-colors z-10"
      >
        <Heart
          className={`h-4.5 w-4.5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
        />
      </button>

      {/* Image container */}
      <div className="h-44 bg-green-50 flex items-center justify-center p-4 border-b border-gray-50 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={assetUrl(product.images[0])}
            alt={product.name}
            className="h-full w-full object-contain hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // fallback image if local upload not loaded
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=300';
            }}
          />
        ) : (
          <div className="flex flex-col items-center text-primary/40">
            <ShoppingCart className="h-12 w-12 stroke-[1.5]" />
            <span className="text-[10px] mt-1 text-gray-400">NSH Agro Quality</span>
          </div>
        )}
      </div>

      {/* Body Info */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-[10px] uppercase font-bold tracking-wider text-primary-DEFAULT mb-1">
          {product.category}
        </span>
        <h3 className="font-bold text-sm text-gray-800 line-clamp-2 h-10 mb-1 leading-snug">
          {product.name}
        </h3>

        {/* Rating Row */}
        <div className="flex items-center space-x-1 mb-3">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.round(product.ratings || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-500">({product.reviews?.length || 0})</span>
        </div>

        {/* Price & Cart row */}
        <div className="mt-auto flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-sm font-extrabold text-primary-dark">
                Rs. {Math.round(discountedPrice)}
              </span>
              {product.discount > 0 && (
                <span className="text-[10px] line-through text-gray-400">
                  Rs. {product.price}
                </span>
              )}
            </div>
            {product.stock <= 0 ? (
              <span className="text-[10px] text-red-500 font-bold">Out of stock</span>
            ) : product.stock < 5 ? (
              <span className="text-[10px] text-orange-500 font-bold">Only {product.stock} left</span>
            ) : (
              <span className="text-[10px] text-green-600">In Stock</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`p-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors shadow ${product.stock <= 0 ? 'bg-gray-300 cursor-not-allowed hover:bg-gray-300' : ''}`}
            title="Add to Cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
