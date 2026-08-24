const assert = require('assert');
const crypto = require('crypto');

const API_BASE = 'http://localhost:5000/api';

const runRazorpayTests = async () => {
  console.log('--- Starting Razorpay API Verification Tests ---');

  let farmerToken = '';
  let productId = '';
  let orderId = '';
  let paymentId = '';

  try {
    // 1. Farmer Login
    console.log('Logging in as farmer...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'farmer@gmail.com', password: 'farmerpassword123' })
    });
    const loginData = await loginRes.json();
    assert.strictEqual(loginRes.status, 200, 'Login status should be 200');
    farmerToken = loginData.token;

    // 2. Fetch products
    console.log('Fetching products...');
    const productsRes = await fetch(`${API_BASE}/products`);
    const productsData = await productsRes.json();
    productId = productsData.products[0]._id;

    // 3. Create Order with paymentMethod = 'Razorpay'
    console.log('Creating order with Razorpay payment method...');
    const orderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`
      },
      body: JSON.stringify({
        items: [{ product: productId, quantity: 1 }],
        shippingAddress: {
          street: 'Test Street 123',
          city: 'Bhatinda',
          state: 'Punjab',
          zip: '151001'
        },
        paymentMethod: 'Razorpay'
      })
    });
    const orderData = await orderRes.json();
    assert.strictEqual(orderRes.status, 201, 'Order placement status should be 201');
    assert.strictEqual(orderData.success, true, 'Order creation should succeed');
    assert.ok(orderData.razorpayOrder, 'Response should contain razorpayOrder object');
    assert.ok(orderData.keyId, 'Response should contain keyId');
    assert.strictEqual(orderData.payment.paymentMethod, 'Razorpay', 'Payment record method should be Razorpay');

    orderId = orderData.order._id;
    paymentId = orderData.payment._id;
    const rzpOrderId = orderData.razorpayOrder.id;

    console.log(`✓ Order placed with Razorpay method. Order ID: ${orderId}, Razorpay Order ID: ${rzpOrderId}`);

    // 4. Verify Razorpay Payment (Simulate success)
    console.log('Simulating Razorpay Payment verification...');
    const rzpPaymentId = `pay_mock_${Date.now()}`;
    const keySecret = 'mocksecret12345';
    
    // Create expected signature using mock credentials
    const body = rzpOrderId + "|" + rzpPaymentId;
    const rzpSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    const verifyRes = await fetch(`${API_BASE}/payments/verify-razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`
      },
      body: JSON.stringify({
        razorpay_payment_id: rzpPaymentId,
        razorpay_order_id: rzpOrderId,
        razorpay_signature: rzpSignature,
        orderId,
        paymentId
      })
    });

    const verifyData = await verifyRes.json();
    assert.strictEqual(verifyRes.status, 200, 'Verification status should be 200');
    assert.strictEqual(verifyData.success, true, 'Payment verification should succeed');
    assert.strictEqual(verifyData.payment.status, 'Paid', 'Payment status should now be Paid');
    assert.strictEqual(verifyData.payment.pendingAmount, 0, 'Pending amount should be 0');
    assert.strictEqual(verifyData.payment.paidAmount, verifyData.payment.totalAmount, 'Paid amount should equal total amount');
    assert.strictEqual(verifyData.transactionId, rzpPaymentId, 'Transaction reference should match payment ID');

    console.log('✓ Razorpay Signature verification and balance updates passed successfully.');

    // 5. Test existing payment balance Razorpay Order generation
    console.log('Testing Razorpay order generation for existing unpaid payments...');
    
    // First, let's create a pending COD order
    const pendingOrderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`
      },
      body: JSON.stringify({
        items: [{ product: productId, quantity: 1 }],
        shippingAddress: {
          street: 'Test Street 123',
          city: 'Bhatinda',
          state: 'Punjab',
          zip: '151001'
        },
        paymentMethod: 'COD'
      })
    });
    const pendingOrderData = await pendingOrderRes.json();
    const pendingPaymentId = pendingOrderData.payment._id;

    const rzpBalanceRes = await fetch(`${API_BASE}/payments/razorpay-order/${pendingPaymentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`
      },
      body: JSON.stringify({ amount: 100 }) // Let's pay 100 Rs
    });
    const rzpBalanceData = await rzpBalanceRes.json();
    assert.strictEqual(rzpBalanceRes.status, 200, 'Balance payment Razorpay order status should be 200');
    assert.strictEqual(rzpBalanceData.success, true, 'Balance payment Razorpay order creation should succeed');
    assert.ok(rzpBalanceData.razorpayOrder, 'Response should contain razorpayOrder');
    assert.strictEqual(rzpBalanceData.amount, 100, 'Requested amount should match');

    console.log('✓ Existing balance Razorpay order generation passed.');

    console.log('\n================================================');
    console.log('  ALL RAZORPAY INTEGRATION TESTS PASSED!       ');
    console.log('================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Razorpay Verification Test Failed:', error.message);
    process.exit(1);
  }
};

runRazorpayTests();
