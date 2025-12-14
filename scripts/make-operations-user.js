require('dotenv').config({ path: './apps/web/.env.local' });
const { Client, Users } = require('node-appwrite');

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);

// INSTRUCTIONS: 
// 1. Edit the email below to the user you want to make an operations team member
// 2. Run: node scripts/make-operations-user.js

const USER_EMAIL = 'user@example.com'; // ⬅️ CHANGE THIS EMAIL
const NEW_ROLE = 'operations'; // Can be: 'admin', 'operations', or 'customer'

async function changeUserRole() {
    try {
        console.log('\n🔍 Searching for user...\n');

        const allUsers = await users.list();
        const user = allUsers.users.find(u => u.email === USER_EMAIL);

        if (!user) {
            console.log(`❌ User not found: ${USER_EMAIL}`);
            console.log('\nAvailable users:');
            allUsers.users.forEach(u => {
                console.log(`   - ${u.email} (${u.name})`);
            });
            return;
        }

        const currentRole = user.prefs?.role || 'customer';
        console.log(`Found: ${user.name} (${user.email})`);
        console.log(`Current role: ${currentRole}`);
        console.log(`New role: ${NEW_ROLE}\n`);

        await users.updatePrefs(user.$id, { role: NEW_ROLE });

        console.log('✅ Role updated successfully!\n');

        if (NEW_ROLE === 'operations') {
            console.log('📋 Operations User Access:');
            console.log('   - Login at: /admin/login');
            console.log('   - Will see ONLY assigned cases');
            console.log('   - Cannot see unassigned or other team member cases\n');
        } else if (NEW_ROLE === 'admin') {
            console.log('👑 Admin Access:');
            console.log('   - Login at: /admin/login');
            console.log('   - Can see ALL cases');
            console.log('   - Can assign cases to team members\n');
        }

    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

changeUserRole();
