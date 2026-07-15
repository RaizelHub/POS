import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStore, FaReceipt, FaEnvelopeOpenText, FaFont, FaSave, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import config from '../config';

function ReceiptCustomizer() {
  const [settings, setSettings] = useState({
    storeName: 'SUELTO Store',
    address: 'SUELTO Retail Station',
    contactNumber: '09123456789',
    vatNumber: '123-456-789-000',
    headerMessage: 'Thank you for shopping!',
    footerMessage: 'Please come again!',
    showLogo: true,
    fontSize: 'medium',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${config.apiUrl}/api/receipt-settings`);
      if (res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Error loading receipt settings:', err);
      showAlert('error', 'Failed to retrieve receipt settings.');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await axios.post(`${config.apiUrl}/api/receipt-settings`, settings);
      setSettings(res.data.settings);
      showAlert('success', 'Receipt template saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      showAlert('error', 'Failed to save receipt settings.');
    } finally {
      setSaving(false);
    }
  };

  // Preview styling helpers
  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'small':
        return 'text-[10px]';
      case 'large':
        return 'text-sm';
      default:
        return 'text-xs';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-teal-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      
      {/* Alert banner */}
      {alert && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm transition-all duration-300 ${alert.type === 'success' ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          {alert.type === 'success' ? <FaCheckCircle className="text-lg" /> : <FaExclamationCircle className="text-lg" />}
          <span className="text-sm font-semibold">{alert.message}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Customize Form (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FaReceipt className="text-teal-700" /> Receipt Customizer
            </h2>
            <p className="text-slate-500 text-xs mt-1">Configure layout, typography, messages, and business fields for all printed and digital receipt outputs.</p>
          </div>

          {/* Section 1: Store info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FaStore /> Business Header Details
            </h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Store Name</label>
              <input
                type="text"
                name="storeName"
                value={settings.storeName}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none focus:bg-white text-sm rounded-lg px-3 py-2 transition-all font-semibold"
                placeholder="Mega Store Inc."
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Tagline / Sub-header</label>
              <input
                type="text"
                name="tagline"
                value={settings.tagline}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none focus:bg-white text-sm rounded-lg px-3 py-2 transition-all"
                placeholder="Delicious coffee & pastries"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-slate-50 p-4 border border-slate-200/60 rounded-xl space-y-4">
            <span className="text-xs font-bold text-slate-700 block uppercase tracking-wide">Contact Details</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Line</label>
                <input
                  type="text"
                  name="phone"
                  value={settings.phone}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none focus:bg-white text-sm rounded-lg px-3 py-2 transition-all"
                  placeholder="+63 900 0000 000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Store Address</label>
                <input
                  type="text"
                  name="address"
                  value={settings.address}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none focus:bg-white text-sm rounded-lg px-3 py-2 transition-all"
                  placeholder="Street, City, Country"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Messages */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FaEnvelopeOpenText /> Custom Messages
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Header Greeting Message</label>
              <textarea
                name="headerMessage"
                value={settings.headerMessage}
                onChange={handleInputChange}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none focus:bg-white text-sm rounded-lg px-3 py-2 transition-all resize-none"
                placeholder="e.g. Thank you for supporting our business!"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Footer Closing Message</label>
              <textarea
                name="footerMessage"
                rows={2}
                value={settings.footerMessage}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none focus:bg-white text-sm rounded-lg px-3 py-2 transition-all resize-none"
                placeholder="Thank you for shopping with us!"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Return Policy Description</label>
              <textarea
                name="returnPolicy"
                rows={2}
                value={settings.returnPolicy}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none focus:bg-white text-sm rounded-lg px-3 py-2 transition-all resize-none"
                placeholder="No returns without original invoice. Exchange within 7 days."
              />
            </div>
          </div>

          {/* Section 3: Formatting & Theme */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FaFont /> Font Size & Print Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Font Size</label>
                <select
                  name="fontSize"
                  value={settings.fontSize}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none focus:bg-white text-sm rounded-lg px-3 py-2 transition-all"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="showLogo"
                  name="showLogo"
                  checked={settings.showLogo}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-teal-700 border-slate-300 rounded focus:ring-teal-700"
                />
                <label htmlFor="showLogo" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  Display Logo on Receipt
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-teal-700 hover:bg-teal-650 text-white text-sm font-bold px-5 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <FaSave /> {saving ? 'Saving changes...' : 'Save Template'}
            </button>
          </div>
        </form>

        {/* Right Side: Live thermal paper roll preview (5 cols) */}
        <div className="lg:col-span-5 bg-slate-100 rounded-xl border border-slate-250 p-6 flex flex-col items-center">
          <p className="text-xs font-semibold text-slate-500 mb-4 tracking-wider uppercase">Live Thermal Preview (80mm)</p>
          
          {/* Simulated receipt paper */}
          <div className="w-[300px] bg-white border border-slate-300 shadow-lg px-4 py-8 rounded-b-md flex flex-col font-mono text-slate-800 relative select-none">
            {/* Top jagged cut line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-200 border-b border-dashed border-slate-350" />
            
            {/* Store title */}
            <div className="text-center font-bold tracking-tight text-slate-900 border-b border-dashed border-slate-300 pb-2 mb-2">
              <span className="text-base uppercase block">{settings.storeName}</span>
              <span className="text-[10px] font-normal block leading-tight">{settings.address}</span>
              <span className="text-[10px] font-normal block leading-tight">Tel: {settings.contactNumber}</span>
              {settings.vatNumber && <span className="text-[10px] font-normal block leading-tight">VAT: {settings.vatNumber}</span>}
            </div>

            {/* Welcome Msg */}
            <div className="text-center text-[10px] leading-relaxed italic mb-4">
              "{settings.headerMessage}"
            </div>

            {/* Transaction metadata */}
            <div className="text-[10px] border-b border-dashed border-slate-300 pb-2 mb-3 leading-loose">
              <div className="flex justify-between">
                <span>DATE: 2026-07-14 02:00</span>
                <span>CASHIER: John D.</span>
              </div>
              <div>TRANS: #SUELTO-TEST-9989</div>
            </div>

            {/* Items Purchased List */}
            <div className={`space-y-2 border-b border-dashed border-slate-300 pb-3 mb-3 ${getFontSizeClass()}`}>
              <div className="flex justify-between font-bold text-slate-900">
                <span>ITEM</span>
                <span>TOTAL</span>
              </div>
              
              <div className="flex justify-between leading-tight">
                <div className="flex flex-col">
                  <span>Espresso Macchiato</span>
                  <span className="text-slate-500 font-normal">2 x ₱120.00</span>
                </div>
                <span>₱240.00</span>
              </div>

              <div className="flex justify-between leading-tight">
                <div className="flex flex-col">
                  <span>Vanilla Croissant</span>
                  <span className="text-slate-500 font-normal">1 x ₱85.00</span>
                </div>
                <span>₱85.00</span>
              </div>
            </div>

            {/* Sums and Totals */}
            <div className={`space-y-1 mb-4 leading-normal ${getFontSizeClass()}`}>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₱325.00</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount (5%)</span>
                <span>-₱16.25</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900 text-sm">
                <span>GRAND TOTAL</span>
                <span>₱308.75</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="text-[10px] leading-normal mb-6">
              <span>PAYMENT: Cash</span>
            </div>

            {/* Footer Message */}
            <div className="text-center font-bold tracking-tight text-[10px] text-slate-700 uppercase leading-relaxed">
              *** {settings.footerMessage} ***
            </div>
            
            {/* Bottom jagged cutout indicator */}
            <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-slate-200 border-t border-dashed border-slate-350" />
          </div>
        </div>

      </div>
    </div>
  );
}

export default ReceiptCustomizer;
