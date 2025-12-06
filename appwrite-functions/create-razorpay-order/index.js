const sdk = require('node-appwrite');
const Razorpay = require('razorpay');

/*
  Create Razorpay Order
  
  This function:
  1. Receives order ID from client
  2. Fetches order details from database
  3. Creates Razorpay order
  4. Returns order details to client
  
  Phase 2 Implementation
*/

module.exports = async function (req, res) {
    const client = new sdk.Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new sdk.Databases(client);

    try {
        const { orderId } = JSON.parse(req.payload || req.body);

        if (!orderId) {
            return res.json({ success: false, error: 'Order ID required' }, 400);
        }

        // Fetch order from database
        const order = await databases.getDocument(
            process.env.APPWRITE_DATABASE_ID,
            'orders',
            orderId
        );

        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: order.amount * 100, // Amount in paise
            currency: 'INR',
            receipt: order.orderNumber,
            notes: {
                order_id: orderId,
                customer_id: order.customerId,
            },
        });

        // Update order with Razorpay order ID
        await databases.updateDocument(
            process.env.APPWRITE_DATABASE_ID,
            'orders',
            orderId,
            {
                paymentId: razorpayOrder.id,
            }
        );

        return res.json({
            success: true,
            data: {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
            },
        });
    } catch (error) {
        console.error('Create order error:', error);
        return res.json({ success: false, error: error.message }, 500);
    }
};
