import React, { useEffect, useState } from 'react';
import { Sprout, ShieldAlert, Award, ArrowRight, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { API_BASE } from '../config/api';

const Home = ({ setCurrentTab, setSelectedProductId, setCategoryFilter }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch(`${API_BASE}/products`);
        const data = await response.json();
        if (data.success) {
          // Take top 4 items for featured
          setFeaturedProducts(data.products.slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleCategoryClick = (categoryName) => {
    setCategoryFilter(categoryName);
    setCurrentTab('catalog');
  };

  const categories = [
    { name: 'Pesticides', image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=150', count: '10+ Items' },
    { name: 'Insecticides', image: 'https://images.unsplash.com/photo-1574351881292-124b815340eb?auto=format&fit=crop&q=80&w=150', count: '12+ Items' },
    { name: 'Herbicides', image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=150', count: '8+ Items' },
    { name: 'Fertilizers', image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=150', count: '15+ Items' },
    { name: 'Farming Tools', image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=150', count: '20+ Items' }
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section
        className="relative text-white py-20 px-4 overflow-hidden rounded-b-[40px] shadow-lg bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom right, rgba(21, 128, 61, 0.85), rgba(6, 78, 59, 0.92)), url('/banner.jpg')`
        }}
      >
        {/* Decorative Leaf Graphic */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-20 translate-y-20">
          <Sprout className="h-96 w-96" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
          <div className="space-y-6">
            <span className="bg-harvest text-white text-xs uppercase font-extrabold px-3 py-1.5 rounded-full shadow-sm">
              Direct Farmer Marketplace
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Grow More, Earn More with <span className="text-harvest">NSH Agro</span>
            </h1>
            <p className="text-sm text-green-50 leading-relaxed max-w-lg">
              Get genuine fertilizers, highly effective insecticides, pesticides, herbicides, and state of the art tools delivered directly to your fields. Sourced from authorized suppliers.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => handleCategoryClick('')}
                className="bg-harvest hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-lg shadow-md transition-all hover:scale-105 flex items-center"
              >
                <span>Shop Marketplace</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentTab('contact')}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Get Farming Advice
              </button>
            </div>
          </div>
          <div className="hidden md:block relative">
            <img
              src="/img1.png"
              alt="Farmer using machinery"
              className="rounded-3xl shadow-2xl border-4 border-white/15"
            />
          </div>
        </div>
      </section>

      {/* Feature Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl flex items-start space-x-4 border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow">
          <Sprout className="h-10 w-10 text-primary flex-shrink-0" />
          <div>
            <h3 className="font-bold text-base text-gray-800">Organic Farming Support</h3>
            <p className="text-xs text-gray-600 mt-1">Wide range of bio-organic fertilizers and biological weed control agents.</p>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl flex items-start space-x-4 border-l-4 border-harvest shadow-sm hover:shadow-md transition-shadow">
          <Award className="h-10 w-10 text-harvest flex-shrink-0" />
          <div>
            <h3 className="font-bold text-base text-gray-800">Government Certified</h3>
            <p className="text-xs text-gray-600 mt-1">All chemicals comply with current safety standards and expiry regulations.</p>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl flex items-start space-x-4 border-l-4 border-red-500 shadow-sm hover:shadow-md transition-shadow">
          <ShieldAlert className="h-10 w-10 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-base text-gray-800">Expert Crop Protection</h3>
            <p className="text-xs text-gray-600 mt-1">Need help deciding? Contact NSH experts directly via chat or call.</p>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-dark">Browse Crop Solutions</h2>
          <p className="text-xs text-gray-600 max-w-md mx-auto">Select a category to view customized agricultural tools and crop nutrients.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center cursor-pointer hover:border-primary-light hover:shadow-md hover:scale-105 transition-all"
            >
              <div className="h-20 w-20 mx-auto rounded-full overflow-hidden mb-3 border-2 border-green-100">
                <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
              </div>
              <h3 className="font-bold text-sm text-gray-800">{cat.name}</h3>
              <span className="text-[10px] text-gray-500 block mt-0.5">{cat.count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Hot Deals / Newest Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-primary-dark">Newest Arrivals</h2>
            <p className="text-xs text-gray-600">Stock updated weekly with genuine supplies</p>
          </div>
          <button
            onClick={() => handleCategoryClick('')}
            className="text-xs font-bold text-primary hover:text-primary-dark flex items-center"
          >
            <span>View All Products</span>
            <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="bg-gray-100 rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm bg-white rounded-2xl border border-dashed border-gray-200">
            No products found. Run backend seeder to load data!
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                setSelectedProductId={setSelectedProductId}
                setCurrentTab={setCurrentTab}
              />
            ))}
          </div>
        )}
      </section>

      {/* Testimonial / Farming Advisory banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-3xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-primary-dark leading-snug">
              Unsure which Pesticide or Fertilizer matches your crop?
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed">
              We provide free consultation services. Upload details of your soil or crop pest infection directly to our support messaging desk. Our agriculture professionals will analyze it and suggest the exact products you need.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <button
                onClick={() => setCurrentTab('contact')}
                className="bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 rounded-lg text-xs shadow-md transition-colors"
              >
                Ask NSH Agro Experts
              </button>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="bg-[#25D366] hover:bg-[#1ebd54] text-white font-bold px-5 py-2.5 rounded-lg text-xs shadow-md transition-colors inline-block"
              >
                WhatsApp Us Now
              </a>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100/50 space-y-4 relative">
            <div className="absolute top-4 right-4 text-emerald-100 pointer-events-none">
              <Star className="h-16 w-16 fill-emerald-100 text-emerald-100" />
            </div>
            <div className="flex items-center space-x-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <blockquote className="text-xs text-gray-600 italic leading-relaxed">
              "WeedOut Selective herbicide saved my wheat crop this season. I ordered 5 bottles and it was delivered to Rampur village in less than 48 hours. Best service for farmers!"
            </blockquote>
            <div>
              <h4 className="font-bold text-xs text-gray-800">Sardar Baldev Singh</h4>
              <span className="text-[10px] text-gray-400">Wheat Farmer, 10 Acres - Bhatinda</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
