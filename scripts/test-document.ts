import { Client, Databases, ID } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('692af80b00364ca8a6b2')
    .setKey('standard_89d27dfc6220b586dbd11b45cb73bda182047c5ddefe18bd07b57384ba08eda6fe256559ad23b1d79740f73335eebd44ed1e51198a835156de91266ba1f11285538a566dbe669b36035ddb285412c43ceff5aede62fb5ead53c98826d193600452305935b82bb08ad0972cf23de2017d28ef44fdcaec7776eacf5b232f2f68a7');

const databases = new Databases(client);
const databaseId = 'main';

async function testDocumentCreation() {
    console.log('🧪 Testing document creation in documents collection...\n');

    const testData = {
        orderId: 'test-order-123',
        fileId: 'test-file-456',
        fileName: 'test.pdf',
        fileType: 'application/pdf',
        uploadedBy: 'test-user-789',
    };

    console.log('📝 Attempting to create document with data:');
    console.log(JSON.stringify(testData, null, 2));
    console.log('');

    try {
        const doc = await databases.createDocument(
            databaseId,
            'documents',
            ID.unique(),
            testData
        );
        console.log('✅ SUCCESS! Document created:');
        console.log(`   Document ID: ${doc.$id}`);
        console.log('');

        // Clean up - delete the test document
        console.log('🧹 Cleaning up test document...');
        await databases.deleteDocument(databaseId, 'documents', doc.$id);
        console.log('✅ Test document deleted');

    } catch (error: any) {
        console.error('❌ FAILED to create document:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Code: ${error.code}`);
        console.error(`   Type: ${error.type}`);

        if (error.message?.includes('Unknown attribute')) {
            console.log('\n💡 DIAGNOSIS:');
            console.log('   The error indicates an attribute in the data doesn\'t exist in the collection.');
            console.log('   Let\'s check which attributes ARE allowed...\n');

            // Try with minimal data
            console.log('🧪 Testing with minimal data (orderId only)...');
            try {
                const minDoc = await databases.createDocument(
                    databaseId,
                    'documents',
                    ID.unique(),
                    { orderId: 'test-minimal' }
                );
                console.log('✅ Minimal document created! orderId is valid.');
                await databases.deleteDocument(databaseId, 'documents', minDoc.$id);

                // Now test each field one by one
                const fields = ['fileId', 'fileName', 'fileType', 'uploadedBy'];
                for (const field of fields) {
                    console.log(`\n🧪 Testing field: ${field}...`);
                    try {
                        const testDoc = await databases.createDocument(
                            databaseId,
                            'documents',
                            ID.unique(),
                            {
                                orderId: 'test',
                                [field]: `test-${field}-value`
                            }
                        );
                        console.log(`   ✅ ${field} is VALID`);
                        await databases.deleteDocument(databaseId, 'documents', testDoc.$id);
                    } catch (err: any) {
                        console.log(`   ❌ ${field} is INVALID: ${err.message}`);
                    }
                }
            } catch (minErr: any) {
                console.log(`❌ Even minimal data failed: ${minErr.message}`);
            }
        }
    }
}

testDocumentCreation()
    .then(() => {
        console.log('\n✨ Test completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test failed:', error);
        process.exit(1);
    });
