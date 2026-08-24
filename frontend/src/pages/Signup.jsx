import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Leaf, User, Mail, Lock, Phone, MapPin, Sprout, Eye, EyeOff } from 'lucide-react';

const Signup = ({ setCurrentTab }) => {
  const { signup, error } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mobile, setMobile] = useState('');

  // Address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  // Farm Details
  const [size, setSize] = useState('');
  const [soilType, setSoilType] = useState('Clay Loam');
  const [crops, setCrops] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const address = { street, city, state, zip };
    const farmDetails = { sizeInAcres: Number(size), soilType, primaryCrops: crops };

    const result = await signup(name, email, password, mobile, address, farmDetails);
    setLoading(false);

    if (result.success) {
      alert('Farmer account created successfully! Welcome to NSH Agro Traders.');
      setCurrentTab('home');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-green-50/10">
      <div className="max-w-2xl w-full bg-white p-8 rounded-3xl border border-gray-100 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-primary-light rounded-full text-primary">
            <Leaf className="h-8 w-8 text-primary fill-primary-light" />
          </div>
          <h2 className="text-2xl font-black text-primary-dark font-sans">Register Farmer Profile</h2>
          <p className="text-xs text-gray-500">Create a secure farmer account to unlock online orders and invoices</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-semibold text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Credentials */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-primary uppercase tracking-wider flex items-center">
              <User className="h-4 w-4 mr-1.5" />
              <span>1. Contact & Credentials</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Farmer Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ramesh Kumar"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Mobile Number</label>
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Secure Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 pr-10 text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-3.5 p-1 text-gray-500"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password.length > 0 && password.length < 8 && (
                  <p className="text-xs text-red-600 mt-1">Password must be at least 8 characters.</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Address */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-extrabold text-primary uppercase tracking-wider flex items-center">
              <MapPin className="h-4 w-4 mr-1.5" />
              <span>2. Delivery Address</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-600">Street / Village / Landmark</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Plot/Flat/Village name"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                <div>
                  <label className="text-xs font-bold text-gray-600">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Town"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">ZIP Code</label>
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

          {/* Section 3: Farm Details */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-extrabold text-primary uppercase tracking-wider flex items-center">
              <Sprout className="h-4 w-4 mr-1.5" />
              <span>3. Farm Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Farm Size (Acres)</label>
                <input
                  type="number"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Soil Type</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary cursor-pointer text-gray-700"
                >
                  <option>Black Cotton Soil</option>
                  <option>Red Sandy Loam</option>
                  <option>Clay Loam</option>
                  <option>Alluvial Soil</option>
                  <option>Laterite Soil</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Primary Crops</label>
                <input
                  type="text"
                  value={crops}
                  onChange={(e) => setCrops(e.target.value)}
                  placeholder="Wheat, Cotton, Rice"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg text-xs shadow-md transition-all hover:scale-[1.01]"
          >
            {loading ? 'Registering Account...' : 'Complete Farmer Registration'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Already have a farmer account?{' '}
            <button
              onClick={() => setCurrentTab('login')}
              className="text-primary font-bold hover:underline bg-transparent border-none p-0 outline-none"
            >
              Sign In Here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
