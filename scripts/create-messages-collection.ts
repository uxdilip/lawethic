/**
 * Create the messages collection for real-time chat
 */

import { Client, Databases, ID } from 'node-appwrite';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../apps/web/.env.local') });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main';
const COLLECTION_ID = 'messages';

async function createMessagesCollection() {
    console.log('🗨️  Creating messages collection for real-time chat...\n');

    try {
        // Create collection
        const collection = await databases.createCollection(
            DATABASE_ID,
            COLLECTION_ID,
            'Messages',
            [
                // Anyone can read (we'll filter by orderId in API)
                `read("any")`,
                // Anyone authenticated can create messages
                `create("users")`,
                // Only admins can update/delete
                `update("team:admin")`,
                `update("team:operations")`,
                `delete("team:admin")`,
                `delete("team:operations")`
            ]
        );

        console.log('✅ Collection created:', collection.$id);

        // Create attributes
        console.log('\n📝 Creating attributes...');

        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'orderId', 255, true);
        console.log('  ✅ orderId');

        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'senderId', 255, true);
        console.log('  ✅ senderId');

        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'senderName', 255, true);
        console.log('  ✅ senderName');

        await databases.createEnumAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'senderRole',
            ['customer', 'admin', 'operations', 'system'],
            true
        );
        console.log('  ✅ senderRole');

        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'message', 5000, true);
        console.log('  ✅ message');

        await databases.createEnumAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'messageType',
            ['text', 'system'],
            true,
            'text'
        );
        console.log('  ✅ messageType');

        await databases.createBooleanAttribute(DATABASE_ID, COLLECTION_ID, 'read', true, false);
        console.log('  ✅ read');

        await databases.createDatetimeAttribute(DATABASE_ID, COLLECTION_ID, 'readAt', false);
        console.log('  ✅ readAt');

        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'metadata', 5000, false);
        console.log('  ✅ metadata');

        // Wait for attributes to be ready
        console.log('\n⏳ Waiting for attributes to be available...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Create indexes
        console.log('\n📑 Creating indexes...');

        await databases.createIndex(
            DATABASE_ID,
            COLLECTION_ID,
            'orderId_idx',
            'key',
            ['orderId'],
            ['ASC']
        );
        console.log('  ✅ orderId_idx');

        await databases.createIndex(
            DATABASE_ID,
            COLLECTION_ID,
            'senderId_idx',
            'key',
            ['senderId'],
            ['ASC']
        );
        console.log('  ✅ senderId_idx');

        await databases.createIndex(
            DATABASE_ID,
            COLLECTION_ID,
            'createdAt_idx',
            'key',
            ['$createdAt'],
            ['DESC']
        );
        console.log('  ✅ createdAt_idx');

        console.log('\n✨ Messages collection created successfully!');
        console.log('\n📊 Collection Details:');
        console.log('  - ID:', COLLECTION_ID);
        console.log('  - Database:', DATABASE_ID);
        console.log('  - Attributes: 9');
        console.log('  - Indexes: 3');

    } catch (error: any) {
        if (error.code === 409) {
            console.log('⚠️  Collection already exists');
        } else {
            console.error('❌ Error:', error.message);
            throw error;
        }
    }
}

createMessagesCollection()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
