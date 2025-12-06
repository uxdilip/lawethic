import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('692af80b00364ca8a6b2')
    .setKey('standard_89d27dfc6220b586dbd11b45cb73bda182047c5ddefe18bd07b57384ba08eda6fe256559ad23b1d79740f73335eebd44ed1e51198a835156de91266ba1f11285538a566dbe669b36035ddb285412c43ceff5aede62fb5ead53c98826d193600452305935b82bb08ad0972cf23de2017d28ef44fdcaec7776eacf5b232f2f68a7');

const databases = new Databases(client);

async function addInvoiceFields() {
    try {
        console.log('Adding invoice fields to orders collection...\n');

        // Add invoiceFileId
        try {
            await databases.createStringAttribute(
                'main',
                'orders',
                'invoiceFileId',
                255,
                false
            );
            console.log('✅ Added invoiceFileId');
        } catch (e: any) {
            if (e.code === 409) {
                console.log('ℹ️  invoiceFileId already exists');
            } else {
                console.error('❌ Error adding invoiceFileId:', e.message);
            }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Add invoiceNumber
        try {
            await databases.createStringAttribute(
                'main',
                'orders',
                'invoiceNumber',
                50,
                false
            );
            console.log('✅ Added invoiceNumber');
        } catch (e: any) {
            if (e.code === 409) {
                console.log('ℹ️  invoiceNumber already exists');
            } else {
                console.error('❌ Error adding invoiceNumber:', e.message);
            }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Add invoiceGeneratedAt
        try {
            await databases.createDatetimeAttribute(
                'main',
                'orders',
                'invoiceGeneratedAt',
                false
            );
            console.log('✅ Added invoiceGeneratedAt');
        } catch (e: any) {
            if (e.code === 409) {
                console.log('ℹ️  invoiceGeneratedAt already exists');
            } else {
                console.error('❌ Error adding invoiceGeneratedAt:', e.message);
            }
        }

        console.log('\n✨ Done! Wait 30 seconds for attributes to be ready.');

    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

addInvoiceFields();
