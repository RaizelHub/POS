import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocation, useNavigate } from 'react-router-dom';
import {Layout,Card,Typography,Button,InputNumber,Radio,Modal,Image,Divider,Space, Row,Col,message,Spin} from 'antd';
import {ShoppingCartOutlined,DollarCircleOutlined,LeftOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import { FaPlus, FaMinus } from 'react-icons/fa';
import config from '../config';
import {
  completeDraft,
  createActiveDraftId,
  DRAFT_TYPES,
  getLatestDraftForUserLocal,
  saveDraft,
  syncPendingDrafts,
} from '../utils/draftStorage';

const { Content } = Layout;

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

  const baseURL = config.apiUrl;

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
    // Ensure a payment method is selected
    if (!paymentMethod) {
      message.error('Please select a payment method!');
      return;
    }

    // Determine payment status based on the selected payment method
    const paymentStatus = paymentMethod === 'Cash' ? 'Paid' : 'Pay Later';

    // Log the payment method and status for debugging
    console.log('Payment Method:', paymentMethod);
    console.log('Payment Status:', paymentStatus);

    // Ensure user._id is valid
    if (!user?._id) {
      message.error('User is not authenticated!');
      return;
    }

    // Prepare products array based on whether we have a single product or cart items
    let productsArray = [];

    if (cartItems && cartItems.length > 0) {
      // We have cart items, use them
      productsArray = cartItems.map(item => ({
        productId: item.product._id,
        name: item.product.name || 'Unnamed Product',
        price: item.product.price || 0,
        quantity: item.quantity || 1,
        paymentStatus,
      }));
    } else if (product) {
      // We have a single product
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

    // Calculate total amount
    const totalAmount = productsArray.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );

    // Create the request data for the transaction
    const requestData = {
      transactionDate: new Date().toISOString(),
      userId: user._id,
      products: productsArray,
      totalAmount,
      paymentStatus,
      paymentMethod,
    };

    console.log('Request Data:', requestData); // Debug log to verify the request data

    try {
      // Make the API request to create the transaction
      const response = await fetch(`${config.apiUrl}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      // Check for errors in the response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create transaction.' }));
        console.error('Error creating transaction:', errorData.message);
        throw new Error(errorData.message);
      }

      // Parse the response data
      const data = await response.json();
      console.log('Transaction created successfully:', data);

      // Optionally, display a success message
      message.success('Payment Successful! Please Wait!');

      // Return the transaction data for further processing if needed
      return data;

    } catch (error) {
      // Handle any errors during the API call
      console.error('Error creating transaction:', error.message);
      message.error('Error saving transaction. Please try again.');
      return null;
    }
  };

  // Check if we have either a product or cart items
  if (!loading && !product && (!cartItems || cartItems.length === 0)) {
    return <div>No products selected for payment.</div>;
  }

  const updatePurchasedItems = () => {
    try {
      // Fetch the existing purchased data from local storage
      const storedData = JSON.parse(localStorage.getItem('purchasedData')) || {};
      const userData = storedData[user._id] || { paidItems: [], payLaterItems: [] };

      // Handle multiple products from cart
      if (cartItems && cartItems.length > 0) {
        // Process each cart item
        cartItems.forEach(item => {
          const purchaseItem = {
            name: item.product.name,
            price: item.product.price * item.quantity,
            quantity: item.quantity,
          };

          // Add the product to the appropriate list based on the payment method
          if (paymentMethod === 'Cash') {
            userData.paidItems.push(purchaseItem);
          } else {
            userData.payLaterItems.push(purchaseItem);
          }
        });
      }
      // Handle single product
      else if (product) {
        const purchaseItem = {
          name: product.name,
          price: product.price * quantity,
          quantity: quantity,
        };

        // Add the product to the appropriate list based on the payment method
        if (paymentMethod === 'Cash') {
          userData.paidItems.push(purchaseItem);
        } else {
          userData.payLaterItems.push(purchaseItem);
        }
      }

      // Update the purchased data in local storage
      storedData[user._id] = userData;
      localStorage.setItem('purchasedData', JSON.stringify(storedData));
      console.log('Purchased items updated successfully:', storedData); // Debug log
    } catch (error) {
      console.error('Error updating purchased items:', error.message);
    }
  };

  const updateProductQuantity = async () => {
    try {
      let success = true;

      // Handle multiple products from cart
      if (cartItems && cartItems.length > 0) {
        // Process each cart item
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
      }
      // Handle single product
      else if (product) {
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
    // Prevent double submissions
    if (processingPayment) {
      return;
    }

    try {
      // Set processing state to true to prevent multiple clicks
      setProcessingPayment(true);

      // Show loading message
      message.loading('Processing payment...', 0);

      // Ensure the product quantity is updated on the server
      const isUpdated = await updateProductQuantity();

      if (isUpdated) {
        // Create the transaction in the database
        const transaction = await createTransaction();

        if (transaction) {
          // Update local purchased data
          updatePurchasedItems();
          await markCurrentDraftsComplete();

          // Prepare receipt data based on whether we have cart items or a single product
          let receiptData;

          if (cartItems && cartItems.length > 0) {
            // Calculate total price for all cart items
            const totalPrice = cartItems.reduce(
              (total, item) => total + (item.product.price * item.quantity),
              0
            );

            // Create receipt data for multiple products
            receiptData = {
              products: cartItems.map(item => ({
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                totalPrice: item.product.price * item.quantity,
              })),
              totalPrice,
              paymentMethod,
              paymentStatus: paymentMethod === 'Cash' ? 'Paid' : 'Pay Later',
              user: {
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
              },
              transactionId: uuidv4(),
              transactionDate: new Date().toISOString(),
              isMultipleProducts: true,
            };
          } else {
            // Create receipt data for a single product
            receiptData = {
              product: {
                name: product.name,
                price: product.price,
              },
              quantity,
              totalPrice: product.price * quantity,
              paymentMethod,
              paymentStatus: paymentMethod === 'Cash' ? 'Paid' : 'Pay Later',
              user: {
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
              },
              transactionId: uuidv4(),
              transactionDate: new Date().toISOString(),
              isMultipleProducts: false,
            };
          }

          try {
            const response = await fetch(`${config.apiUrl}/api/generate-receipt`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(receiptData),
            });

            const data = await response.json();
            console.log('Receipt API response:', data);

            if (response.ok) {
              // Prepare state data for the Thank You page
              let thankYouState;

              // Set receipt URL if available, otherwise set to null
              const receiptUrl = data.fileUrl || null;

              if (cartItems && cartItems.length > 0) {
                // For multiple products
                thankYouState = {
                  cartItems,
                  totalPrice: cartItems.reduce(
                    (total, item) => total + (item.product.price * item.quantity),
                    0
                  ),
                  receiptUrl: receiptUrl,
                  receiptStatus: data.driveUpload ? 'uploaded' : 'email_only',
                  emailSent: data.emailSent,
                  paymentMethod,
                  user: {
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email
                  },
                  isMultipleProducts: true
                };
              } else {
                // For a single product
                thankYouState = {
                  product,
                  quantity,
                  totalPrice: product.price * quantity,
                  receiptUrl: receiptUrl,
                  receiptStatus: data.driveUpload ? 'uploaded' : 'email_only',
                  emailSent: data.emailSent,
                  paymentMethod,
                  user: {
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email
                  },
                  isMultipleProducts: false
                };
              }

              // Show success message
              message.success('Payment processed successfully!');

              // Redirect to Thank You page with transaction details
              navigate('/thank-you', { state: thankYouState });
            } else {
              // Handle error response
              console.error('Error generating receipt:', data);

              // Show error message but still proceed to thank you page
              message.warning('Payment processed, but receipt generation had issues. Check your email later.');

              // Create thank you state without receipt URL
              let thankYouState = cartItems && cartItems.length > 0
                ? {
                    cartItems,
                    totalPrice: cartItems.reduce(
                      (total, item) => total + (item.product.price * item.quantity),
                      0
                    ),
                    receiptUrl: null,
                    receiptStatus: 'failed',
                    paymentMethod,
                    user: {
                      firstname: user.firstname,
                      lastname: user.lastname,
                      email: user.email
                    },
                    isMultipleProducts: true
                  }
                : {
                    product,
                    quantity,
                    totalPrice: product.price * quantity,
                    receiptUrl: null,
                    receiptStatus: 'failed',
                    paymentMethod,
                    user: {
                      firstname: user.firstname,
                      lastname: user.lastname,
                      email: user.email
                    },
                    isMultipleProducts: false
                  };

              // Still navigate to thank you page
              navigate('/thank-you', { state: thankYouState });
            }
          } catch (error) {
            console.error('Error in receipt generation:', error);
            message.error('Payment processed, but there was an error generating the receipt.');

            // Navigate to thank you page without receipt
            const thankYouState = cartItems && cartItems.length > 0
              ? {
                  cartItems,
                  totalPrice: cartItems.reduce(
                    (total, item) => total + (item.product.price * item.quantity),
                    0
                  ),
                  receiptUrl: null,
                  receiptStatus: 'error',
                  paymentMethod,
                  user: {
                    firstname: user.firstname,
                    lastname: user.lastname,
                  },
                  isMultipleProducts: true
                }
              : {
                  product,
                  quantity,
                  totalPrice: product.price * quantity,
                  receiptUrl: null,
                  receiptStatus: 'error',
                  paymentMethod,
                  user: {
                    firstname: user.firstname,
                    lastname: user.lastname,
                  },
                  isMultipleProducts: false
                };

            navigate('/thank-you', { state: thankYouState });
          }
        }
      }
    } catch (error) {
      console.error('Error during payment confirmation:', error.message);
      message.error('Payment could not be completed. Please try again.');
    } finally {
      // Reset processing state regardless of success or failure
      setProcessingPayment(false);
      // Destroy any loading message
      message.destroy();
    }
  };

  if (loading) {
    return (
      <Spin
        tip="Loading product details..."
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      />
    );
  }

  return (
    <Layout
  style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)',
    color: 'white',
    padding: '24px',
  }}
>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <Button
  type="text"
  icon={<LeftOutlined />}
  onClick={handleBack}
  style={{
    color: 'white',
    fontWeight: 'bold',
    fontSize: '16px',
  }}
>
  Back
</Button>

        <div style={{ textAlign: 'center', flexGrow: 1 }}>
          <Typography.Title level={3} style={{ color: '#FFD700', margin: 0 }}>
            🛒 Enjoy Buying!
          </Typography.Title>
          <Typography.Text style={{ color: '#FFFFFF', fontSize: '14px' }}>
            Double-check your selections before proceeding.
          </Typography.Text>
        </div>
      </div>

      {/* Content */}
      <Content>
        {error && (
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <Typography.Text style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
              {error}
            </Typography.Text>
          </div>
        )}

        <Row gutter={[24, 24]} justify="center">
          {/* Product Section */}
          <Col xs={24} sm={24} md={10}>
            <Card
              hoverable
              style={{
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {product ? (
                // Single product display
                <>
                  <div style={{ textAlign: 'center' }}>
                    <Image
                      src={product.image || ''}
                      alt={product?.name || 'Product Image'}
                      style={{
                        width: '100%',
                        maxHeight: '300px',
                        objectFit: 'contain',
                        marginBottom: '16px',
                      }}
                      preview={false}
                    />
                  </div>
                  <Divider />
                  <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                    <Typography.Title level={4} style={{ color: '#333' }}>
                      {product.name}
                    </Typography.Title>
                    <Typography.Text style={{ fontSize: '16px', color: '#555' }}>
                      Price: <strong>₱{product.price}</strong>
                    </Typography.Text>
                    <Typography.Text style={{ fontSize: '16px', color: '#555' }}>
                      Available Quantity: <strong>{product.quantity}</strong>
                    </Typography.Text>
                  </Space>
                  <Divider />
                  <Typography.Text
                    style={{
                      fontSize: '12px',
                      color: '#888',
                      textAlign: 'center',
                    }}
                  >
                    * Ensure the selected quantity matches the available stock.
                  </Typography.Text>
                </>
              ) : cartItems && cartItems.length > 0 ? (
                // Cart items display
                <>
                  <div style={{
                    background: 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 100%)',
                    padding: '16px',
                    borderTopLeftRadius: '10px',
                    borderTopRightRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}>
                    <ShoppingCartOutlined style={{ color: 'white', fontSize: '24px' }} />
                    <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>
                      Your Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                    </Typography.Title>
                  </div>

                  <div style={{
                    maxHeight: '350px',
                    overflowY: 'auto',
                    padding: '16px',
                    background: 'rgba(249, 249, 249, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '0 0 10px 10px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#1a2a6c #f9f9f9',
                  }}>
                    {cartItems.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          marginBottom: '16px',
                          background: 'white',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          border: '1px solid rgba(234, 234, 234, 0.8)',
                          position: 'relative',
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          backgroundColor: '#1a2a6c',
                          color: 'white',
                          borderRadius: '20px',
                          padding: '2px 8px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          zIndex: 1,
                        }}>
                          {item.quantity}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '16px',
                        }}>
                          <div style={{
                            width: '80px',
                            height: '80px',
                            marginRight: '16px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            border: '2px solid white',
                          }}>
                            <Image
                              src={item.product.image ? (item.product.image.startsWith('http') ? item.product.image : `${baseURL}/${item.product.image?.replace(/\\/g, '/')}`) : ''}
                              alt={item.product.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease',
                              }}
                              preview={false}
                              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <Typography.Text style={{
                              fontWeight: 'bold',
                              display: 'block',
                              fontSize: '17px',
                              color: '#1a2a6c',
                              marginBottom: '6px',
                            }}>
                              {item.product.name}
                            </Typography.Text>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginTop: '8px',
                            }}>
                              <Typography.Text style={{
                                fontSize: '14px',
                                color: '#666',
                                backgroundColor: 'rgba(26, 42, 108, 0.08)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                              }}>
                                ₱{item.product.price.toFixed(2)} each
                              </Typography.Text>
                              <Typography.Text style={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: '#b21f1f',
                                background: 'linear-gradient(45deg, #1a2a6c, #b21f1f)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                              }}>
                                ₱{(item.product.price * item.quantity).toFixed(2)}
                              </Typography.Text>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    background: 'linear-gradient(to right, rgba(26, 42, 108, 0.05), rgba(178, 31, 31, 0.05))',
                    padding: '20px',
                    borderBottomLeftRadius: '10px',
                    borderBottomRightRadius: '10px',
                    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)',
                    borderTop: '1px solid rgba(0,0,0,0.05)',
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderBottom: '1px dashed rgba(0,0,0,0.1)',
                      }}>
                        <Typography.Text style={{
                          fontSize: '15px',
                          color: '#666',
                        }}>
                          Subtotal:
                        </Typography.Text>
                        <Typography.Text style={{
                          fontSize: '15px',
                          color: '#333',
                        }}>
                          ₱{cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2)}
                        </Typography.Text>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderBottom: '1px dashed rgba(0,0,0,0.1)',
                      }}>
                        <Typography.Text style={{
                          fontSize: '15px',
                          color: '#666',
                        }}>
                          Items:
                        </Typography.Text>
                        <Typography.Text style={{
                          fontSize: '15px',
                          color: '#333',
                        }}>
                          {cartItems.reduce((total, item) => total + item.quantity, 0)}
                        </Typography.Text>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        marginTop: '8px',
                      }}>
                        <Typography.Text style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#333',
                        }}>
                          Total:
                        </Typography.Text>
                        <Typography.Text style={{
                          fontSize: '24px',
                          fontWeight: 'bold',
                          background: 'linear-gradient(45deg, #1a2a6c, #b21f1f)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}>
                          ₱{cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2)}
                        </Typography.Text>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Fallback for no products
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <Typography.Text style={{ fontSize: '16px', color: '#555' }}>
                    No products selected for payment.
                  </Typography.Text>
                </div>
              )}
            </Card>
          </Col>

          {/* Payment Section */}
          <Col xs={24} sm={24} md={10}>
            <Card
              hoverable
              style={{
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, #1a2a6c, #b21f1f)',
                  padding: '20px',
                  borderRadius: '10px 10px 0 0',
                  marginBottom: '20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}>
                  <Typography.Title
                    level={4}
                    style={{
                      color: 'white',
                      margin: 0,
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    Payment Details
                  </Typography.Title>
                </div>

                {product && (
                  <div style={{
                    background: 'rgba(26, 42, 108, 0.05)',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                  }}>
                    <Typography.Text style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#1a2a6c',
                    }}>
                      Select Quantity:
                    </Typography.Text>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}>
                      <Button
                        icon={<FaMinus />}
                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                        disabled={quantity <= 1}
                        style={{
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      />
                      <InputNumber
                        min={1}
                        max={product?.quantity || 1}
                        value={quantity}
                        onChange={setQuantity}
                        style={{
                          width: '100%',
                          borderRadius: '8px',
                        }}
                        controls={false}
                      />
                      <Button
                        icon={<FaPlus />}
                        onClick={() => quantity < (product?.quantity || 1) && setQuantity(quantity + 1)}
                        disabled={quantity >= (product?.quantity || 1)}
                        style={{
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      />
                    </div>
                    <Typography.Text style={{
                      display: 'block',
                      marginTop: '8px',
                      fontSize: '12px',
                      color: quantity >= (product?.quantity || 1) ? '#f44336' : '#888',
                    }}>
                      {quantity >= (product?.quantity || 1)
                        ? 'Maximum available quantity selected'
                        : `Available: ${product?.quantity || 1}`}
                    </Typography.Text>
                  </div>
                )}

                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  marginBottom: '20px',
                }}>
                  <Typography.Text style={{
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: '500',
                    color: '#1a2a6c',
                    fontSize: '16px',
                  }}>
                    Choose Payment Method:
                  </Typography.Text>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}>
                    <div
                      onClick={() => setPaymentMethod('Cash')}
                      style={{
                        padding: '16px',
                        borderRadius: '10px',
                        border: `2px solid ${paymentMethod === 'Cash' ? '#4caf50' : '#e0e0e0'}`,
                        background: paymentMethod === 'Cash' ? 'rgba(76, 175, 80, 0.05)' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: paymentMethod === 'Cash' ? '#4caf50' : 'rgba(76, 175, 80, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '16px',
                      }}>
                        <DollarCircleOutlined style={{
                          color: paymentMethod === 'Cash' ? 'white' : '#4caf50',
                          fontSize: '20px'
                        }} />
                      </div>
                      <div>
                        <Typography.Text style={{
                          display: 'block',
                          fontWeight: '500',
                          color: paymentMethod === 'Cash' ? '#4caf50' : '#333',
                        }}>
                          Cash
                        </Typography.Text>
                        <Typography.Text style={{
                          display: 'block',
                          fontSize: '12px',
                          color: '#888',
                        }}>
                          Pay now with cash
                        </Typography.Text>
                      </div>
                      <Radio
                        checked={paymentMethod === 'Cash'}
                        style={{ marginLeft: 'auto' }}
                        onChange={() => setPaymentMethod('Cash')}
                      />
                    </div>

                    <div
                      onClick={() => setPaymentMethod('Pay Later')}
                      style={{
                        padding: '16px',
                        borderRadius: '10px',
                        border: `2px solid ${paymentMethod === 'Pay Later' ? '#f44336' : '#e0e0e0'}`,
                        background: paymentMethod === 'Pay Later' ? 'rgba(244, 67, 54, 0.05)' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: paymentMethod === 'Pay Later' ? '#f44336' : 'rgba(244, 67, 54, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '16px',
                      }}>
                        <ShoppingCartOutlined style={{
                          color: paymentMethod === 'Pay Later' ? 'white' : '#f44336',
                          fontSize: '20px'
                        }} />
                      </div>
                      <div>
                        <Typography.Text style={{
                          display: 'block',
                          fontWeight: '500',
                          color: paymentMethod === 'Pay Later' ? '#f44336' : '#333',
                        }}>
                          Pay Later
                        </Typography.Text>
                        <Typography.Text style={{
                          display: 'block',
                          fontSize: '12px',
                          color: '#888',
                        }}>
                          Pay at a later time
                        </Typography.Text>
                      </div>
                      <Radio
                        checked={paymentMethod === 'Pay Later'}
                        style={{ marginLeft: 'auto' }}
                        onChange={() => setPaymentMethod('Pay Later')}
                      />
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(26, 42, 108, 0.05)',
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#1a2a6c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <ExclamationCircleOutlined style={{ color: 'white', fontSize: '14px' }} />
                  </div>
                  <Typography.Text style={{
                    fontSize: '12px',
                    color: '#666',
                  }}>
                    All payment methods are secure and verified. Please review your order before proceeding.
                  </Typography.Text>
                </div>
              </div>
              <Divider style={{ margin: '20px 0' }} />
              <Typography.Text style={{
                fontSize: '13px',
                color: '#666',
                textAlign: 'center',
                display: 'block',
                marginBottom: '10px',
              }}>
                By proceeding, you confirm your order details and payment method.
              </Typography.Text>
              <Button
  type="primary"
  block
  size="large"
  onClick={handlePaymentClick}
  disabled={!paymentMethod || processingPayment}
  loading={processingPayment}
  style={{
    background: paymentMethod === 'Cash'
      ? 'linear-gradient(45deg, #2e7d32, #4caf50)'
      : paymentMethod === 'Pay Later'
        ? 'linear-gradient(45deg, #c62828, #f44336)'
        : 'linear-gradient(45deg, #1a2a6c, #b21f1f)',
    border: 'none',
    height: '50px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease',
  }}
  onMouseOver={(e) => {
    if (!processingPayment && paymentMethod) {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
    }
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  }}
>
  {processingPayment ? (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
      <span>Processing...</span>
    </div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
      {paymentMethod === 'Cash' ? (
        <DollarCircleOutlined style={{ fontSize: '20px' }} />
      ) : paymentMethod === 'Pay Later' ? (
        <ShoppingCartOutlined style={{ fontSize: '20px' }} />
      ) : null}
      <span>
        {cartItems && cartItems.length > 0 ? (
          `Pay ₱${cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2)}`
        ) : product ? (
          `Pay ₱${(product.price * quantity).toFixed(2)}`
        ) : (
          'Proceed to Payment'
        )}
      </span>
    </div>
  )}
</Button>

            </Card>
          </Col>
        </Row>
      </Content>

      {/* Confirmation Modal */}
      <Modal
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 0',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: paymentMethod === 'Cash'
                ? 'linear-gradient(45deg, #2e7d32, #4caf50)'
                : paymentMethod === 'Pay Later'
                  ? 'linear-gradient(45deg, #c62828, #f44336)'
                  : 'linear-gradient(45deg, #1a2a6c, #b21f1f)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              {paymentMethod === 'Cash' ? (
                <DollarCircleOutlined style={{ color: 'white', fontSize: '20px' }} />
              ) : paymentMethod === 'Pay Later' ? (
                <ShoppingCartOutlined style={{ color: 'white', fontSize: '20px' }} />
              ) : (
                <ExclamationCircleOutlined style={{ color: 'white', fontSize: '20px' }} />
              )}
            </div>
            <Typography.Title level={4} style={{
              margin: 0,
              background: paymentMethod === 'Cash'
                ? 'linear-gradient(45deg, #2e7d32, #4caf50)'
                : paymentMethod === 'Pay Later'
                  ? 'linear-gradient(45deg, #c62828, #f44336)'
                  : 'linear-gradient(45deg, #1a2a6c, #b21f1f)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Confirm {paymentMethod} Payment
            </Typography.Title>
          </div>
        }
        open={isModalOpen}
        onCancel={() => !processingPayment && setIsModalOpen(false)}
        maskClosable={!processingPayment}
        keyboard={!processingPayment}
        closable={!processingPayment}
        width={500}
        centered
        styles={{ body: { padding: '24px' } }}
        footer={[
          <Button
            key="cancel"
            onClick={() => !processingPayment && setIsModalOpen(false)}
            disabled={processingPayment}
            style={{
              borderRadius: '8px',
              height: '40px',
              fontWeight: '500',
            }}
          >
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={handleConfirmPayment}
            loading={processingPayment}
            disabled={processingPayment}
            style={{
              background: paymentMethod === 'Cash'
                ? 'linear-gradient(45deg, #2e7d32, #4caf50)'
                : paymentMethod === 'Pay Later'
                  ? 'linear-gradient(45deg, #c62828, #f44336)'
                  : 'linear-gradient(45deg, #1a2a6c, #b21f1f)',
              border: 'none',
              borderRadius: '8px',
              height: '40px',
              fontWeight: '500',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {processingPayment ? 'Processing...' : 'Confirm Payment'}
          </Button>
        ]}
      >
        {cartItems && cartItems.length > 0 ? (
          <>
            <div style={{
              background: 'rgba(26, 42, 108, 0.05)',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px',
            }}>
              <Typography.Text style={{
                display: 'block',
                marginBottom: '16px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#333',
              }}>
                You are about to pay for the following items using <span style={{
                  color: paymentMethod === 'Cash' ? '#2e7d32' : '#c62828',
                  fontWeight: 'bold',
                }}>{paymentMethod}</span>:
              </Typography.Text>

              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                marginBottom: '16px',
                padding: '4px',
                borderRadius: '8px',
              }}>
                {cartItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: '12px',
                      padding: '12px',
                      background: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}>
                      <Image
                        src={item.product.image ? (item.product.image.startsWith('http') ? item.product.image : `${baseURL}/${item.product.image?.replace(/\\/g, '/')}`) : ''}
                        alt={item.product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        preview={false}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Typography.Text style={{
                        display: 'block',
                        fontWeight: '500',
                        color: '#333',
                      }}>
                        {item.product.name}
                      </Typography.Text>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '4px',
                      }}>
                        <Typography.Text style={{
                          fontSize: '13px',
                          color: '#666',
                        }}>
                          {item.quantity} x ₱{item.product.price.toFixed(2)}
                        </Typography.Text>
                        <Typography.Text style={{
                          fontWeight: 'bold',
                          color: '#1a2a6c',
                        }}>
                          ₱{(item.product.price * item.quantity).toFixed(2)}
                        </Typography.Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              marginBottom: '20px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px dashed rgba(0,0,0,0.1)',
              }}>
                <Typography.Text style={{ color: '#666' }}>
                  Subtotal:
                </Typography.Text>
                <Typography.Text>
                  ₱{cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2)}
                </Typography.Text>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                marginTop: '8px',
              }}>
                <Typography.Text style={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}>
                  Total:
                </Typography.Text>
                <Typography.Text style={{
                  fontWeight: 'bold',
                  fontSize: '18px',
                  color: '#1a2a6c',
                }}>
                  ₱{cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2)}
                </Typography.Text>
              </div>
            </div>

            <div style={{
              background: paymentMethod === 'Cash'
                ? 'rgba(76, 175, 80, 0.1)'
                : 'rgba(244, 67, 54, 0.1)',
              padding: '12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: paymentMethod === 'Cash' ? '#4caf50' : '#f44336',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <ExclamationCircleOutlined style={{ color: 'white', fontSize: '14px' }} />
              </div>
              <Typography.Text style={{ fontSize: '14px' }}>
                {paymentMethod === 'Cash'
                  ? 'You will pay the full amount now.'
                  : 'You will need to pay this amount later.'}
              </Typography.Text>
            </div>
          </>
        ) : product ? (
          <>
            <div style={{
              background: 'rgba(26, 42, 108, 0.05)',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>
                <Image
                  src={product.image || ''}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  preview={false}
                />
              </div>
              <div>
                <Typography.Text style={{
                  display: 'block',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  color: '#1a2a6c',
                  marginBottom: '4px',
                }}>
                  {product.name}
                </Typography.Text>
                <Typography.Text style={{
                  display: 'block',
                  color: '#666',
                  marginBottom: '8px',
                }}>
                  Quantity: {quantity}
                </Typography.Text>
                <Typography.Text style={{
                  display: 'block',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  color: '#b21f1f',
                }}>
                  ₱{(product.price * quantity).toFixed(2)}
                </Typography.Text>
              </div>
            </div>

            <div style={{
              background: paymentMethod === 'Cash'
                ? 'rgba(76, 175, 80, 0.1)'
                : 'rgba(244, 67, 54, 0.1)',
              padding: '12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: paymentMethod === 'Cash' ? '#4caf50' : '#f44336',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <ExclamationCircleOutlined style={{ color: 'white', fontSize: '14px' }} />
              </div>
              <Typography.Text style={{ fontSize: '14px' }}>
                You are about to pay <strong>₱{(product.price * quantity).toFixed(2)}</strong> for <strong>{product.name}</strong> using{' '}
                <span style={{
                  color: paymentMethod === 'Cash' ? '#2e7d32' : '#c62828',
                  fontWeight: 'bold',
                }}>{paymentMethod}</span>.
              </Typography.Text>
            </div>
          </>
        ) : (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            background: 'rgba(244, 67, 54, 0.05)',
            borderRadius: '8px',
          }}>
            <ExclamationCircleOutlined style={{ fontSize: '32px', color: '#f44336', marginBottom: '16px' }} />
            <Typography.Text style={{
              display: 'block',
              fontSize: '16px',
              color: '#f44336',
            }}>
              No product selected. Please go back and select a product.
            </Typography.Text>
          </div>
        )}
      </Modal>
    </Layout>
  );
}

export default PaymentPage;
