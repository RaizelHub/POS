import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaHome, 
  FaSignOutAlt, 
  FaBarcode, 
  FaFilePdf, 
  FaPrint, 
  FaExclamationTriangle,
  FaReceipt 
} from 'react-icons/fa';
import novaLogo from '../images/nova_logo.png';
import config from '../config';

function ThankYou() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve purchase details from location.state or fallback to localStorage
  const {
    product,
    cartItems,
    quantity,
    totalPrice,
    paymentMethod,
    user,
    isMultipleProducts,
    receiptUrl,
    receiptStatus,
  } = location.state || JSON.parse(localStorage.getItem('lastPurchase')) || {};

  useEffect(() => {
    if ((!product && !cartItems) || !user) {
      const fallbackData = JSON.parse(localStorage.getItem('lastPurchase'));
      if (!fallbackData) {
        navigate('/login-selection');
      }
    } else {
      localStorage.setItem(
        'lastPurchase',
        JSON.stringify({
          product,
          cartItems,
          quantity,
          totalPrice,
          paymentMethod,
          user,
          isMultipleProducts,
          receiptUrl,
          receiptStatus,
        })
      );
    }
  }, [product, cartItems, user, quantity, totalPrice, paymentMethod, isMultipleProducts, receiptUrl, receiptStatus, navigate]);

  // Automatically print the receipt and navigate back to the scanpage
  useEffect(() => {
    if ((product || (cartItems && cartItems.length > 0)) && user) {
      const printAndNavigate = async () => {
        // A short delay to ensure everything (logos, text) has fully rendered
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.print();
        navigate('/scan');
      };
      printAndNavigate();
    }
  }, [product, cartItems, user, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login-selection');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  // If no valid data is found, show the error state
  if ((!product && !cartItems) || !user) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex items-center justify-center p-6 antialiased">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm"
        >
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-150">
            <FaExclamationTriangle className="text-lg" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">No Details Found</h3>
          <p className="text-slate-500 text-xs mt-1 mb-6">No recent transaction details could be retrieved.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all active:scale-97"
          >
            <FaHome className="text-xs" />
            <span>Go Back Home</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 py-10 px-4 md:px-6 relative antialiased">
      
      {/* CSS print override styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-card-receipt, #printable-card-receipt * {
            visibility: visible;
          }
          .no-print, .no-print * {
            display: none !important;
            visibility: hidden !important;
          }
          #printable-card-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}} />

      {/* Logout button top right */}
      <div className="absolute top-6 right-6 no-print">
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-650 hover:bg-red-50 rounded-lg text-xs font-bold transition-all active:scale-95 bg-white shadow-sm"
        >
          <FaSignOutAlt />
          <span>Exit Session</span>
        </button>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-xl mx-auto space-y-6"
      >
        
        {/* Printable Card */}
        <div 
          id="printable-card-receipt"
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8 space-y-6"
        >
          
          {/* Header Logos */}
          <div className="flex items-center justify-center gap-4 no-print pb-2">
            <img src={novaLogo} alt="Nova Logo" className="h-14 w-auto object-contain rounded-xl shadow-sm" />
          </div>

          {/* Success message banner */}
          <div className="text-center space-y-2 no-print border-b border-slate-100 pb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-150 mb-1">
              <FaCheckCircle className="text-xl" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Purchase Completed!</h2>
            <p className="text-slate-500 text-xs">Transaction processed successfully.</p>
          </div>

          {/* Receipt Content Title */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
              <FaReceipt className="text-slate-400" />
              <span>Official Receipt</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Method: {paymentMethod}
            </span>
          </div>

          {/* Cashier Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-450 text-[10px] block uppercase font-bold tracking-wider">Cashier / Staff</span>
              <span className="font-semibold text-slate-800">{user.firstname} {user.lastname}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-450 text-[10px] block uppercase font-bold tracking-wider">Date & Time</span>
              <span className="font-semibold text-slate-800">{new Date().toLocaleString()}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-150 rounded-lg overflow-hidden bg-slate-50">
            <div className="px-4 py-2 border-b border-slate-200 bg-slate-100 grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <span className="col-span-6">Item Description</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-4 text-right">Total</span>
            </div>
            
            <div className="divide-y divide-slate-150">
              {/* Single item display */}
              {product && !isMultipleProducts && (
                <div className="px-4 py-3 grid grid-cols-12 text-xs items-center bg-white">
                  <div className="col-span-6 flex items-center gap-3">
                    {product.image && (
                      <img src={product.image} alt={product.name} className="w-10 h-10 object-contain rounded border border-slate-150 bg-slate-50 no-print flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-slate-850 block">{product.name}</span>
                      <span className="text-[10px] text-slate-400">₱{product.price.toFixed(2)} each</span>
                    </div>
                  </div>
                  <span className="col-span-2 text-center font-semibold text-slate-600">{quantity}</span>
                  <span className="col-span-4 text-right font-bold text-slate-850">₱{totalPrice.toFixed(2)}</span>
                </div>
              )}

              {/* Multiple item cart list */}
              {cartItems && isMultipleProducts && cartItems.map((item, index) => (
                <div key={index} className="px-4 py-3 grid grid-cols-12 text-xs items-center bg-white">
                  <div className="col-span-6 flex items-center gap-3">
                    {item.product.image && (
                      <img src={item.product.image} alt={item.product.name} className="w-10 h-10 object-contain rounded border border-slate-150 bg-slate-50 no-print flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-slate-850 block">{item.product.name}</span>
                      <span className="text-[10px] text-slate-400">₱{item.product.price.toFixed(2)} each</span>
                    </div>
                  </div>
                  <span className="col-span-2 text-center font-semibold text-slate-600">{item.quantity}</span>
                  <span className="col-span-4 text-right font-bold text-slate-850">₱{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Receipt Summary Footer Row */}
            <div className="px-4 py-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center text-xs font-bold">
              <span className="text-slate-500 uppercase tracking-wider">Total Amount Due</span>
              <span className="text-sm text-slate-900 font-extrabold">₱{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Receipt Actions Section */}
          <div className="no-print space-y-4 pt-2">
            {receiptUrl ? (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                <span className="text-xs font-semibold text-emerald-800 block text-center">
                  Receipt has been generated and sent to your email.
                </span>
                <div className="flex gap-3">
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold transition-all bg-white"
                  >
                    <FaFilePdf className="text-slate-500 text-xs" />
                    <span>View PDF</span>
                  </a>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-97"
                  >
                    <FaPrint />
                    <span>Print Receipt</span>
                  </button>
                </div>
              </div>
            ) : receiptStatus === 'email_only' ? (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center space-y-3">
                <span className="text-xs font-semibold text-slate-700 block">
                  A verification receipt has been forwarded to the email address.
                </span>
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  <FaPrint />
                  <span>Print Receipt Copies</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center space-y-3">
                <span className="text-xs font-semibold text-emerald-800 block">
                  Transaction finalized successfully.
                </span>
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  <FaPrint />
                  <span>Print Paper Receipt</span>
                </button>
              </div>
            )}
          </div>

          {/* Return button */}
          <div className="no-print pt-2 text-center">
            <button
              onClick={() => navigate('/scan')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all shadow-sm active:scale-97"
            >
              <FaBarcode className="text-xs" />
              <span>Scan Another Product</span>
            </button>
          </div>

        </div>

      </motion.div>
    </div>
  );
}

export default ThankYou;
