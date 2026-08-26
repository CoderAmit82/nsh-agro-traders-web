import React, { useState, useContext } from 'react';
import { Phone, Mail, MapPin, Send, MessageCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE } from '../config/api';

const Contact = ({ setCurrentTab }) => {
  const { token, user } = useContext(AuthContext);

  const [name, setName] = useState(user ? user.name : '');
  const [mobile, setMobile] = useState(user ? user.mobile : '');
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendChannel, setSendChannel] = useState('whatsapp');

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setLoading(true);

    const queryInfo = `[CONTACT FORM INQUIRY] Channel: ${sendChannel}. Mobile: ${mobile}. Message: ${messageText}`;

    // 1. If logged in, save to backend support message desk first
    if (token) {
      try {
        await fetch(`${API_BASE}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ messageText: queryInfo })
        });
      } catch (err) {
        console.error('Failed to log message in db:', err);
      }
    }

    // 2. Perform direct routing to admin channels
    const formattedText = `Hello NSH Agro Traders,\nMy Name: ${name}\nMobile: ${mobile}\nQuery/Crop Details: ${messageText}`;

    if (sendChannel === 'whatsapp') {
      const adminPhone = "918392999611"; // Admin's WhatsApp number
      const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(formattedText)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      const adminEmail = "nshdinesh1@gmail.com"; // Gmail Account
      const subject = `Support Query from ${name}`;
      const mailtoUrl = `mailto:${adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formattedText)}`;
      window.location.href = mailtoUrl;
    }

    setLoading(false);
    setMessageText('');
    if (token) {
      setCurrentTab('dashboard');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold text-primary-dark">Contact NSH Agro Traders</h1>
        <p className="text-xs text-gray-500">
          We are open 7 days a week to support our farming community. Feel free to visit, call, or message us.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4">
            <div className="bg-green-50 p-3 rounded-xl text-primary flex-shrink-0">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-800">Phone Support</h3>
              <p className="text-xs text-gray-600 mt-1">Directly speak to our sales managers:</p>
              <div className="text-sm font-extrabold text-primary-dark mt-1 flex flex-wrap gap-1">
                <a href="tel:+918392999611" className="hover:underline">+91 8392999611</a>
                <span>, </span>
                <a href="tel:+917900595004" className="hover:underline">7900595004</a>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4">
            <div className="bg-green-50 p-3 rounded-xl text-primary flex-shrink-0">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-800">Email Address</h3>
              <p className="text-xs text-gray-600 mt-1">Send us your soil test reports or license queries:</p>
              <a href="mailto:nshdinesh1@gmail.com" className="text-sm font-extrabold text-primary-dark hover:underline block mt-1">
                nshdinesh1@gmail.com
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4">
            <div className="bg-green-50 p-3 rounded-xl text-primary flex-shrink-0">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-800">Shop Location</h3>
              <p className="text-xs text-gray-600 mt-1">village-mundela kalan, post-jaitpur, district- pilibhit, state- uttar pradesh, pincode-262001, india</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 text-center space-y-4">
            <h3 className="font-extrabold text-xs text-primary-dark uppercase tracking-wider">Fast WhatsApp Connect</h3>
            <p className="text-[11px] text-gray-600">
              Chat directly with our agronomy consultant for crop guidance and bulk order discounts.
            </p>
            <a
              href="https://wa.me/918392999611?text=Hello%20NSH%20Agro%20Traders,%20I%20have%20an%20inquiry%20regarding%20fertilizer%20prices."
              target="_blank"
              rel="noreferrer"
              className="bg-[#25D366] hover:bg-[#1ebd54] text-white font-bold py-3 px-6 rounded-xl text-xs shadow-md transition-colors w-full flex items-center justify-center space-x-2"
            >
              <MessageCircle className="h-5 w-5 fill-white text-[#25D366]" />
              <span>Connect on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div>
            <h2 className="font-extrabold text-lg text-primary-dark">Send Online Message</h2>
            <p className="text-xs text-gray-500 mt-1">Submit your fertilizer requests or tool inquiries below</p>
          </div>

          <form onSubmit={handleMessageSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  disabled={!!user}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Mobile number"
                  disabled={!!user}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Preferred Transmission Channel</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-colors text-xs ${sendChannel === 'whatsapp' ? 'border-primary bg-green-50/20 font-bold text-primary-dark' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                  <input
                    type="radio"
                    name="sendChannel"
                    checked={sendChannel === 'whatsapp'}
                    onChange={() => setSendChannel('whatsapp')}
                    className="sr-only"
                  />
                  <MessageCircle className="h-4 w-4 mr-2" />
                  <span>Admin's Phone (WhatsApp)</span>
                </label>
                <label className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-colors text-xs ${sendChannel === 'email' ? 'border-primary bg-green-50/20 font-bold text-primary-dark' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                  <input
                    type="radio"
                    name="sendChannel"
                    checked={sendChannel === 'email'}
                    onChange={() => setSendChannel('email')}
                    className="sr-only"
                  />
                  <Mail className="h-4 w-4 mr-2" />
                  <span>Gmail Account</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Your Query / Crop Details</label>
              <textarea
                rows={5}
                required
                placeholder="Mention crop type, area size, and symptoms of pest infection or nutrient deficiency..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg text-xs shadow-md transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Sending Message...' : 'Submit Support Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
