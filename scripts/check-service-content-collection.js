/**
 * Script to check the service_content collection attributes
 * 
 * Run with: node scripts/check-service-content-collection.js
 */

const { Client, Databases } = require('node-appwrite');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/web/.env.local') });

const COLLECTION_ID = 'service_content_drafts';

async function checkCollection() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main';

    console.log('🔍 Checking service_content collection...\n');

    try {
        // List attributes
        const attrs = await databases.listAttributes(databaseId, COLLECTION_ID);

        console.log('📝 Attributes:');
        for (const attr of attrs.attributes) {
            console.log(`   - ${attr.key} (${attr.type}${attr.required ? ', required' : ''})${attr.status !== 'available' ? ` [${attr.status}]` : ''}`);
        }

        // List indexes
        const indexes = await databases.listIndexes(databaseId, COLLECTION_ID);

        console.log('\n🔍 Indexes:');
        for (const idx of indexes.indexes) {
            console.log(`   - ${idx.key}: [${idx.attributes.join(', ')}] (${idx.type})${idx.status !== 'available' ? ` [${idx.status}]` : ''}`);
        }

        console.log('\n✅ Collection exists and is configured!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkCollection();
