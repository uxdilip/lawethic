import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('692af80b00364ca8a6b2')
    .setKey('standard_89d27dfc6220b586dbd11b45cb73bda182047c5ddefe18bd07b57384ba08eda6fe256559ad23b1d79740f73335eebd44ed1e51198a835156de91266ba1f11285538a566dbe669b36035ddb285412c43ceff5aede62fb5ead53c98826d193600452305935b82bb08ad0972cf23de2017d28ef44fdcaec7776eacf5b232f2f68a7');

const databases = new Databases(client);
const databaseId = 'main';
const collectionId = 'order_timeline';

async function fixTimelineSchema() {
    console.log('🔧 Fixing order_timeline collection schema...\n');

    // Add missing attributes needed by the invoice generator and admin dashboard
    const attributesToAdd = [
        { key: 'action', type: 'string', size: 100, required: true },
        { key: 'details', type: 'string', size: 2000, required: false },
        { key: 'performedBy', type: 'string', size: 255, required: true },
    ];

    for (const attr of attributesToAdd) {
        try {
            console.log(`📝 Adding ${attr.key} attribute...`);
            await databases.createStringAttribute(
                databaseId,
                collectionId,
                attr.key,
                attr.size,
                attr.required
            );
            console.log(`✅ Added ${attr.key} attribute\n`);

            // Wait for attribute to be created
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error: any) {
            if (error.message?.includes('already exists') || error.code === 409) {
                console.log(`⏭️  ${attr.key} attribute already exists\n`);
            } else {
                console.error(`❌ Failed to add ${attr.key}:`, error.message, '\n');
            }
        }
    }

    // Update existing attributes to make them optional if needed
    console.log('\n📝 Note: Existing attributes (status, note, updatedBy) are kept as-is');
    console.log('   You may want to make them optional for flexibility:\n');
    console.log('   - status: Can be optional (invoice_generated doesn\'t need status)');
    console.log('   - note: Can be optional (details field is more generic)');
    console.log('   - updatedBy: Can be renamed to performedBy or kept as alias\n');

    console.log('✅ Timeline schema update complete!\n');
    console.log('📋 Current schema should have:');
    console.log('   - orderId (string, required)');
    console.log('   - action (string, required) - NEW');
    console.log('   - details (string, optional) - NEW');
    console.log('   - performedBy (string, required) - NEW');
    console.log('   - status (string, required) - EXISTING');
    console.log('   - note (string, required) - EXISTING');
    console.log('   - updatedBy (string, required) - EXISTING\n');
}

fixTimelineSchema()
    .then(() => {
        console.log('✨ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error:', error);
        process.exit(1);
    });
