import React, { useEffect, useState, useContext } from 'react';
import { ArrowLeft, ShoppingCart, Star, MessageSquare, BookOpen, Calendar, Milestone, ShieldCheck } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { API_BASE, assetUrl } from '../config/api';

const ProductDetails = ({ productId, setSelectedProductId, setCurrentTab }) => {
  const { addToCart } = useContext(CartContext);
  const { token, user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('usage'); // usage, details, reviews
  const [submitLoading, setSubmitLoading] = useState(false);

  // Review form inputs
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/products/${productId}`);
      const data = await response.json();
      if (data.success) {
        setProduct(data.product);

        // Fetch related products in the same category
        const relResponse = await fetch(`${API_BASE}/products?category=${data.product.category}`);
        const relData = await relResponse.json();
        if (relData.success) {
          // Filter out the current product and take top 4
          setRelatedProducts(relData.products.filter(p => p._id !== data.product._id).slice(0, 4));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      alert(`${quantity} unit(s) of ${product.name} added to cart!`);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please Login to submit a review!');
      setCurrentTab('login');
      return;
    }

    if (!reviewComment.trim()) {
      alert('Please provide a comment!');
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await fetch(`${API_BASE}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
      });
      const data = await response.json();
      if (data.success) {
        alert('Review submitted successfully!');
        setReviewComment('');
        fetchProductDetails(); // refresh details
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error(err);
      alert('Server connection error. Review failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-primary font-bold animate-pulse">
        Loading product information...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-red-500 font-bold">
        Product not found!
      </div>
    );
  }

  const discountedPrice = product.price * (1 - (product.discount || 0) / 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back Button */}
      <button
        onClick={() => setCurrentTab('catalog')}
        className="flex items-center space-x-2 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Catalog</span>
      </button>

      {/* Main product display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        {/* Left Column: Images */}
        <div className="bg-green-50/50 rounded-2xl p-8 flex items-center justify-center border border-gray-50 h-[380px] overflow-hidden">
          <img
            src={product.images?.[0] ? assetUrl(product.images[0]) : 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400'}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400';
            }}
          />
        </div>

        {/* Right Column: Info */}
        <div className="space-y-6 flex flex-col justify-center">
          <div className="space-y-2">
            <span className="bg-primary-light text-primary-dark text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 leading-tight">{product.name}</h1>

            {/* Ratings row */}
            <div className="flex items-center space-x-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4.5 w-4.5 ${i < Math.round(product.ratings || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-500">
                {product.ratings || '0.0'} ({product.reviews?.length || 0} customer reviews)
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">{product.description}</p>

          {/* Pricing Box */}
          <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 block">Offer Price</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-primary-dark">Rs. {Math.round(discountedPrice)}</span>
                {product.discount > 0 && (
                  <span className="text-xs line-through text-gray-400">Rs. {product.price}</span>
                )}
              </div>
            </div>
            {product.discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">
                Save {product.discount}%
              </span>
            )}
          </div>

          {/* Action Row */}
          {product.stock > 0 ? (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-2 text-sm font-extrabold transition-colors border-r"
                >
                  -
                </button>
                <span className="px-5 py-2 text-xs font-bold text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-2 text-sm font-extrabold transition-colors border-l"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-grow bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-colors shadow flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Farming Cart</span>
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full bg-gray-300 text-gray-600 font-bold py-3 rounded-lg cursor-not-allowed"
            >
              Temporarily Out of Stock
            </button>
          )}

          {/* Extra Badges */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-[11px] text-gray-600">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Certified Agri Product</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>
                Expiry: {product.manufacturingDetails?.expiryDate ? new Date(product.manufacturingDetails.expiryDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="space-y-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('usage')}
            className={`pb-4 px-6 font-bold text-xs uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all ${activeTab === 'usage' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Usage Directions</span>
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-4 px-6 font-bold text-xs uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            <Milestone className="h-4 w-4" />
            <span>Manufacturing Details</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 px-6 font-bold text-xs uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Reviews ({product.reviews?.length || 0})</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          {activeTab === 'usage' && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-primary-dark">How to use {product.name}:</h3>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-green-50/20 p-4 rounded-xl border border-green-100/50">
                {product.usageDetails}
              </p>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4 max-w-md">
              <h3 className="font-bold text-sm text-primary-dark">Product Specifications:</h3>
              <table className="min-w-full text-xs text-gray-700">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 font-bold text-gray-500 w-1/2">Manufacturer</td>
                    <td className="py-2.5">{product.manufacturingDetails?.manufacturer || 'NSH Quality Source'}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 font-bold text-gray-500">Batch Number</td>
                    <td className="py-2.5">{product.manufacturingDetails?.batchNumber || 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2.5 font-bold text-gray-500">Expiry Date</td>
                    <td className="py-2.5">
                      {product.manufacturingDetails?.expiryDate ? new Date(product.manufacturingDetails.expiryDate).toLocaleDateString() : 'No Expiry'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-gray-500">Package Base Category</td>
                    <td className="py-2.5">{product.category}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Reviews List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-sm text-gray-800">What Farmers say:</h3>
                {product.reviews?.length === 0 ? (
                  <p className="text-xs text-gray-500 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
                    No reviews yet for this product. Be the first to share your crop experience!
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                    {product.reviews.map((rev) => (
                      <div key={rev._id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-800">{rev.name}</span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(rev.createdAt || rev.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-600">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Review Form */}
              <div className="bg-green-50/30 p-6 rounded-2xl border border-green-100/50">
                <h3 className="font-bold text-sm text-primary-dark mb-4">Add Your Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Your Rating</label>
                    <div className="flex items-center space-x-1.5">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setReviewRating(val)}
                          className="text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`h-6 w-6 ${val <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Farming Review / Comments</label>
                    <textarea
                      rows={3}
                      placeholder="How did this product perform? Share your results..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-lg text-xs transition-colors shadow"
                  >
                    {submitLoading ? 'Submitting Review...' : 'Submit Crop Review'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-primary-dark">Related Solutions</h2>
            <p className="text-xs text-gray-500">Other products matching the {product.category} category</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                setSelectedProductId={setSelectedProductId}
                setCurrentTab={setCurrentTab}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
