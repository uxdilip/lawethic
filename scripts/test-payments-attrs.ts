import { Client, Databases, ID } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('692af80b00364ca8a6b2')
    .setKey('standard_89d27dfc6220b586dbd11b45cb73bda182047c5ddefe18bd07b57384ba08eda6fe256559ad23b1d79740f73335eebd44ed1e51198a835156de91266ba1f11285538a566dbe669b36035ddb285412c43ceff5aede62fb5ead53c98826d193600452305935b82bb08ad0972cf23de2017d28ef44fdcaec7776eacf5b232f2f68a7');

const databases = new Databases(client);

async function testPayments() {
    console.log('🧪 Testing payments collection...\n');

    const fullData = {
        orderId: 'test-order',
        razorpayOrderId: 'order_test',
        razorpayPaymentId: 'pay_test',
        amount: 1999,
        status: 'success',
        method: 'razorpay',
    };

    console.log('Testing full payment data:');
    console.log(JSON.stringify(fullData, null, 2));
    console.log('');

    try {
        const doc = await databases.createDocument('main', 'payments', ID.unique(), fullData);
        console.log('✅ SUCCESS!');
        await databases.deleteDocument('main', 'payments', doc.$id);
    } catch (error: any) {
        console.error('❌ FAILED:', error.message);
        console.log('\n🔍 Testing each field individually...\n');

        const fields = Object.keys(fullData);
        for (const field of fields) {
            try {
                const testData = { orderId: 'test', [field]: fullData[field as keyof typeof fullData] };
                const doc = await databases.createDocument('main', 'payments', ID.unique(), testData);
                console.log(`✅ ${field} - VALID`);
                await databases.deleteDocument('main', 'payments', doc.$id);
            } catch (err: any) {
                console.log(`❌ ${field} - INVALID (${err.message})`);
            }
        }
    }
}

testPayments()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Failed:', err);
        process.exit(1);
    });
