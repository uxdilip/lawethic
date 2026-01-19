/**
 * Script to set a user's role to 'expert'
 * 
 * Usage: 
 *   node scripts/make-expert-user.js <email>
 * 
 * Example:
 *   node scripts/make-expert-user.js lawyer@example.com
 * 
 * Make sure to set APPWRITE_API_KEY in your environment or .env file
 */

const sdk = require('node-appwrite');
require('dotenv').config({ path: './apps/web/.env.local' });

const client = new sdk.Client();
const users = new sdk.Users(client);

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_API_KEY);

async function makeExpertUser(email) {
    if (!email) {
        console.error('❌ Please provide an email address');
        console.log('Usage: node scripts/make-expert-user.js <email>');
        process.exit(1);
    }

    try {
        // Find user by email
        const usersList = await users.list([
            sdk.Query.equal('email', email)
        ]);

        if (usersList.users.length === 0) {
            console.error(`❌ No user found with email: ${email}`);
            console.log('\nTo create a new expert user:');
            console.log('1. Have them sign up at /expert/login');
            console.log('2. Then run this script to update their role');
            process.exit(1);
        }

        const user = usersList.users[0];
        console.log(`\n👤 Found user: ${user.name || user.email}`);
        console.log(`   ID: ${user.$id}`);
        console.log(`   Current role: ${user.prefs?.role || 'none'}`);

        // Update user prefs to set role as expert
        await users.updatePrefs(user.$id, {
            ...user.prefs,
            role: 'expert'
        });

        console.log(`\n✅ Successfully updated ${email} to 'expert' role`);
        console.log(`\n🔗 They can now login at: /expert/login`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

const email = process.argv[2];
makeExpertUser(email);
