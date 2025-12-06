import { Client, Databases, Permission, Role } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('692af80b00364ca8a6b2')
    .setKey('standard_89d27dfc6220b586dbd11b45cb73bda182047c5ddefe18bd07b57384ba08eda6fe256559ad23b1d79740f73335eebd44ed1e51198a835156de91266ba1f11285538a566dbe669b36035ddb285412c43ceff5aede62fb5ead53c98826d193600452305935b82bb08ad0972cf23de2017d28ef44fdcaec7776eacf5b232f2f68a7');

const databases = new Databases(client);
const databaseId = 'main';

// Enable document security for collections that need user-specific permissions
const collectionsWithDocSecurity = [
    { id: 'orders', name: 'Orders' },
    { id: 'documents', name: 'Documents' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'payments', name: 'Payments' },
];

async function enableDocumentSecurity() {
    console.log('🔐 Enabling document-level security for user-specific collections...\n');

    for (const collection of collectionsWithDocSecurity) {
        try {
            console.log(`📝 Updating: ${collection.name}`);

            // Enable document security
            await databases.updateCollection(
                databaseId,
                collection.id,
                collection.name,
                [
                    // Collection-level permissions for reading (teams and users)
                    Permission.read(Role.users()),
                    Permission.read(Role.team('admin')),
                    Permission.read(Role.team('operations')),
                    Permission.create(Role.users()),
                    Permission.create(Role.team('admin')),
                    Permission.create(Role.team('operations')),
                ],
                true, // documentSecurity - enable document-level permissions
                true  // enabled
            );

            console.log(`✅ Enabled document security for ${collection.name}\n`);
        } catch (error: any) {
            console.error(`❌ Failed to update ${collection.name}:`, error.message, '\n');
        }
    }

    console.log('🎉 Document security configuration completed!');
}

enableDocumentSecurity()
    .then(() => {
        console.log('\n✨ All done! Collections now support document-level permissions.');
        console.log('💡 Remember to set document permissions when creating documents:');
        console.log('   Permission.read(Role.user(userId))');
        console.log('   Permission.update(Role.user(userId))');
        console.log('   Permission.delete(Role.user(userId))');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error);
        process.exit(1);
    });
