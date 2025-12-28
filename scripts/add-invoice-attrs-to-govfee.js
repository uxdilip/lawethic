#!/usr/bin/env node

/**
 * Script to add invoice attributes to government_fee_requests collection
 */

const sdk = require('node-appwrite');

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '692af80b00364ca8a6b2';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || 'standard_89d27dfc6220b586dbd11b45cb73bda182047c5ddefe18bd07b57384ba08eda6fe256559ad23b1d79740f73335eebd44ed1e51198a835156de91266ba1f11285538a566dbe669b36035ddb285412c43ceff5aede62fb5ead53c98826d193600452305935b82bb08ad0972cf23de2017d28ef44fdcaec7776eacf5b232f2f68a7';

const DATABASE_ID = 'main';
const COLLECTION_ID = 'government_fee_requests';

const client = new sdk.Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function addInvoiceAttributes() {
    console.log('🚀 Adding invoice attributes to government_fee_requests...\n');

    const newAttributes = [
        { key: 'invoiceFileId', type: 'string', size: 255, required: false },
        { key: 'invoiceNumber', type: 'string', size: 50, required: false },
    ];

    for (const attr of newAttributes) {
        try {
            await databases.createStringAttribute(
                DATABASE_ID,
                COLLECTION_ID,
                attr.key,
                attr.size,
                attr.required
            );
            console.log(`✅ Added attribute: ${attr.key}`);
            await sleep(1500);
        } catch (error) {
            if (error.code === 409) {
                console.log(`⚠️  Attribute ${attr.key} already exists`);
            } else {
                console.error(`❌ Error adding ${attr.key}:`, error.message);
            }
        }
    }

    console.log('\n✅ Done!');
}

addInvoiceAttributes().catch(console.error);
