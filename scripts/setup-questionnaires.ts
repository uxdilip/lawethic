/**
 * Setup Questionnaire Requests Collection in Appwrite
 * Run with: npx tsx scripts/setup-questionnaires.ts
 */

import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = 'main';
const COLLECTION_ID = 'questionnaire_requests';

async function setupQuestionnaireCollection() {
    console.log('🚀 Setting up questionnaire_requests collection...\n');

    try {
        // Check if collection exists
        try {
            await databases.getCollection(DATABASE_ID, COLLECTION_ID);
            console.log('⚠️  Collection already exists. Deleting and recreating...');
            await databases.deleteCollection(DATABASE_ID, COLLECTION_ID);
        } catch (e) {
            // Collection doesn't exist, that's fine
        }

        // Create collection
        await databases.createCollection(
            DATABASE_ID,
            COLLECTION_ID,
            'Questionnaire Requests',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
            ]
        );
        console.log('✅ Collection created');

        // Create attributes
        const attributes = [
            { key: 'orderId', type: 'string', size: 36, required: true },
            { key: 'templateId', type: 'string', size: 100, required: true },
            { key: 'templateVersion', type: 'integer', required: true, default: 1 },
            { key: 'status', type: 'string', size: 20, required: true }, // pending, submitted, reviewed
            { key: 'sentBy', type: 'string', size: 36, required: true },
            { key: 'sentByName', type: 'string', size: 255, required: true },
            { key: 'sentAt', type: 'datetime', required: true },
            { key: 'submittedAt', type: 'datetime', required: false },
            { key: 'responseData', type: 'string', size: 65535, required: false }, // JSON string
            { key: 'notes', type: 'string', size: 1000, required: false },
        ];

        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.key,
                        attr.size!,
                        attr.required,
                        attr.default as string | undefined
                    );
                } else if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.key,
                        attr.required,
                        undefined,
                        undefined,
                        attr.default as number | undefined
                    );
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.key,
                        attr.required
                    );
                }
                console.log(`  ✅ Created attribute: ${attr.key}`);
            } catch (e: any) {
                console.log(`  ⚠️  Attribute ${attr.key}: ${e.message}`);
            }
        }

        // Wait for attributes to be ready
        console.log('\n⏳ Waiting for attributes to be ready...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Create indexes
        try {
            await databases.createIndex(
                DATABASE_ID,
                COLLECTION_ID,
                'idx_orderId',
                'key',
                ['orderId']
            );
            console.log('✅ Created index: idx_orderId');
        } catch (e: any) {
            console.log(`⚠️  Index idx_orderId: ${e.message}`);
        }

        try {
            await databases.createIndex(
                DATABASE_ID,
                COLLECTION_ID,
                'idx_status',
                'key',
                ['status']
            );
            console.log('✅ Created index: idx_status');
        } catch (e: any) {
            console.log(`⚠️  Index idx_status: ${e.message}`);
        }

        console.log('\n✅ Questionnaire collection setup complete!');
        console.log('\n📝 Collection Schema:');
        console.log('   - orderId (string, required)');
        console.log('   - templateId (string, required)');
        console.log('   - templateVersion (integer, required)');
        console.log('   - status (string: pending/submitted/reviewed)');
        console.log('   - sentBy (string, required)');
        console.log('   - sentByName (string, required)');
        console.log('   - sentAt (datetime, required)');
        console.log('   - submittedAt (datetime, optional)');
        console.log('   - responseData (string/JSON, optional)');
        console.log('   - notes (string, optional)');

    } catch (error) {
        console.error('❌ Error setting up collection:', error);
        process.exit(1);
    }
}

setupQuestionnaireCollection();
