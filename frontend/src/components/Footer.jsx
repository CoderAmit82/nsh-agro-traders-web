import React from 'react';
import { Leaf, Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const Footer = ({ setCurrentTab }) => {
  return (
    <footer className="bg-primary-dark text-gray-200 mt-auto border-t-4 border-harvest">
      {/* Banner features */}
      <div className="bg-primary border-b border-green-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-white">
          <div className="flex flex-col items-center">
            <Truck className="h-8 w-8 text-harvest mb-2" />
            <h4 className="font-bold text-sm">Super Fast Rural Delivery</h4>
            <p className="text-xs text-green-100">Quick dispatch to villages & rural hubs</p>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="h-8 w-8 text-harvest mb-2" />
            <h4 className="font-bold text-sm">100% Genuine Supplies</h4>
            <p className="text-xs text-green-100">Sourced directly from certified manufacturers</p>
          </div>
          <div className="flex flex-col items-center">
            <RefreshCw className="h-8 w-8 text-harvest mb-2" />
            <h4 className="font-bold text-sm">Easy Returns & Support</h4>
            <p className="text-xs text-green-100">Hassle-free return policy for farmers</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center">
            <Leaf className="h-6 w-6 text-harvest mr-2" />
            <span className="font-extrabold text-lg text-white">
              NSH <span className="text-harvest">Agro</span> Traders
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Empowering Indian agriculture by providing standard quality fertilizers, seeds, tools, and crop protection products directly to the farmer's doorstep.
          </p>

        </div>

        {/* Categories Quick Links */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-green-800 pb-1">
            Product Categories
          </h4>
          <ul className="space-y-2 text-xs">
            {['Pesticides', 'Insecticides', 'Herbicides', 'Fertilizers', 'Farming Tools'].map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => setCurrentTab('catalog')}
                  className="hover:text-harvest transition-colors text-gray-300"
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Informational Pages */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-green-800 pb-1">
            Farming Resources
          </h4>
          <ul className="space-y-2 text-xs text-gray-300">
            <li>
              <button onClick={() => setCurrentTab('home')} className="hover:text-harvest">
                Home
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('catalog')} className="hover:text-harvest">
                Our Products
              </button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('contact')} className="hover:text-harvest">
                Get Support
              </button>
            </li>
            <li>
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="hover:text-harvest">
                WhatsApp Agro-Care
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Center */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-green-800 pb-1">
            Store Location
          </h4>
          <ul className="space-y-3 text-xs text-gray-300">
            <li className="flex items-start">
              <MapPin className="h-4 w-4 text-harvest mr-2 flex-shrink-0 mt-0.5" />
              <span>
                village-mundela kalan, post-jaitpur, district- pilibhit, state- uttar pradesh, pincode-262001, india
              </span>
            </li>
            <li className="flex items-center">
              <Phone className="h-4 w-4 text-harvest mr-2 flex-shrink-0" />
              <span>+91 8392999611, 7900595004</span>
            </li>
            <li className="flex items-center">
              <Mail className="h-4 w-4 text-harvest mr-2 flex-shrink-0" />
              <span>nshdinesh1@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-primary-dark border-t border-green-950 py-4 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} NSH Agro Traders. All Rights Reserved. Designed for Farmers.</p>
      </div>
    </footer>
  );
};

export default Footer;
