import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('692af80b00364ca8a6b2')
    .setKey('standard_89d27dfc6220b586dbd11b45cb73bda182047c5ddefe18bd07b57384ba08eda6fe256559ad23b1d79740f73335eebd44ed1e51198a835156de91266ba1f11285538a566dbe669b36035ddb285412c43ceff5aede62fb5ead53c98826d193600452305935b82bb08ad0972cf23de2017d28ef44fdcaec7776eacf5b232f2f68a7');

const databases = new Databases(client);
const databaseId = 'main';

async function addMissingAttributes() {
    console.log('🔧 Adding missing attributes to collections...\n');

    try {
        // Add status attribute to documents collection
        console.log('📝 Adding status attribute to documents collection...');
        await databases.createStringAttribute(
            databaseId,
            'documents',
            'status',
            50,
            false // not required, optional
        );
        console.log('✅ Added status attribute to documents\n');
    } catch (error: any) {
        if (error.message?.includes('already exists')) {
            console.log('⏭️  Status attribute already exists in documents\n');
        } else {
            console.error('❌ Failed to add status to documents:', error.message, '\n');
        }
    }

    try {
        // Add status attribute to orders collection
        console.log('📝 Adding status attribute to orders collection...');
        await databases.createStringAttribute(
            databaseId,
            'orders',
            'status',
            50,
            false
        );
        console.log('✅ Added status attribute to orders\n');
    } catch (error: any) {
        if (error.message?.includes('already exists')) {
            console.log('⏭️  Status attribute already exists in orders\n');
        } else {
            console.error('❌ Failed to add status to orders:', error.message, '\n');
        }
    }

    try {
        // Add amount attribute to orders collection
        console.log('📝 Adding amount attribute to orders collection...');
        await databases.createFloatAttribute(
            databaseId,
            'orders',
            'amount',
            false
        );
        console.log('✅ Added amount attribute to orders\n');
    } catch (error: any) {
        if (error.message?.includes('already exists')) {
            console.log('⏭️  Amount attribute already exists in orders\n');
        } else {
            console.error('❌ Failed to add amount to orders:', error.message, '\n');
        }
    }

    try {
        // Add formData attribute to orders collection
        console.log('📝 Adding formData attribute to orders collection...');
        await databases.createStringAttribute(
            databaseId,
            'orders',
            'formData',
            10000, // Large size for JSON data
            false
        );
        console.log('✅ Added formData attribute to orders\n');
    } catch (error: any) {
        if (error.message?.includes('already exists')) {
            console.log('⏭️  FormData attribute already exists in orders\n');
        } else {
            console.error('❌ Failed to add formData to orders:', error.message, '\n');
        }
    }

    try {
        // Add paymentStatus attribute to orders collection
        console.log('📝 Adding paymentStatus attribute to orders collection...');
        await databases.createStringAttribute(
            databaseId,
            'orders',
            'paymentStatus',
            50,
            false
        );
        console.log('✅ Added paymentStatus attribute to orders\n');
    } catch (error: any) {
        if (error.message?.includes('already exists')) {
            console.log('⏭️  PaymentStatus attribute already exists in orders\n');
        } else {
            console.error('❌ Failed to add paymentStatus to orders:', error.message, '\n');
        }
    }

    // === PAYMENTS COLLECTION ===
    try {
        console.log('📝 Adding amount attribute to payments collection...');
        await databases.createFloatAttribute(
            databaseId,
            'payments',
            'amount',
            false
        );
        console.log('✅ Added amount attribute to payments\n');
    } catch (error: any) {
        if (error.message?.includes('already exists')) {
            console.log('⏭️  Amount attribute already exists in payments\n');
        } else {
            console.error('❌ Failed to add amount to payments:', error.message, '\n');
        }
    }

    try {
        console.log('📝 Adding status attribute to payments collection...');
        await databases.createStringAttribute(
            databaseId,
            'payments',
            'status',
            50,
            false
        );
        console.log('✅ Added status attribute to payments\n');
    } catch (error: any) {
        if (error.message?.includes('already exists')) {
            console.log('⏭️  Status attribute already exists in payments\n');
        } else {
            console.error('❌ Failed to add status to payments:', error.message, '\n');
        }
    }

    try {
        console.log('📝 Adding method attribute to payments collection...');
        await databases.createStringAttribute(
            databaseId,
            'payments',
            'method',
            50,
            false
        );
        console.log('✅ Added method attribute to payments\n');
    } catch (error: any) {
        if (error.message?.includes('already exists')) {
            console.log('⏭️  Method attribute already exists in payments\n');
        } else {
            console.error('❌ Failed to add method to payments:', error.message, '\n');
        }
    }

    console.log('🎉 Attribute updates completed!');
}

addMissingAttributes()
    .then(() => {
        console.log('\n✨ All done! Collections are now properly configured.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error);
        process.exit(1);
    });
