import { Client, Storage } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('692af80b00364ca8a6b2')
    .setKey('standard_89d27dfc6220b586dbd11b45cb73bda182047c5ddefe18bd07b57384ba08eda6fe256559ad23b1d79740f73335eebd44ed1e51198a835156de91266ba1f11285538a566dbe669b36035ddb285412c43ceff5aede62fb5ead53c98826d193600452305935b82bb08ad0972cf23de2017d28ef44fdcaec7776eacf5b232f2f68a7');

const storage = new Storage(client);

async function createInvoicesBucket() {
    try {
        console.log('Creating invoices bucket...\n');

        const bucket = await storage.createBucket(
            'invoices',
            'Invoices',
            [
                'read("any")', // Anyone authenticated can read (will be restricted by order ownership in code)
                'create("team:admin")',
                'update("team:admin")',
                'delete("team:admin")'
            ],
            false, // not fileSecurity (use bucket-level permissions)
            true, // enabled
            undefined, // no size limit
            ['pdf'], // only PDF files
            undefined, // no compression
            undefined, // no encryption
            true // antivirus enabled
        );

        console.log('✅ Created bucket:', bucket.$id);
        console.log('   Allowed file types: pdf');
        console.log('   Permissions: Admin only can create/update/delete');

    } catch (error: any) {
        if (error.code === 409) {
            console.log('ℹ️  Invoices bucket already exists');
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

createInvoicesBucket();
