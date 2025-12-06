import { Client, Databases, ID } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('692af80b00364ca8a6b2')
    .setKey('standard_89d27dfc6220b586dbd11b45cb73bda182047c5ddefe18bd07b57384ba08eda6fe256559ad23b1d79740f73335eebd44ed1e51198a835156de91266ba1f11285538a566dbe669b36035ddb285412c43ceff5aede62fb5ead53c98826d193600452305935b82bb08ad0972cf23de2017d28ef44fdcaec7776eacf5b232f2f68a7');

const databases = new Databases(client);
const databaseId = 'main';

async function testOrderCreation() {
    console.log('🧪 Testing order creation...\n');

    const testData = {
        orderNumber: 'TEST-123',
        customerId: 'test-customer',
        serviceId: 'test-service',
        status: 'new',
        paymentStatus: 'pending',
        amount: 1999,
        formData: '{}',
    };

    console.log('📝 Testing with full data:');
    console.log(JSON.stringify(testData, null, 2));

    try {
        const doc = await databases.createDocument(
            databaseId,
            'orders',
            ID.unique(),
            testData
        );
        console.log('✅ SUCCESS!');
        await databases.deleteDocument(databaseId, 'orders', doc.$id);
    } catch (error: any) {
        console.error('❌ FAILED:', error.message);

        // Test each field
        const fields = Object.keys(testData);
        for (const field of fields) {
            console.log(`\n🧪 Testing field: ${field}...`);
            try {
                const minData = {
                    orderNumber: 'TEST',
                    customerId: 'test',
                    serviceId: 'test',
                    amount: 100,
                    [field]: testData[field as keyof typeof testData]
                };
                const testDoc = await databases.createDocument(
                    databaseId,
                    'orders',
                    ID.unique(),
                    minData
                );
                console.log(`   ✅ ${field} is VALID`);
                await databases.deleteDocument(databaseId, 'orders', testDoc.$id);
            } catch (err: any) {
                console.log(`   ❌ ${field} is INVALID: ${err.message}`);
            }
        }
    }
}

testOrderCreation()
    .then(() => {
        console.log('\n✨ Test completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test failed:', error);
        process.exit(1);
    });
