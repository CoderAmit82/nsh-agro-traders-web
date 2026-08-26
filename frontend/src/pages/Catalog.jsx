import React, { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { API_BASE } from '../config/api';

const Catalog = ({ setCurrentTab, setSelectedProductId, categoryFilter, setCategoryFilter }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rating, setRating] = useState('');
  const [inStock, setInStock] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/products?`;
      if (categoryFilter) url += `category=${categoryFilter}&`;
      if (search) url += `search=${search}&`;
      if (minPrice) url += `minPrice=${minPrice}&`;
      if (maxPrice) url += `maxPrice=${maxPrice}&`;
      if (rating) url += `rating=${rating}&`;
      if (inStock) url += `inStock=true&`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, inStock, rating]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleResetFilters = () => {
    setCategoryFilter('');
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setInStock(false);
    // Directly fetch all
    setTimeout(() => fetchProducts(), 50);
  };

  const categories = ['Pesticides', 'Insecticides', 'Herbicides', 'Fertilizers', 'Farming Tools'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-dark">
            {categoryFilter ? `${categoryFilter} Solutions` : 'All Agricultural Supplies'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Displaying {products.length} premium grade agricultural products
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filters Sidebar */}
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-2 text-primary font-bold text-sm">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filter Products</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center space-x-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-3 pr-10 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-primary"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Category Filter */}
          <div>
            <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider mb-2">Category</h3>
            <div className="space-y-1.5">
              <label className="flex items-center text-xs text-gray-600 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={categoryFilter === ''}
                  onChange={() => setCategoryFilter('')}
                  className="rounded-full text-primary border-gray-300 focus:ring-primary h-3.5 w-3.5 mr-2"
                />
                All Categories
              </label>
              {categories.map((cat) => (
                <label key={cat} className="flex items-center text-xs text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={categoryFilter === cat}
                    onChange={() => setCategoryFilter(cat)}
                    className="rounded-full text-primary border-gray-300 focus:ring-primary h-3.5 w-3.5 mr-2"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider mb-2">Price Range (Rs.)</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs outline-none"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs outline-none"
              />
            </div>
            <button
              onClick={fetchProducts}
              className="w-full bg-primary hover:bg-primary-dark text-white text-[11px] font-bold py-2 rounded-lg mt-2 transition-colors shadow-sm"
            >
              Apply Price
            </button>
          </div>

          {/* Ratings filter */}
          <div>
            <h3 className="font-bold text-xs text-gray-700 uppercase tracking-wider mb-2">Minimum Rating</h3>
            <div className="space-y-1.5">
              {[4, 3, 2].map((stars) => (
                <label key={stars} className="flex items-center text-xs text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={rating === stars.toString()}
                    onChange={() => setRating(stars.toString())}
                    className="rounded-full text-primary border-gray-300 focus:ring-primary h-3.5 w-3.5 mr-2"
                  />
                  {stars} Stars & Above
                </label>
              ))}
            </div>
          </div>

          {/* Stock availability filter */}
          <div className="pt-2 border-t border-gray-100">
            <label className="flex items-center text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="rounded text-primary border-gray-300 focus:ring-primary h-4 w-4 mr-2"
              />
              In Stock Only
            </label>
          </div>
        </div>

        {/* Right Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="bg-gray-100 rounded-xl h-72 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center p-6 space-y-4">
              <p className="text-gray-500 font-medium text-sm">No products match your active search filters.</p>
              <button
                onClick={handleResetFilters}
                className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard
                  key={prod._id}
                  product={prod}
                  setSelectedProductId={setSelectedProductId}
                  setCurrentTab={setCurrentTab}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
