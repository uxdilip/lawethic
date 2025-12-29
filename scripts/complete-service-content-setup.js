/**
 * Script to add missing attributes to the service_content_drafts collection
 * 
 * Run with: node scripts/complete-service-content-setup.js
 */

const { Client, Databases } = require('node-appwrite');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/web/.env.local') });

const COLLECTION_ID = 'service_content_drafts';

async function completeSetup() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main';

    console.log('🔧 Completing service_content_drafts setup...\n');

    // Get existing attributes
    const attrs = await databases.listAttributes(databaseId, COLLECTION_ID);
    const existingKeys = attrs.attributes.map(a => a.key);
    console.log('Existing attributes:', existingKeys.join(', '));

    try {
        // version - version number
        if (!existingKeys.includes('version')) {
            await databases.createIntegerAttribute(
                databaseId,
                COLLECTION_ID,
                'version',
                true, // required
                1,    // min
                9999  // max
            );
            console.log('   ✓ version (integer, required)');
        }

        // status - draft or published
        if (!existingKeys.includes('status')) {
            await databases.createEnumAttribute(
                databaseId,
                COLLECTION_ID,
                'status',
                ['draft', 'published'],
                true // required
            );
            console.log('   ✓ status (enum: draft/published)');
        }

        // content - JSON stringified ServiceContentData
        if (!existingKeys.includes('content')) {
            await databases.createStringAttribute(
                databaseId,
                COLLECTION_ID,
                'content',
                1000000, // 1MB for large JSON content
                true // required
            );
            console.log('   ✓ content (string, 1MB max)');
        }

        // editedBy - user ID who made the edit
        if (!existingKeys.includes('editedBy')) {
            await databases.createStringAttribute(
                databaseId,
                COLLECTION_ID,
                'editedBy',
                255,
                true // required
            );
            console.log('   ✓ editedBy (string, required)');
        }

        // publishedAt - datetime when published
        if (!existingKeys.includes('publishedAt')) {
            await databases.createDatetimeAttribute(
                databaseId,
                COLLECTION_ID,
                'publishedAt',
                false // optional
            );
            console.log('   ✓ publishedAt (datetime, optional)');
        }

        // changeNote - note about what changed
        if (!existingKeys.includes('changeNote')) {
            await databases.createStringAttribute(
                databaseId,
                COLLECTION_ID,
                'changeNote',
                500,
                false // optional
            );
            console.log('   ✓ changeNote (string, optional)');
        }

        // Wait for attributes to be ready
        console.log('\n⏳ Waiting for attributes to be ready...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Check indexes
        const indexes = await databases.listIndexes(databaseId, COLLECTION_ID);
        const existingIndexes = indexes.indexes.map(i => i.key);
        console.log('Existing indexes:', existingIndexes.join(', ') || 'none');

        // Create indexes
        if (!existingIndexes.includes('idx_slug')) {
            await databases.createIndex(
                databaseId,
                COLLECTION_ID,
                'idx_slug',
                'key',
                ['slug']
            );
            console.log('   ✓ idx_slug');
        }

        if (!existingIndexes.includes('idx_slug_version')) {
            await databases.createIndex(
                databaseId,
                COLLECTION_ID,
                'idx_slug_version',
                'key',
                ['slug', 'version'],
                ['ASC', 'DESC']
            );
            console.log('   ✓ idx_slug_version');
        }

        if (!existingIndexes.includes('idx_status')) {
            await databases.createIndex(
                databaseId,
                COLLECTION_ID,
                'idx_status',
                'key',
                ['status']
            );
            console.log('   ✓ idx_status');
        }

        if (!existingIndexes.includes('idx_slug_status')) {
            await databases.createIndex(
                databaseId,
                COLLECTION_ID,
                'idx_slug_status',
                'key',
                ['slug', 'status']
            );
            console.log('   ✓ idx_slug_status');
        }

        console.log('\n✅ Setup complete!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('   Response:', JSON.stringify(error.response, null, 2));
        }
    }
}

completeSetup();
