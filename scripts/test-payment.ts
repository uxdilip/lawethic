import { Client, Databases, ID } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('692af80b00364ca8a6b2')
    .setKey('standard_89d27dfc6220b586dbd11b45cb73bda182047c5ddefe18bd07b57384ba08eda6fe256559ad23b1d79740f73335eebd44ed1e51198a835156de91266ba1f11285538a566dbe669b36035ddb285412c43ceff5aede62fb5ead53c98826d193600452305935b82bb08ad0972cf23de2017d28ef44fdcaec7776eacf5b232f2f68a7');

const databases = new Databases(client);
const databaseId = 'main';

async function testPayment() {
    console.log('🧪 Testing payment record creation...\n');

    const testData = {
        orderId: 'test-order-123',
        razorpayOrderId: 'order_test123',
        razorpayPaymentId: 'pay_test456',
        amount: 1999,
        status: 'success',
        method: 'razorpay',
    };

    console.log('📝 Testing payment data:');
    console.log(JSON.stringify(testData, null, 2));

    try {
        const doc = await databases.createDocument(
            databaseId,
            'payments',
            ID.unique(),
            testData
        );
        console.log('✅ SUCCESS! Payment created');
        await databases.deleteDocument(databaseId, 'payments', doc.$id);
    } catch (error: any) {
        console.error('❌ FAILED:', error.message);

        // Test minimal data
        console.log('\n🧪 Testing minimal payment data...');
        try {
            const minDoc = await databases.createDocument(
                databaseId,
                'payments',
                ID.unique(),
                { orderId: 'test', amount: 100 }
            );
            console.log('✅ Minimal payment created');
            await databases.deleteDocument(databaseId, 'payments', minDoc.$id);
        } catch (minErr: any) {
            console.error('❌ Even minimal failed:', minErr.message);
        }
    }
}

testPayment()
    .then(() => {
        console.log('\n✨ Test completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test failed:', error);
        process.exit(1);
    });
