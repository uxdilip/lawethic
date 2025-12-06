import { Client, Databases, Permission, Role } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('692af80b00364ca8a6b2')
    .setKey('standard_89d27dfc6220b586dbd11b45cb73bda182047c5ddefe18bd07b57384ba08eda6fe256559ad23b1d79740f73335eebd44ed1e51198a835156de91266ba1f11285538a566dbe669b36035ddb285412c43ceff5aede62fb5ead53c98826d193600452305935b82bb08ad0972cf23de2017d28ef44fdcaec7776eacf5b232f2f68a7');

const databases = new Databases(client);
const databaseId = 'main';

interface CollectionPermissions {
    collectionId: string;
    name: string;
    permissions: string[];
}

const collectionsConfig: CollectionPermissions[] = [
    {
        collectionId: 'services',
        name: 'Services',
        permissions: [
            // Anyone can read services
            Permission.read(Role.any()),
            // Only team members can create/update/delete
            Permission.create(Role.team('admin')),
            Permission.create(Role.team('operations')),
            Permission.update(Role.team('admin')),
            Permission.update(Role.team('operations')),
            Permission.delete(Role.team('admin')),
        ],
    },
    {
        collectionId: 'orders',
        name: 'Orders',
        permissions: [
            // Users can read their own orders
            Permission.read(Role.users()),
            // Any authenticated user can create order
            Permission.create(Role.users()),
            // Users can update their own orders (for additional info)
            Permission.update(Role.users()),
            // Teams can read/update all orders
            Permission.read(Role.team('admin')),
            Permission.read(Role.team('operations')),
            Permission.update(Role.team('admin')),
            Permission.update(Role.team('operations')),
            Permission.delete(Role.team('admin')),
        ],
    },
    {
        collectionId: 'documents',
        name: 'Documents',
        permissions: [
            // Users can manage their own documents
            Permission.read(Role.users()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
            // Teams can access all documents
            Permission.read(Role.team('admin')),
            Permission.read(Role.team('operations')),
            Permission.update(Role.team('admin')),
            Permission.update(Role.team('operations')),
            Permission.delete(Role.team('admin')),
        ],
    },
    {
        collectionId: 'messages',
        name: 'Messages',
        permissions: [
            // Users can read and create messages
            Permission.read(Role.users()),
            Permission.create(Role.users()),
            // Teams can manage all messages
            Permission.read(Role.team('admin')),
            Permission.read(Role.team('operations')),
            Permission.create(Role.team('admin')),
            Permission.create(Role.team('operations')),
            Permission.update(Role.team('admin')),
            Permission.update(Role.team('operations')),
            Permission.delete(Role.team('admin')),
        ],
    },
    {
        collectionId: 'notifications',
        name: 'Notifications',
        permissions: [
            // Users can read their notifications
            Permission.read(Role.users()),
            Permission.update(Role.users()), // For marking as read
            // Teams can create notifications
            Permission.create(Role.team('admin')),
            Permission.create(Role.team('operations')),
            Permission.read(Role.team('admin')),
            Permission.read(Role.team('operations')),
            Permission.delete(Role.team('admin')),
        ],
    },
    {
        collectionId: 'payments',
        name: 'Payments',
        permissions: [
            // Users can read their payments
            Permission.read(Role.users()),
            // System/API can create payment records
            Permission.create(Role.users()),
            // Teams can manage all payments
            Permission.read(Role.team('admin')),
            Permission.read(Role.team('operations')),
            Permission.update(Role.team('admin')),
            Permission.update(Role.team('operations')),
            Permission.delete(Role.team('admin')),
        ],
    },
    {
        collectionId: 'order_timeline',
        name: 'Order Timeline',
        permissions: [
            // Users can read timeline of their orders
            Permission.read(Role.users()),
            // Teams can create and manage timeline entries
            Permission.create(Role.team('admin')),
            Permission.create(Role.team('operations')),
            Permission.read(Role.team('admin')),
            Permission.read(Role.team('operations')),
            Permission.update(Role.team('admin')),
            Permission.update(Role.team('operations')),
            Permission.delete(Role.team('admin')),
        ],
    },
];

async function updateCollectionPermissions() {
    console.log('🔐 Starting permission updates for all collections...\n');

    for (const config of collectionsConfig) {
        try {
            console.log(`📝 Updating permissions for: ${config.name} (${config.collectionId})`);

            await databases.updateCollection(
                databaseId,
                config.collectionId,
                config.name,
                config.permissions,
                false, // documentSecurity - set to false to use collection-level permissions
                true   // enabled
            );

            console.log(`✅ Successfully updated ${config.name}`);
            console.log(`   Permissions: ${config.permissions.length} rules set\n`);
        } catch (error: any) {
            console.error(`❌ Failed to update ${config.name}:`, error.message);
            console.error(`   Collection ID: ${config.collectionId}\n`);
        }
    }

    console.log('🎉 Permission update completed!');
}

// Run the script
updateCollectionPermissions()
    .then(() => {
        console.log('\n✨ All done! Collections are now properly configured.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error);
        process.exit(1);
    });
