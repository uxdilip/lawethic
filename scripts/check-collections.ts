import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('692af80b00364ca8a6b2')
    .setKey('standard_89d27dfc6220b586dbd11b45cb73bda182047c5ddefe18bd07b57384ba08eda6fe256559ad23b1d79740f73335eebd44ed1e51198a835156de91266ba1f11285538a566dbe669b36035ddb285412c43ceff5aede62fb5ead53c98826d193600452305935b82bb08ad0972cf23de2017d28ef44fdcaec7776eacf5b232f2f68a7');

const databases = new Databases(client);
const databaseId = 'main';

async function listCollectionAttributes() {
    console.log('🔍 Checking collection attributes...\n');

    const collections = [
        'services',
        'orders',
        'documents',
        'messages',
        'notifications',
        'payments',
        'order_timeline'
    ];

    for (const collectionId of collections) {
        try {
            const collection = await databases.getCollection(databaseId, collectionId);
            console.log(`📋 Collection: ${collectionId}`);
            console.log(`   Attributes (${collection.attributes.length}):`);
            if (collection.attributes.length === 0) {
                console.log('   (No attributes found)');
            } else {
                collection.attributes.forEach((attr: any) => {
                    console.log(`   - ${attr.key} (${attr.type}${attr.required ? ', required' : ''})`);
                });
            }
            console.log('');
        } catch (error: any) {
            console.error(`❌ Failed to get ${collectionId}:`, error.message);
            // Try listing documents to verify collection exists
            try {
                await databases.listDocuments(databaseId, collectionId, []);
                console.log(`   ℹ️  Collection exists but can't fetch attributes\n`);
            } catch (e) {
                console.log(`   ℹ️  Collection might not exist\n`);
            }
        }
    }
}

listCollectionAttributes()
    .then(() => {
        console.log('✨ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Failed:', error);
        process.exit(1);
    });
