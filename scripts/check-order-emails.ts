import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../apps/web/.env.local') });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main';
const ORDERS_COLLECTION_ID = process.env.NEXT_PUBLIC_COLLECTION_ORDERS || 'orders';

async function checkOrderEmails() {
    console.log('🔍 Checking Order Email Addresses\n');

    try {
        // Fetch all orders
        const orders = await databases.listDocuments(
            DATABASE_ID,
            ORDERS_COLLECTION_ID
        );

        console.log(`📊 Found ${orders.documents.length} orders\n`);

        let hasEmail = 0;
        let noEmail = 0;

        for (const order of orders.documents) {
            let formData = order.formData;
            if (typeof formData === 'string') {
                try {
                    formData = JSON.parse(formData);
                } catch (e) {
                    formData = {};
                }
            }

            const email = formData?.email || order.customerEmail;
            const name = formData?.fullName || formData?.businessName || 'N/A';

            if (email) {
                hasEmail++;
                console.log(`✅ ${order.orderNumber || order.$id}`);
                console.log(`   Customer: ${name}`);
                console.log(`   Email: ${email}`);
            } else {
                noEmail++;
                console.log(`❌ ${order.orderNumber || order.$id}`);
                console.log(`   Customer: ${name}`);
                console.log(`   Email: MISSING`);
                console.log(`   FormData keys: ${Object.keys(formData || {}).join(', ')}`);
            }
            console.log('');
        }

        console.log('\n📈 Summary:');
        console.log(`✅ Orders with email: ${hasEmail}`);
        console.log(`❌ Orders without email: ${noEmail}`);

        if (noEmail > 0) {
            console.log('\n⚠️  WARNING: Some orders are missing email addresses!');
            console.log('   Email notifications cannot be sent for these orders.');
            console.log('   Check your order creation process to ensure emails are being saved.');
        }

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

checkOrderEmails()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
