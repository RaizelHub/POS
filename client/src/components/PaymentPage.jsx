import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocation, useNavigate } from 'react-router-dom';
import { Modal, Image, Divider, Spin, message } from 'antd';
import { LeftOutlined, ExclamationCircleOutlined, CheckCircleFilled } from '@ant-design/icons';
import { FaPlus, FaMinus, FaMoneyBillWave, FaCreditCard, FaWallet, FaExchangeAlt, FaRegClock } from 'react-icons/fa';
import config from '../config';
import {
  completeDraft,
  createActiveDraftId,
  DRAFT_TYPES,
  getLatestDraftForUserLocal,
  saveDraft,
  syncPendingDrafts,
} from '../utils/draftStorage';

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [sourceDraft, setSourceDraft] = useState({ draftType: null, draftId: null });

  // Redesign state hooks
  const [splitCashAmount, setSplitCashAmount] = useState(0);
  const [splitDigitalAmount, setSplitDigitalAmount] = useState(0);

  // Shifts, Discounts & Customer Loyalty
  const [shiftId, setShiftId] = useState(null);
  const [assignedCustomer, setAssignedCustomer] = useState(null);
  const [manualDiscountPercent, setManualDiscountPercent] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoValidationError, setPromoValidationError] = useState('');
  const [redeemPointsChecked, setRedeemPointsChecked] = useState(false);

  const baseURL = config.apiUrl;

  const payableItems = cartItems && cartItems.length > 0
    ? cartItems
    : product
      ? [{ product, quantity }]
      : [];

  const subtotalPrice = payableItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

  // Calculate discount amount
  let discountAmt = 0;
  if (manualDiscountPercent > 0) {
    discountAmt = (subtotalPrice * manualDiscountPercent) / 100;
  } else if (appliedPromo) {
    if (appliedPromo.discountType === 'percent') {
      discountAmt = (subtotalPrice * appliedPromo.discountValue) / 100;
    } else {
      discountAmt = appliedPromo.discountValue;
    }
  }

  // Calculate customer loyalty points redemption discount
  // 1 point = ₱1, max value up to remaining balance or subtotal - other discounts
  let loyaltyDiscountAmt = 0;
  if (redeemPointsChecked && assignedCustomer && assignedCustomer.loyaltyPoints > 0) {
    const maxRedeem = subtotalPrice - discountAmt;
    loyaltyDiscountAmt = Math.min(assignedCustomer.loyaltyPoints, maxRedeem);
  }

  const finalDiscountAmt = discountAmt + loyaltyDiscountAmt;
  const finalTotalPrice = Math.max(0, subtotalPrice - finalDiscountAmt);

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) {
      setPromoValidationError('Please enter a coupon code.');
      return;
    }
    try {
      const res = await fetch(`${config.apiUrl}/api/coupons/validate/${promoCode.trim()}`);
      const data = await res.json();
      if (res.ok && data.isValid) {
        setAppliedPromo(data.coupon);
        setPromoValidationError('');
        setManualDiscountPercent(0); // Clear manual discount if promo used
        message.success(`Coupon "${data.coupon.code}" applied successfully!`);
      } else {
        setAppliedPromo(null);
        setPromoValidationError(data.message || 'Invalid coupon code.');
      }
    } catch (err) {
      console.error("Error validating coupon:", err);
      setPromoValidationError('Error validating coupon. Try again.');
    }
  };

  useEffect(() => {
    const initializePayment = async () => {
      const fetchedProduct = location.state?.product;
      const fetchedCart = location.state?.cart;
      const restoredPaymentSelection = location.state?.paymentSelection;
      const storedUser = localStorage.getItem('user');
      let parsedUser = null;

      if (storedUser) {
        try {
          parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (err) {
          setError('Invalid user data. Redirecting...');
          setTimeout(() => navigate('/'), 3000);
          setLoading(false);
          return;
        }
      } else {
        setError('User not logged in. Redirecting...');
        setTimeout(() => navigate('/'), 3000);
        setLoading(false);
        return;
      }

      if (location.state?.draftId) {
        setSourceDraft({
          draftType: location.state?.draftType || DRAFT_TYPES.SAVED_CART,
          draftId: location.state.draftId,
        });
      }

      if (restoredPaymentSelection?.paymentMethod) {
        setPaymentMethod(restoredPaymentSelection.paymentMethod);
      }

      // If the browser refreshed on payment, restore the latest local transaction draft.
      if (!fetchedProduct && (!fetchedCart || fetchedCart.length === 0)) {
        const latestDraft = await getLatestDraftForUserLocal(parsedUser._id, [
          DRAFT_TYPES.DRAFT_SALE,
          DRAFT_TYPES.SAVED_CART,
          DRAFT_TYPES.HELD_ORDER,
        ]);

        if (latestDraft && (latestDraft.cartItems || []).length > 0) {
          setCartItems(latestDraft.cartItems);
          setSourceDraft({ draftType: latestDraft.draftType, draftId: latestDraft.draftId });

          if (latestDraft.paymentSelection?.paymentMethod) {
            setPaymentMethod(latestDraft.paymentSelection.paymentMethod);
          }

          setLoading(false);
          return;
        }

        navigate('/login-selection');
        return;
      }

      if (fetchedProduct) {
        setProduct(fetchedProduct);
      }

      if (fetchedCart && fetchedCart.length > 0) {
        setCartItems(fetchedCart);
      }

      if (location.state?.shiftId) {
        setShiftId(location.state.shiftId);
      } else {
        const storedShiftId = localStorage.getItem('activeShiftId');
        if (storedShiftId) setShiftId(storedShiftId);
      }

      if (location.state?.customer) {
        setAssignedCustomer(location.state.customer);
      }

      setLoading(false);
    };

    initializePayment();
  }, [location.state, navigate]);

  useEffect(() => {
    if (loading || !user?._id) return;

    const payableItems = cartItems && cartItems.length > 0
      ? cartItems
      : product
        ? [{ product, quantity }]
        : [];

    if (payableItems.length === 0) return;

    const draftId = createActiveDraftId(user._id, DRAFT_TYPES.DRAFT_SALE);

    saveDraft({
      userId: user._id,
      draftType: DRAFT_TYPES.DRAFT_SALE,
      draftId,
      cartItems: payableItems,
      paymentSelection: paymentMethod ? { paymentMethod } : null,
      totals: {
        subtotal: payableItems.reduce((total, item) => total + item.product.price * item.quantity, 0),
        itemCount: payableItems.reduce((total, item) => total + item.quantity, 0),
      },
      metadata: {
        source: 'payment-page-auto-save',
        sourceDraft,
      },
    }).catch((error) => console.error('Unable to auto-save payment draft:', error));

    syncPendingDrafts(user._id).catch((error) => console.error('Unable to sync payment drafts:', error));
  }, [loading, user?._id, cartItems, product, quantity, paymentMethod, sourceDraft]);

  const markCurrentDraftsComplete = async () => {
    if (!user?._id) return;

    const draftKeys = [
      {
        draftType: DRAFT_TYPES.SAVED_CART,
        draftId: createActiveDraftId(user._id, DRAFT_TYPES.SAVED_CART),
      },
      {
        draftType: DRAFT_TYPES.DRAFT_SALE,
        draftId: createActiveDraftId(user._id, DRAFT_TYPES.DRAFT_SALE),
      },
      sourceDraft?.draftId ? sourceDraft : null,
    ]
      .filter(Boolean)
      .filter((draft, index, drafts) =>
        drafts.findIndex((item) => item.draftType === draft.draftType && item.draftId === draft.draftId) === index
      );

    await Promise.allSettled(
      draftKeys.map((draft) =>
        completeDraft({
          userId: user._id,
          draftType: draft.draftType,
          draftId: draft.draftId,
        })
      )
    );
  };

  const handleBack = () => navigate(-1);

  const handlePaymentClick = () => {
    if (!paymentMethod) {
      message.error('Please select a payment method!');
      return;
    }
    setIsModalOpen(true);
  };

  const createTransaction = async () => {
    if (!paymentMethod) {
      message.error('Please select a payment method!');
      return;
    }

    const paymentStatus = paymentMethod === 'Pay Later' ? 'Pay Later' : 'Paid';

    console.log('Payment Method:', paymentMethod);
    console.log('Payment Status:', paymentStatus);

    if (!user?._id) {
      message.error('User is not authenticated!');
      return;
    }

    let productsArray = [];

    if (cartItems && cartItems.length > 0) {
      productsArray = cartItems.map(item => ({
        productId: item.product._id,
        name: item.product.name || 'Unnamed Product',
        price: item.product.price || 0,
        quantity: item.quantity || 1,
        paymentStatus,
      }));
    } else if (product) {
      productsArray = [{
        productId: product._id,
        name: product.name || 'Unnamed Product',
        price: product.price || 0,
        quantity: quantity || 1,
        paymentStatus,
      }];
    } else {
      message.error('No products to process!');
      return;
    }

    const totalAmount = productsArray.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );

    if (paymentMethod === 'Split') {
      const splitSum = Number(splitCashAmount) + Number(splitDigitalAmount);
      if (Math.abs(splitSum - finalTotalPrice) > 0.01) {
        message.error(`Split amounts sum (₱${splitSum.toFixed(2)}) must equal total ₱${finalTotalPrice.toFixed(2)}.`);
        return null;
      }
    }

    const requestData = {
      transactionDate: new Date().toISOString(),
      userId: user._id,
      products: productsArray,
      totalAmount: finalTotalPrice,
      paymentStatus,
      paymentMethod,
      splitDetails: paymentMethod === 'Split' ? {
        cashAmount: Number(splitCashAmount),
        digitalAmount: Number(splitDigitalAmount),
      } : undefined,
      originalAmount: subtotalPrice,
      discountAmount: finalDiscountAmt,
      promoCode: appliedPromo ? appliedPromo.code : undefined,
      customerId: assignedCustomer ? assignedCustomer._id : undefined,
      shiftId: shiftId || undefined,
      loyaltyPointsEarned: Math.floor(finalTotalPrice / 100),
      loyaltyPointsRedeemed: loyaltyDiscountAmt,
    };

    console.log('Request Data:', requestData);

    try {
      const response = await fetch(`${config.apiUrl}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create transaction.' }));
        console.error('Error creating transaction:', errorData.message);
        throw new Error(errorData.message);
      }

      const data = await response.json();
      console.log('Transaction created successfully:', data);
      message.success('Payment Successful! Please Wait!');
      return data;
    } catch (error) {
      console.error('Error creating transaction:', error.message);
      message.error('Error saving transaction. Please try again.');
      return null;
    }
  };

  const updatePurchasedItems = () => {
    try {
      const storedData = JSON.parse(localStorage.getItem('purchasedData')) || {};
      const userData = storedData[user._id] || { paidItems: [], payLaterItems: [] };

      if (cartItems && cartItems.length > 0) {
        cartItems.forEach(item => {
          const purchaseItem = {
            name: item.product.name,
            price: item.product.price * item.quantity,
            quantity: item.quantity,
          };

          if (paymentMethod !== 'Pay Later') {
            userData.paidItems.push(purchaseItem);
          } else {
            userData.payLaterItems.push(purchaseItem);
          }
        });
      } else if (product) {
        const purchaseItem = {
          name: product.name,
          price: product.price * quantity,
          quantity: quantity,
        };

        if (paymentMethod !== 'Pay Later') {
          userData.paidItems.push(purchaseItem);
        } else {
          userData.payLaterItems.push(purchaseItem);
        }
      }

      storedData[user._id] = userData;
      localStorage.setItem('purchasedData', JSON.stringify(storedData));
      console.log('Purchased items updated successfully:', storedData);
    } catch (error) {
      console.error('Error updating purchased items:', error.message);
    }
  };

  const updateProductQuantity = async () => {
    try {
      let success = true;

      if (cartItems && cartItems.length > 0) {
        for (const item of cartItems) {
          const response = await fetch(`${baseURL}/api/products/${item.product._id}/decrement`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: item.quantity }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error(`Failed to update quantity for ${item.product.name}:`, errorData.message);
            success = false;
            break;
          }

          const data = await response.json();
          console.log(`Product ${item.product.name} quantity updated successfully:`, data);
        }
      } else if (product) {
        const response = await fetch(`${baseURL}/api/products/${product._id}/decrement`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update product quantity.');
        }

        const data = await response.json();
        console.log('Product quantity updated successfully:', data);
      }

      return success;
    } catch (error) {
      console.error('Error updating product quantity:', error.message);
      message.error('Failed to update product quantity. Please try again.');
      return false;
    }
  };

  const handleConfirmPayment = async () => {
    if (processingPayment) return;

    try {
      setProcessingPayment(true);
      message.loading('Processing payment...', 0);

      const isUpdated = await updateProductQuantity();

      if (isUpdated) {
        const transaction = await createTransaction();

        if (transaction) {
          updatePurchasedItems();
          await markCurrentDraftsComplete();
          let receiptData;
          const currentTxId = transaction?.transaction?.transactionId || uuidv4();
          const currentTxDate = transaction?.transaction?.transactionDate || new Date().toISOString();

          if (cartItems && cartItems.length > 0) {
            receiptData = {
              products: cartItems.map(item => ({
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                totalPrice: item.product.price * item.quantity,
              })),
              totalPrice: finalTotalPrice,
              paymentMethod,
              paymentStatus: paymentMethod === 'Pay Later' ? 'Pay Later' : 'Paid',
              user: {
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
              },
              transactionId: currentTxId,
              transactionDate: currentTxDate,
              isMultipleProducts: true,
            };
          } else {
            receiptData = {
              product: {
                name: product.name,
                price: product.price,
              },
              quantity,
              totalPrice: finalTotalPrice,
              paymentMethod,
              paymentStatus: paymentMethod === 'Pay Later' ? 'Pay Later' : 'Paid',
              user: {
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
              },
              transactionId: currentTxId,
              transactionDate: currentTxDate,
              isMultipleProducts: false,
            };
          }

          try {
            const response = await fetch(`${config.apiUrl}/api/generate-receipt`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(receiptData),
            });

            const data = await response.json();
            console.log('Receipt API response:', data);

            const thankYouState = {
              cartItems,
              product,
              quantity,
              totalPrice: finalTotalPrice,
              originalAmount: subtotalPrice,
              discountAmount: finalDiscountAmt,
              finalPrice: finalTotalPrice,
              customer: assignedCustomer,
              loyaltyPointsEarned: Math.floor(finalTotalPrice / 100),
              loyaltyPointsRedeemed: loyaltyDiscountAmt,
              transactionId: currentTxId,
              transactionDate: currentTxDate,
              receiptUrl: response.ok ? (data.fileUrl || null) : null,
              receiptStatus: response.ok ? (data.driveUpload ? 'uploaded' : 'email_only') : 'failed',
              emailSent: response.ok ? data.emailSent : false,
              paymentMethod,
              user: {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email
              },
              isMultipleProducts: cartItems && cartItems.length > 0
            };

            if (response.ok) {
              message.success('Payment processed successfully!');
            } else {
              console.error('Error generating receipt:', data);
              message.warning('Payment processed, but receipt generation failed. Proceeding.');
            }
            navigate('/thank-you', { state: thankYouState });
          } catch (receiptError) {
            console.error('Error generating receipt:', receiptError);
            message.warning('Payment processed, but receipt generation failed. Proceeding.');
            const thankYouState = {
              cartItems,
              product,
              quantity,
              totalPrice: finalTotalPrice,
              originalAmount: subtotalPrice,
              discountAmount: finalDiscountAmt,
              finalPrice: finalTotalPrice,
              customer: assignedCustomer,
              loyaltyPointsEarned: Math.floor(finalTotalPrice / 100),
              loyaltyPointsRedeemed: loyaltyDiscountAmt,
              transactionId: currentTxId,
              transactionDate: currentTxDate,
              receiptUrl: null,
              receiptStatus: 'error',
              emailSent: false,
              paymentMethod,
              user: { firstname: user.firstname, lastname: user.lastname, email: user.email },
              isMultipleProducts: Boolean(cartItems?.length),
            };
            navigate('/thank-you', { state: thankYouState });
          }
        }
      }
    } catch (error) {
  console.error('Error during payment confirmation:', error.message);
  message.error('Payment could not be completed. Please try again.');
} finally {
  setProcessingPayment(false);
  message.destroy();
}
  };

if (loading) {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-slate-50 gap-4">
      <Spin size="large" />
      <span className="text-slate-500 font-medium text-sm">Loading Checkout Session...</span>
    </div>
  );
}

return (
  <div className="min-h-screen bg-slate-50 text-slate-800 p-6 flex flex-col font-sans">

    {/* Top Header Navigation */}
    <header className="max-w-6xl w-full mx-auto flex items-center justify-between mb-8">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 hover:bg-slate-100 px-3.5 py-2 rounded-lg text-slate-700 font-semibold text-sm transition-all border border-slate-200"
      >
        <LeftOutlined className="text-xs" />
        <span>Back to Register</span>
      </button>

      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Checkout Order</h1>
        <p className="text-slate-400 text-xs mt-0.5">Please select a payment method to complete checkout</p>
      </div>

      <div className="w-[120px]" /> {/* Spacer */}
    </header>

    {/* Main Checkout Columns */}
    <main className="flex-1 max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

      {/* Left Side: Order Summary (Span 5) */}
      <section className="md:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
          <span>🛒</span> Order Summary
        </h2>

        {product ? (
          /* Single Product Checkout */
          <div className="flex gap-4 items-center">
            <div className="w-[70px] h-[70px] border border-slate-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-350 text-2xl font-bold">P</div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 text-sm">{product.name}</h4>
              <p className="text-slate-400 text-xs mt-0.5">Quantity: {quantity}</p>
              <p className="text-slate-900 font-bold text-sm mt-1">₱{(product.price * quantity).toFixed(2)}</p>
            </div>
          </div>
        ) : cartItems && cartItems.length > 0 ? (
          /* Cart Items Checkout */
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex gap-3 bg-slate-50 border border-slate-100 rounded-lg p-3">
                <div className="w-[50px] h-[50px] bg-white border border-slate-200 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {item.product.image ? (
                    <img
                      src={item.product.image.startsWith('http') ? item.product.image : `${baseURL}/${item.product.image?.replace(/\\/g, '/')}`}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-300">P</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-800 text-xs truncate">{item.product.name}</h4>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-slate-400 text-[11px]">{item.quantity} x ₱{item.product.price.toFixed(2)}</span>
                    <span className="font-bold text-slate-700 text-xs">₱{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Customer & Loyalty Points */}
        {assignedCustomer && (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-900">👤 Loyalty Customer</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Active</span>
            </div>
            <div className="flex justify-between text-xs border-b border-emerald-100 pb-1.5">
              <span className="text-slate-500">Customer Name</span>
              <span className="font-semibold text-slate-800">{assignedCustomer.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Available Points</span>
              <span className="font-bold text-emerald-700 font-mono">{assignedCustomer.loyaltyPoints} points</span>
            </div>
            {assignedCustomer.loyaltyPoints > 0 && (
              <div className="flex items-center gap-2 pt-1 border-t border-emerald-100">
                <input
                  type="checkbox"
                  id="redeemPoints"
                  checked={redeemPointsChecked}
                  onChange={(e) => setRedeemPointsChecked(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <label htmlFor="redeemPoints" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  Redeem points as discount (₱1/point)
                </label>
              </div>
            )}
          </div>
        )}

        {/* Discounts & Coupon Input */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-4">
          <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">🏷️ Discounts & Promo Code</span>

          <div className="space-y-1.5">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  setPromoValidationError('');
                }}
                disabled={manualDiscountPercent > 0}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:border-slate-500 disabled:bg-slate-100 disabled:cursor-not-allowed uppercase font-semibold tracking-wider font-mono"
              />
              <button
                onClick={handleValidatePromo}
                disabled={manualDiscountPercent > 0 || !promoCode.trim()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition-colors active:scale-95"
              >
                Apply
              </button>
            </div>
            {promoValidationError && (
              <span className="text-red-500 text-[10px] font-semibold block">{promoValidationError}</span>
            )}
            {appliedPromo && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-medium flex justify-between items-center mt-2">
                <span>Coupon <strong>{appliedPromo.code}</strong> applied ({appliedPromo.discountType === 'percent' ? `${appliedPromo.discountValue}%` : `₱${appliedPromo.discountValue}`} off)</span>
                <button
                  onClick={() => {
                    setAppliedPromo(null);
                    setPromoCode('');
                  }}
                  className="text-emerald-950 font-bold hover:text-red-750"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200/60">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Or Apply Manual % Discount
            </label>
            <div className="flex items-center gap-2">
              {[0, 5, 10, 15, 20].map((pct) => (
                <button
                  key={pct}
                  disabled={!!appliedPromo}
                  onClick={() => setManualDiscountPercent(pct)}
                  className={`flex-1 py-1.5 border rounded-lg text-[10px] font-bold transition-all ${manualDiscountPercent === pct && !appliedPromo
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-350'
                    } disabled:opacity-50 disabled:cursor-not-allowed active:scale-95`}
                >
                  {pct === 0 ? 'None' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Items Count</span>
            <span className="font-semibold text-slate-800 font-mono">
              {cartItems && cartItems.length > 0 ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : quantity}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Cart Subtotal</span>
            <span className="font-semibold text-slate-850 font-mono">₱{subtotalPrice.toFixed(2)}</span>
          </div>
          {finalDiscountAmt > 0 && (
            <div className="flex justify-between text-xs text-emerald-600 font-semibold">
              <span>Discount Applied</span>
              <span className="font-bold font-mono">-₱{finalDiscountAmt.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-slate-900 border-t border-slate-50 pt-2.5">
            <span className="font-bold text-sm">Total Payable</span>
            <span className="font-extrabold text-lg text-slate-950 font-mono">₱{finalTotalPrice.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {/* Right Side: Payment Choices (Span 7) */}
      <section className="md:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">

        {/* Quantity Selector for single products only */}
        {product && (
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg space-y-3">
            <span className="text-xs font-semibold text-slate-750 block uppercase tracking-wide">Adjust Quantity</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                disabled={quantity <= 1}
                className="w-8 h-8 border border-slate-200 rounded bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 disabled:opacity-50 transition-all active:scale-95"
              >
                <FaMinus className="text-[10px]" />
              </button>
              <span className="text-slate-900 font-bold text-base w-10 text-center">{quantity}</span>
              <button
                onClick={() => quantity < (product?.quantity || 1) && setQuantity(quantity + 1)}
                disabled={quantity >= (product?.quantity || 1)}
                className="w-8 h-8 border border-slate-200 rounded bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 disabled:opacity-50 transition-all active:scale-95"
              >
                <FaPlus className="text-[10px]" />
              </button>
              <span className="text-xs text-slate-400 font-medium ml-auto">Available: {product.quantity} units</span>
            </div>
          </div>
        )}

        <div>
          <h3 className="font-bold text-slate-900 text-sm mb-3">Select Payment Method</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Cash Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod('Cash')}
              className={`flex items-center gap-3 p-3.5 border rounded-xl text-left transition-all hover:bg-slate-50 ${paymentMethod === 'Cash'
                ? 'border-emerald-500 bg-emerald-50/20 text-emerald-950 ring-1 ring-emerald-500'
                : 'border-slate-200 text-slate-800'
                }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${paymentMethod === 'Cash' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'
                }`}>
                <FaMoneyBillWave />
              </div>
              <div>
                <span className="font-semibold text-xs block">Cash Payment</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Pay now in cash</span>
              </div>
            </button>

            {/* Card Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod('Card')}
              className={`flex items-center gap-3 p-3.5 border rounded-xl text-left transition-all hover:bg-slate-50 ${paymentMethod === 'Card'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                : 'border-slate-200 text-slate-800'
                }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${paymentMethod === 'Card' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                <FaCreditCard />
              </div>
              <div>
                <span className="font-semibold text-xs block">Debit/Credit Card</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Tap/Swipe card terminal</span>
              </div>
            </button>

            {/* GCash Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod('GCash/PayMaya')}
              className={`flex items-center gap-3 p-3.5 border rounded-xl text-left transition-all hover:bg-slate-50 ${paymentMethod === 'GCash/PayMaya'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                : 'border-slate-200 text-slate-800'
                }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${paymentMethod === 'GCash/PayMaya' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                <FaWallet />
              </div>
              <div>
                <span className="font-semibold text-xs block">GCash / PayMaya</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Mobile wallet QR code</span>
              </div>
            </button>

            {/* Split Payment Option */}
            <button
              type="button"
              onClick={() => {
                setPaymentMethod('Split');
                setSplitCashAmount(Math.round(finalTotalPrice * 0.5));
                setSplitDigitalAmount(finalTotalPrice - Math.round(finalTotalPrice * 0.5));
              }}
              className={`flex items-center gap-3 p-3.5 border rounded-xl text-left transition-all hover:bg-slate-50 ${paymentMethod === 'Split'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                : 'border-slate-200 text-slate-800'
                }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${paymentMethod === 'Split' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                <FaExchangeAlt />
              </div>
              <div>
                <span className="font-semibold text-xs block">Split Payment</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Part cash / Part digital</span>
              </div>
            </button>

            {/* Pay Later Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod('Pay Later')}
              className={`flex items-center gap-3 p-3.5 border rounded-xl text-left transition-all hover:bg-slate-50 ${paymentMethod === 'Pay Later'
                ? 'border-red-500 bg-red-50/20 text-red-950 ring-1 ring-red-500'
                : 'border-slate-200 text-slate-800'
                }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${paymentMethod === 'Pay Later' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-650'
                }`}>
                <FaRegClock />
              </div>
              <div>
                <span className="font-semibold text-xs block">Pay Later</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Log transaction as credit</span>
              </div>
            </button>

          </div>
        </div>

        {/* Interactive Split configuration form */}
        {paymentMethod === 'Split' && (
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
            <span className="text-xs font-semibold text-slate-750 block uppercase tracking-wide">
              Configure Split Fractions (Total: ₱{finalTotalPrice.toFixed(2)})
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1 uppercase">Cash Part (₱)</label>
                <input
                  type="number"
                  min="0"
                  max={finalTotalPrice}
                  step="0.01"
                  value={splitCashAmount}
                  onChange={(e) => {
                    const cash = Number(e.target.value) || 0;
                    setSplitCashAmount(cash);
                    setSplitDigitalAmount(Math.max(0, finalTotalPrice - cash));
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-slate-400 font-semibold"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1 uppercase">Digital Part (₱)</label>
                <input
                  type="number"
                  min="0"
                  max={finalTotalPrice}
                  step="0.01"
                  value={splitDigitalAmount}
                  onChange={(e) => {
                    const digital = Number(e.target.value) || 0;
                    setSplitDigitalAmount(digital);
                    setSplitCashAmount(Math.max(0, finalTotalPrice - digital));
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-slate-400 font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* Proceed Button */}
        <button
          onClick={handlePaymentClick}
          disabled={!paymentMethod || processingPayment}
          className={`w-full py-3.5 text-white font-bold rounded-xl text-sm transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${paymentMethod === 'Cash'
            ? 'bg-emerald-600 hover:bg-emerald-700'
            : paymentMethod === 'Pay Later'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-slate-900 hover:bg-slate-800'
            }`}
        >
          <span>Proceed to Confirmation (₱{finalTotalPrice.toFixed(2)})</span>
        </button>

      </section>

    </main>

    {/* Confirmation Modal redone flat */}
    <Modal
      title={
        <div className="flex items-center gap-2 pb-2">
          <ExclamationCircleOutlined className="text-amber-500 text-lg" />
          <span className="font-bold text-slate-950 text-base">Confirm Order Checkout</span>
        </div>
      }
      open={isModalOpen}
      onCancel={() => !processingPayment && setIsModalOpen(false)}
      maskClosable={!processingPayment}
      keyboard={!processingPayment}
      closable={!processingPayment}
      width={480}
      centered
      styles={{ body: { padding: '16px' } }}
      footer={[
        <button
          key="cancel"
          onClick={() => !processingPayment && setIsModalOpen(false)}
          disabled={processingPayment}
          className="px-4 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 text-sm font-semibold transition-colors mr-3 disabled:opacity-50"
        >
          Cancel
        </button>,
        <button
          key="confirm"
          onClick={handleConfirmPayment}
          disabled={processingPayment}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50 active:scale-95"
        >
          {processingPayment ? 'Confirming...' : 'Confirm Checkout'}
        </button>
      ]}
    >
      <div className="space-y-4">
        <style>{`
          @keyframes scan {
            0% { top: 8px; }
            50% { top: 160px; }
            100% { top: 8px; }
          }
          .animate-scan-beam {
            position: absolute;
            animation: scan 2s linear infinite;
          }
        `}</style>

        <p className="text-sm text-slate-500">
          You are checking out an order with a total price of <strong className="text-slate-900">₱{finalTotalPrice.toFixed(2)}</strong>.
          Selected payment method is <strong className="text-slate-900 font-semibold">{paymentMethod}</strong>.
        </p>

        {/* Dynamic QR Code display for GCash/PayMaya or Split (with digital portion) */}
        {(paymentMethod === 'GCash/PayMaya' || (paymentMethod === 'Split' && splitDigitalAmount > 0)) && (
          <div className="flex flex-col items-center justify-center p-4 bg-emerald-50/30 border border-emerald-100 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-700 tracking-wider uppercase mb-2">Scan QR Code to Pay</span>
            <div className="relative p-2 bg-white border border-slate-200 rounded-lg shadow-sm w-44 h-44 overflow-hidden">
              {/* Dynamic QR code generated with exact price */}
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=payee=SUELTO_STORE;amount=${paymentMethod === 'Split' ? splitDigitalAmount : finalTotalPrice};ref=SUELTO-${Date.now()}`}
                alt="Payment QR" 
                className="w-full h-full object-contain"
              />
              {/* Pulsing Scan Line overlay */}
              <div className="absolute left-2 right-2 top-2 h-0.5 bg-emerald-500/80 shadow-md animate-scan-beam" />
            </div>
            <p className="text-[10px] text-slate-500 font-semibold mt-3 text-center">
              Merchant Reference: <span className="font-mono text-slate-700">SUELTO-{Date.now().toString().slice(-6)}</span>
            </p>
            <p className="text-[11px] font-extrabold text-emerald-800 mt-1">
              Amount Due: ₱{(paymentMethod === 'Split' ? splitDigitalAmount : finalTotalPrice).toFixed(2)}
            </p>
          </div>
        )}

        <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/50 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wide">Item Breakdown</span>
          {payableItems.map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="truncate max-w-[250px]">{item.product.name}</span>
              <span>{item.quantity} units</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>

  </div>
);
}

export default PaymentPage;
