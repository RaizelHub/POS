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
  FaReceipt,
  FaMoneyBillWave,
  FaArrowRight
} from 'react-icons/fa';
import novaLogo from '../images/nova_logo.png';

function ThankYou() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve purchase details from location.state or fallback to localStorage
  const purchaseData = location.state || JSON.parse(localStorage.getItem('lastPurchase') || '{}');
  const {
    product,
    cartItems,
    quantity,
    totalPrice = 0,
    originalAmount = 0,
    discountAmount = 0,
    cashTendered,
    changeDue = 0,
    paymentMethod = 'Cash',
    splitDetails,
    tenderReference,
    customer,
    transactionId,
    transactionDate,
    user,
    isMultipleProducts,
    receiptUrl,
    receiptStatus,
  } = purchaseData;

  useEffect(() => {
    if ((!product && (!cartItems || cartItems.length === 0)) || !user) {
      const fallback = localStorage.getItem('lastPurchase');
      if (!fallback) {
        navigate('/login-selection');
      }
    } else {
      localStorage.setItem('lastPurchase', JSON.stringify(purchaseData));
    }
  }, [purchaseData, product, cartItems, user, navigate]);

  // Keyboard shortcut support: 'p' to print, 'Enter' or 'Space' for new sale
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        window.print();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        navigate('/scan');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeShiftId');
    localStorage.removeItem('lastPurchase');
    navigate('/login-selection');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' }
    }
  };

  // If no valid data is found, show the error state
  if ((!product && (!cartItems || cartItems.length === 0)) || !user) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex items-center justify-center p-6 antialiased">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm"
        >
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-150">
            <FaExclamationTriangle className="text-lg" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">No Details Found</h3>
          <p className="text-slate-500 text-xs mt-1 mb-6">No recent transaction details could be retrieved.</p>
          <button
            onClick={() => navigate('/scan')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all active:scale-95"
          >
            <FaBarcode className="text-xs" />
            <span>Go to Register</span>
          </button>
        </motion.div>
      </div>
    );
  }

  const itemsList = cartItems && cartItems.length > 0 
    ? cartItems.map(item => ({
        name: item.product?.name || item.name || 'Item',
        quantity: item.quantity,
        price: item.product?.price ?? item.price ?? 0,
        total: (item.product?.price ?? item.price ?? 0) * item.quantity
      }))
    : product ? [{
        name: product.name,
        quantity: quantity || 1,
        price: product.price || 0,
        total: (product.price || 0) * (quantity || 1)
      }] : [];

  const isCashOrSplit = paymentMethod === 'Cash' || paymentMethod === 'Split';

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 py-8 px-4 sm:px-6 relative antialiased">
      
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
            padding: 10px !important;
            margin: 0 !important;
          }
        }
      `}} />

      {/* Top action bar */}
      <div className="max-w-xl mx-auto flex items-center justify-between mb-4 no-print">
        <button
          onClick={() => navigate('/scan')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm transition-colors"
        >
          <FaHome className="text-xs text-slate-400" />
          <span>Register</span>
        </button>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-all bg-white shadow-sm"
        >
          <FaSignOutAlt className="text-xs" />
          <span>Exit Session</span>
        </button>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-xl mx-auto space-y-4"
      >
        
        {/* Prominent Change Due Banner for Cash/Split transactions */}
        {isCashOrSplit && cashTendered !== undefined && (
          <div className="bg-emerald-700 text-white rounded-xl p-5 shadow-sm no-print">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-bold text-emerald-200">Change Due to Customer</p>
                <p className="text-3xl font-black font-mono tracking-tight mt-1">
                  ₱{Number(changeDue).toFixed(2)}
                </p>
              </div>
              <div className="text-right text-xs text-emerald-100">
                <p>Tendered: <strong className="text-white font-mono">₱{Number(cashTendered).toFixed(2)}</strong></p>
                <p className="mt-0.5">Total Paid: <strong className="text-white font-mono">₱{Number(totalPrice).toFixed(2)}</strong></p>
              </div>
            </div>
          </div>
        )}

        {/* Printable Card Receipt */}
        <div 
          id="printable-card-receipt"
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8 space-y-5"
        >
          
          {/* Header Logos */}
          <div className="flex items-center justify-center gap-3 pb-1">
            <img src={novaLogo} alt="SUELTO Logo" className="h-10 w-auto object-contain rounded-md" />
            <div className="text-left">
              <h1 className="font-bold text-slate-900 text-base tracking-tight leading-tight">SUELTO Retail</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Main Branch · POS Register</p>
            </div>
          </div>

          {/* Success status badge */}
          <div className="text-center space-y-1.5 no-print border-b border-slate-100 pb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mb-1">
              <FaCheckCircle className="text-lg" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-slate-950">Payment Recorded</h2>
            <p className="text-slate-500 text-xs">
              Transaction reference: <span className="font-mono font-semibold text-slate-700">{transactionId || 'SUELTO-TX'}</span>
            </p>
          </div>

          {/* Cashier & Customer Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-100 pb-3">
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">Cashier</span>
              <span className="font-semibold text-slate-800">{user?.firstname} {user?.lastname}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">Date & Time</span>
              <span className="font-semibold text-slate-800">
                {transactionDate ? new Date(transactionDate).toLocaleString('en-PH') : new Date().toLocaleString('en-PH')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">Tender Method</span>
              <span className="font-semibold text-slate-800">{paymentMethod}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">Customer</span>
              <span className="font-semibold text-slate-800">{customer?.name || 'Walk-in'}</span>
            </div>
            {tenderReference && (
              <div className="col-span-2 bg-slate-50 p-2 rounded text-[11px] text-slate-600">
                <span className="font-bold text-slate-700">Tender Ref:</span> {tenderReference}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
            <div className="px-3 py-2 border-b border-slate-200 bg-slate-100 grid grid-cols-12 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <span className="col-span-7">Item Description</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-3 text-right">Amount</span>
            </div>
            
            <div className="divide-y divide-slate-100 bg-white">
              {itemsList.map((item, index) => (
                <div key={index} className="px-3 py-2.5 grid grid-cols-12 text-xs items-center">
                  <div className="col-span-7">
                    <span className="font-semibold text-slate-900 block truncate">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">₱{Number(item.price).toFixed(2)} each</span>
                  </div>
                  <span className="col-span-2 text-center font-medium text-slate-600">{item.quantity}</span>
                  <span className="col-span-3 text-right font-semibold text-slate-900 font-mono">
                    ₱{Number(item.total).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Receipt Summary Footer */}
            <div className="px-3 py-2.5 bg-slate-50 border-t border-slate-200 space-y-1 text-xs">
              {discountAmount > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Gross Subtotal</span>
                  <span className="font-mono">₱{Number(originalAmount || totalPrice + discountAmount).toFixed(2)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount Applied</span>
                  <span className="font-mono">-₱{Number(discountAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm font-bold text-slate-950 pt-1 border-t border-slate-200">
                <span className="uppercase tracking-wider text-xs">Total Amount Paid</span>
                <span className="font-mono text-base">₱{Number(totalPrice).toFixed(2)}</span>
              </div>
              {cashTendered !== undefined && isCashOrSplit && (
                <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100 text-xs">
                  <span>Cash Tendered</span>
                  <span className="font-mono font-semibold">₱{Number(cashTendered).toFixed(2)}</span>
                </div>
              )}
              {changeDue > 0 && isCashOrSplit && (
                <div className="flex justify-between text-emerald-700 font-bold text-xs">
                  <span>Change Given</span>
                  <span className="font-mono">₱{Number(changeDue).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons (Print, PDF, Start New Sale) */}
          <div className="no-print space-y-3 pt-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <FaPrint className="text-slate-500" />
                <span>Print Receipt</span>
                <span className="text-[10px] text-slate-400 font-mono">[P]</span>
              </button>

              {receiptUrl && (
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-all shadow-sm"
                >
                  <FaFilePdf className="text-rose-500" />
                  <span>PDF</span>
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate('/scan')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95"
            >
              <FaBarcode />
              <span>Start Next Sale</span>
              <span className="text-[10px] text-slate-400 font-mono">[Enter]</span>
              <FaArrowRight className="text-xs ml-1" />
            </button>
          </div>

        </div>

      </motion.div>
    </div>
  );
}

export default ThankYou;
