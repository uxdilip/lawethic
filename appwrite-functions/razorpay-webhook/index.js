const sdk = require('node-appwrite');
const crypto = require('crypto');

/*
  Razorpay Webhook Handler
  
  This function:
  1. Receives webhook from Razorpay after payment
  2. Verifies signature
  3. Updates order payment status
  4. Creates payment record
  5. Sends confirmation notification
  
  Phase 2 Implementation
*/

module.exports = async function (req, res) {
    const client = new sdk.Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new sdk.Databases(client);

    try {
        // Get webhook payload
        const payload = req.payload || req.body;
        const signature = req.headers['x-razorpay-signature'];

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(JSON.stringify(payload))
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.json({ success: false, error: 'Invalid signature' }, 401);
        }

        // Extract payment details
        const event = payload.event;
        const paymentData = payload.payload.payment.entity;

        if (event === 'payment.captured') {
            // Payment successful - update order
            const orderId = paymentData.notes.order_id;

            // Update order status
            await databases.updateDocument(
                process.env.APPWRITE_DATABASE_ID,
                'orders',
                orderId,
                {
                    paymentStatus: 'paid',
                    paymentId: paymentData.id,
                }
            );

            // Create payment record
            await databases.createDocument(
                process.env.APPWRITE_DATABASE_ID,
                'payments',
                sdk.ID.unique(),
                {
                    orderId,
                    razorpayOrderId: paymentData.order_id,
                    razorpayPaymentId: paymentData.id,
                    razorpaySignature: signature,
                    amount: paymentData.amount,
                    status: 'paid',
                    method: paymentData.method,
                }
            );

            // TODO: Send confirmation notification/email

            return res.json({ success: true, message: 'Payment processed' });
        }

        return res.json({ success: true, message: 'Event received' });
    } catch (error) {
        console.error('Webhook error:', error);
        return res.json({ success: false, error: error.message }, 500);
    }
};
