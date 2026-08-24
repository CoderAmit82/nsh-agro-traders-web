const assert = require('assert');

const API_BASE = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('--- Starting Programmatic API Verification Tests ---');

  let farmerToken = '';
  let adminToken = '';
  let productId = '';
  let orderId = '';
  let paymentId = '';

  try {
    // 1. Test Admin Login
    console.log('Testing Admin Login...');
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@nshagro.com', password: 'adminpassword123' })
    });
    const adminLoginData = await adminLoginRes.json();
    assert.strictEqual(adminLoginRes.status, 200, 'Admin login status should be 200');
    assert.strictEqual(adminLoginData.success, true, 'Admin login success should be true');
    assert.strictEqual(adminLoginData.user.role, 'admin', 'User role should be admin');
    adminToken = adminLoginData.token;
    console.log('✓ Admin Login passed.');

    // 2. Test Farmer Login
    console.log('Testing Farmer Login...');
    const farmerLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'farmer@gmail.com', password: 'farmerpassword123' })
    });
    const farmerLoginData = await farmerLoginRes.json();
    assert.strictEqual(farmerLoginRes.status, 200, 'Farmer login status should be 200');
    assert.strictEqual(farmerLoginData.success, true, 'Farmer login success should be true');
    assert.strictEqual(farmerLoginData.user.role, 'farmer', 'User role should be farmer');
    farmerToken = farmerLoginData.token;
    console.log('✓ Farmer Login passed.');

    // 3. Test Products Listing
    console.log('Testing Product Listing...');
    const productsRes = await fetch(`${API_BASE}/products`);
    const productsData = await productsRes.json();
    assert.strictEqual(productsRes.status, 200, 'Product list status should be 200');
    assert.strictEqual(productsData.success, true, 'Product list success should be true');
    assert.ok(productsData.products.length > 0, 'Products list should not be empty');
    // Save first product ID (NPK fertilizer)
    const fertilizer = productsData.products.find(p => p.category === 'Fertilizers');
    productId = fertilizer._id;
    console.log(`✓ Product Listing passed. Found fertilizer product ID: ${productId}`);

    // 4. Test Place Order (Farmer)
    console.log('Testing Order Placement & Inventory Decrement...');
    const initialStock = fertilizer.stock;
    const orderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`
      },
      body: JSON.stringify({
        items: [{ product: productId, quantity: 2 }],
        shippingAddress: {
          street: 'Village Rampur, Sector 4',
          city: 'Bhatinda',
          state: 'Punjab',
          zip: '151001'
        },
        paymentMethod: 'COD'
      })
    });
    const orderData = await orderRes.json();
    assert.strictEqual(orderRes.status, 201, 'Order creation status should be 210');
    assert.strictEqual(orderData.success, true, 'Order success should be true');
    orderId = orderData.order._id;
    paymentId = orderData.payment._id;

    // Verify stock was decremented in database
    const checkProductRes = await fetch(`${API_BASE}/products/${productId}`);
    const checkProductData = await checkProductRes.json();
    assert.strictEqual(checkProductData.product.stock, initialStock - 2, 'Stock should be decremented by 2');
    console.log(`✓ Order placement and stock decrement verified. Order ID: ${orderId}, Payment ID: ${paymentId}`);

    // 5. Test Mock Balance Payment
    console.log('Testing Mock Balance Payment...');
    const payRes = await fetch(`${API_BASE}/payments/pay/${paymentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`
      },
      body: JSON.stringify({
        amount: 200,
        paymentMethod: 'Mock UPI'
      })
    });
    const payData = await payRes.json();
    assert.strictEqual(payRes.status, 200, 'Payment status should be 200');
    assert.strictEqual(payData.success, true, 'Payment success should be true');
    assert.strictEqual(payData.payment.paidAmount, 200, 'Paid amount should be 200');
    console.log(`✓ Mock payment executed. Transaction reference: ${payData.transactionId}`);

    // 6. Test Chat Message Dispatch
    console.log('Testing Chat Messaging between Farmer & Admin...');
    const chatRes = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${farmerToken}`
      },
      body: JSON.stringify({ messageText: 'Hello support staff, is delivery open on Sundays?' })
    });
    const chatData = await chatRes.json();
    assert.strictEqual(chatRes.status, 201, 'Message dispatch status should be 201');
    assert.strictEqual(chatData.success, true, 'Message dispatch success should be true');
    console.log('✓ Farmer support message sent.');

    // 7. Test Admin Analytics Retrieval
    console.log('Testing Admin Dashboard Analytics & Category Breakdown...');
    const analyticsRes = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const analyticsData = await analyticsRes.json();
    assert.strictEqual(analyticsRes.status, 200, 'Analytics retrieval status should be 200');
    assert.strictEqual(analyticsData.success, true, 'Analytics success should be true');
    assert.ok(analyticsData.stats.totalOrders >= 1, 'Total orders should be at least 1');
    console.log('✓ Admin Analytics gathered successfully.');

    console.log('\n================================================');
    console.log('  ALL API VERIFICATION TESTS PASSED SUCCESSFULLY!  ');
    console.log('================================================\n');
  } catch (error) {
    console.error('❌ Verification Test Failed:', error.message);
    process.exit(1);
  }
};

runTests();
