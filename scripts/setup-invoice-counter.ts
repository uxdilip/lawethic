import { Client, Databases, ID } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('692af80b00364ca8a6b2')
    .setKey('standard_89d27dfc6220b586dbd11b45cb73bda182047c5ddefe18bd07b57384ba08eda6fe256559ad23b1d79740f73335eebd44ed1e51198a835156de91266ba1f11285538a566dbe669b36035ddb285412c43ceff5aede62fb5ead53c98826d193600452305935b82bb08ad0972cf23de2017d28ef44fdcaec7776eacf5b232f2f68a7');

const databases = new Databases(client);
const databaseId = 'main';

async function setupInvoiceCounter() {
    try {
        console.log('🔄 Setting up invoice counter collection...\n');

        // Create invoice_counter collection
        try {
            const collection = await databases.createCollection(
                databaseId,
                'invoice_counter',
                'Invoice Counter',
                [
                    'read("any")',  // Anyone can read (needed for counter lookup)
                    'create("team:admin")', // Only admins can create
                    'update("team:admin")', // Only admins can update
                    'delete("team:admin")'  // Only admins can delete
                ]
            );
            console.log('✅ Created invoice_counter collection');
        } catch (error: any) {
            if (error.code === 409) {
                console.log('ℹ️  invoice_counter collection already exists');
            } else {
                throw error;
            }
        }

        // Create attributes
        const attributes = [
            { key: 'year', type: 'integer', required: true },
            { key: 'lastNumber', type: 'integer', required: true },
            { key: 'prefix', type: 'string', size: 10, required: true }
        ];

        console.log('\n📝 Creating attributes...');
        for (const attr of attributes) {
            try {
                if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(
                        databaseId,
                        'invoice_counter',
                        attr.key,
                        attr.required
                    );
                } else if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        databaseId,
                        'invoice_counter',
                        attr.key,
                        attr.size!,
                        attr.required
                    );
                }
                console.log(`   ✅ ${attr.key} (${attr.type})`);

                // Wait a bit between attribute creations
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error: any) {
                if (error.code === 409) {
                    console.log(`   ℹ️  ${attr.key} already exists`);
                } else {
                    console.error(`   ❌ Failed to create ${attr.key}:`, error.message);
                }
            }
        }

        // Wait for attributes to be available
        console.log('\n⏳ Waiting for attributes to be ready...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Create initial counter document for current year
        const currentYear = new Date().getFullYear();
        try {
            await databases.createDocument(
                databaseId,
                'invoice_counter',
                ID.unique(),
                {
                    year: currentYear,
                    lastNumber: 0,
                    prefix: 'INV'
                }
            );
            console.log(`✅ Created counter for year ${currentYear}`);
        } catch (error: any) {
            if (error.code === 409) {
                console.log(`ℹ️  Counter for ${currentYear} already exists`);
            } else {
                console.error('❌ Failed to create initial counter:', error.message);
            }
        }

        console.log('\n✨ Invoice counter setup complete!\n');

    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
}

setupInvoiceCounter();
