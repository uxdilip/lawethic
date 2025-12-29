/**
 * Script to create the service_content collection in Appwrite
 * 
 * Run with: node scripts/setup-service-content-collection.js
 * 
 * Requires environment variables:
 * - NEXT_PUBLIC_APPWRITE_ENDPOINT
 * - NEXT_PUBLIC_APPWRITE_PROJECT
 * - APPWRITE_API_KEY
 * - NEXT_PUBLIC_APPWRITE_DATABASE_ID
 */

const { Client, Databases, Permission, Role } = require('node-appwrite');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../apps/web/.env.local') });

const COLLECTION_ID = 'service_content_drafts';

async function setupServiceContentCollection() {
    // Initialize Appwrite client
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main';

    console.log('🚀 Setting up service_content collection...');
    console.log(`   Database: ${databaseId}`);
    console.log(`   Collection: ${COLLECTION_ID}`);

    try {
        // Check if collection already exists by listing and filtering
        try {
            const collections = await databases.listCollections(databaseId);
            const exists = collections.collections.some(c => c.$id === COLLECTION_ID);
            if (exists) {
                console.log('⚠️  Collection already exists. Skipping creation.');
                console.log('   If you want to recreate it, delete it from the Appwrite console first.');
                return;
            }
        } catch (error) {
            console.log('   Could not check existing collections, proceeding with creation...');
        }

        // Create the collection
        console.log('\n📦 Creating collection...');
        await databases.createCollection(
            databaseId,
            COLLECTION_ID,
            'Service Content',
            [
                // Admins can read/write
                Permission.read(Role.team('admin')),
                Permission.create(Role.team('admin')),
                Permission.update(Role.team('admin')),
                Permission.delete(Role.team('admin')),
                // Operations team can read/write
                Permission.read(Role.team('operations')),
                Permission.create(Role.team('operations')),
                Permission.update(Role.team('operations')),
                // Public can read published content (we filter by status in API)
                Permission.read(Role.any()),
            ]
        );
        console.log('   ✓ Collection created');

        // Create attributes
        console.log('\n📝 Creating attributes...');

        // slug - service identifier
        await databases.createStringAttribute(
            databaseId,
            COLLECTION_ID,
            'slug',
            255,
            true // required
        );
        console.log('   ✓ slug (string, required)');

        // version - version number
        await databases.createIntegerAttribute(
            databaseId,
            COLLECTION_ID,
            'version',
            true, // required
            1,    // min
            9999  // max
        );
        console.log('   ✓ version (integer, required)');

        // status - draft or published
        await databases.createEnumAttribute(
            databaseId,
            COLLECTION_ID,
            'status',
            ['draft', 'published'],
            true // required
        );
        console.log('   ✓ status (enum: draft/published)');

        // content - JSON stringified ServiceContentData
        await databases.createStringAttribute(
            databaseId,
            COLLECTION_ID,
            'content',
            1000000, // 1MB for large JSON content
            true // required
        );
        console.log('   ✓ content (string, 1MB max)');

        // editedBy - user ID who made the edit
        await databases.createStringAttribute(
            databaseId,
            COLLECTION_ID,
            'editedBy',
            255,
            true // required
        );
        console.log('   ✓ editedBy (string, required)');

        // publishedAt - datetime when published
        await databases.createDatetimeAttribute(
            databaseId,
            COLLECTION_ID,
            'publishedAt',
            false // optional
        );
        console.log('   ✓ publishedAt (datetime, optional)');

        // changeNote - note about what changed
        await databases.createStringAttribute(
            databaseId,
            COLLECTION_ID,
            'changeNote',
            500,
            false // optional
        );
        console.log('   ✓ changeNote (string, optional)');

        // Wait for attributes to be ready
        console.log('\n⏳ Waiting for attributes to be ready...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Create indexes
        console.log('\n🔍 Creating indexes...');

        // Index for querying by slug
        await databases.createIndex(
            databaseId,
            COLLECTION_ID,
            'idx_slug',
            'key',
            ['slug']
        );
        console.log('   ✓ idx_slug');

        // Index for querying by slug and version (descending)
        await databases.createIndex(
            databaseId,
            COLLECTION_ID,
            'idx_slug_version',
            'key',
            ['slug', 'version'],
            ['ASC', 'DESC']
        );
        console.log('   ✓ idx_slug_version');

        // Index for querying by status
        await databases.createIndex(
            databaseId,
            COLLECTION_ID,
            'idx_status',
            'key',
            ['status']
        );
        console.log('   ✓ idx_status');

        // Composite index for published content lookup
        await databases.createIndex(
            databaseId,
            COLLECTION_ID,
            'idx_slug_status',
            'key',
            ['slug', 'status']
        );
        console.log('   ✓ idx_slug_status');

        console.log('\n✅ Service content collection setup complete!');
        console.log('\nYou can now use the service content editor at /admin/services');

    } catch (error) {
        console.error('\n❌ Error setting up collection:', error.message);
        if (error.response) {
            console.error('   Response:', error.response);
        }
        process.exit(1);
    }
}

setupServiceContentCollection();
