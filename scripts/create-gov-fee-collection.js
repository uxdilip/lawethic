#!/usr/bin/env node

/**
 * Script to create government_fee_requests collection in Appwrite
 * Run: node scripts/create-gov-fee-collection.js
 */

const sdk = require('node-appwrite');

// Configuration - update these values from your Appwrite console
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '692af80b00364ca8a6b2';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || 'standard_89d27dfc6220b586dbd11b45cb73bda182047c5ddefe18bd07b57384ba08eda6fe256559ad23b1d79740f73335eebd44ed1e51198a835156de91266ba1f11285538a566dbe669b36035ddb285412c43ceff5aede62fb5ead53c98826d193600452305935b82bb08ad0972cf23de2017d28ef44fdcaec7776eacf5b232f2f68a7';

const DATABASE_ID = 'main';
const COLLECTION_ID = 'government_fee_requests';

// Initialize Appwrite client
const client = new sdk.Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createGovFeeCollection() {
    console.log('🚀 Creating government_fee_requests collection...\n');

    try {
        // Create collection
        await databases.createCollection(
            DATABASE_ID,
            COLLECTION_ID,
            'Government Fee Requests',
            [
                sdk.Permission.read(sdk.Role.any()),
                sdk.Permission.create(sdk.Role.users()),
                sdk.Permission.update(sdk.Role.users()),
                sdk.Permission.delete(sdk.Role.users()),
            ]
        );
        console.log('✅ Created collection: government_fee_requests');
    } catch (error) {
        if (error.code === 409) {
            console.log('⚠️  Collection already exists, adding attributes...');
        } else {
            console.error('❌ Error creating collection:', error.message);
            throw error;
        }
    }

    await sleep(2000);

    // Define attributes
    const attributes = [
        { key: 'orderId', type: 'string', size: 255, required: true },
        { key: 'customerId', type: 'string', size: 255, required: true },
        { key: 'serviceId', type: 'string', size: 255, required: false },
        { key: 'items', type: 'string', size: 10000, required: true }, // JSON array of fee items
        { key: 'totalAmount', type: 'integer', required: true },
        { key: 'note', type: 'string', size: 1000, required: false },
        { key: 'status', type: 'string', size: 50, required: true }, // pending, paid, cancelled
        { key: 'requestedBy', type: 'string', size: 255, required: false },
        { key: 'razorpayOrderId', type: 'string', size: 255, required: false },
        { key: 'paymentId', type: 'string', size: 255, required: false },
        { key: 'paidAt', type: 'datetime', required: false },
    ];

    for (const attr of attributes) {
        try {
            if (attr.type === 'string') {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    COLLECTION_ID,
                    attr.key,
                    attr.size,
                    attr.required,
                    attr.default || null
                );
            } else if (attr.type === 'integer') {
                await databases.createIntegerAttribute(
                    DATABASE_ID,
                    COLLECTION_ID,
                    attr.key,
                    attr.required,
                    undefined,
                    undefined,
                    attr.default
                );
            } else if (attr.type === 'datetime') {
                await databases.createDatetimeAttribute(
                    DATABASE_ID,
                    COLLECTION_ID,
                    attr.key,
                    attr.required
                );
            }
            console.log(`  ✅ Added attribute: ${attr.key}`);
            await sleep(1000);
        } catch (error) {
            if (error.code === 409) {
                console.log(`  ⚠️  Attribute ${attr.key} already exists`);
            } else {
                console.error(`  ❌ Error creating attribute ${attr.key}:`, error.message);
            }
        }
    }

    // Create indexes
    await sleep(2000);

    try {
        await databases.createIndex(
            DATABASE_ID,
            COLLECTION_ID,
            'order_index',
            'key',
            ['orderId'],
            ['ASC']
        );
        console.log('  ✅ Created orderId index');
    } catch (error) {
        if (error.code === 409) {
            console.log('  ⚠️  orderId index already exists');
        }
    }

    await sleep(1000);

    try {
        await databases.createIndex(
            DATABASE_ID,
            COLLECTION_ID,
            'customer_index',
            'key',
            ['customerId'],
            ['ASC']
        );
        console.log('  ✅ Created customerId index');
    } catch (error) {
        if (error.code === 409) {
            console.log('  ⚠️  customerId index already exists');
        }
    }

    await sleep(1000);

    try {
        await databases.createIndex(
            DATABASE_ID,
            COLLECTION_ID,
            'status_index',
            'key',
            ['status'],
            ['ASC']
        );
        console.log('  ✅ Created status index');
    } catch (error) {
        if (error.code === 409) {
            console.log('  ⚠️  status index already exists');
        }
    }

    console.log('\n✅ Government fee requests collection setup complete!');
}

createGovFeeCollection().catch(console.error);
