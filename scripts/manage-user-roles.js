require('dotenv').config({ path: './apps/web/.env.local' });
const { Client, Users } = require('node-appwrite');
const readline = require('readline');

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function listUsers() {
    try {
        console.log('\n📋 All Users:\n');
        const allUsers = await users.list();

        allUsers.users.forEach((user, index) => {
            const role = user.prefs?.role || 'customer';
            const roleEmoji = role === 'admin' ? '👑' : role === 'operations' ? '👤' : '👥';
            console.log(`${index + 1}. ${roleEmoji} ${user.name} (${user.email})`);
            console.log(`   ID: ${user.$id}`);
            console.log(`   Role: ${role}`);
            console.log(`   Status: ${user.status ? 'Active' : 'Inactive'}`);
            console.log('');
        });

        return allUsers.users;
    } catch (e) {
        console.error('Error:', e.message);
        return [];
    }
}

async function setUserRole(userId, role) {
    try {
        await users.updatePrefs(userId, { role });
        console.log(`✅ User role updated to: ${role}\n`);
    } catch (e) {
        console.error('❌ Error updating role:', e.message);
    }
}

async function createUser() {
    try {
        console.log('\n🆕 Create New User\n');

        const email = await question('Email: ');
        const password = await question('Password: ');
        const name = await question('Name: ');
        const role = await question('Role (admin/operations/customer): ');

        const newUser = await users.create(
            'unique()',
            email,
            undefined, // phone
            password,
            name
        );

        // Set role
        await users.updatePrefs(newUser.$id, { role });

        console.log(`\n✅ User created successfully!`);
        console.log(`   ID: ${newUser.$id}`);
        console.log(`   Email: ${email}`);
        console.log(`   Role: ${role}\n`);

    } catch (e) {
        console.error('❌ Error creating user:', e.message);
    }
}

async function main() {
    console.log('═══════════════════════════════════════');
    console.log('       User Role Management System      ');
    console.log('═══════════════════════════════════════\n');

    while (true) {
        console.log('What would you like to do?');
        console.log('1. List all users');
        console.log('2. Change user role');
        console.log('3. Create new user');
        console.log('4. Exit\n');

        const choice = await question('Enter choice (1-4): ');

        if (choice === '1') {
            await listUsers();
        } else if (choice === '2') {
            const allUsers = await listUsers();
            if (allUsers.length === 0) continue;

            const userIndex = await question('Enter user number: ');
            const selectedUser = allUsers[parseInt(userIndex) - 1];

            if (!selectedUser) {
                console.log('❌ Invalid user number\n');
                continue;
            }

            console.log('\nRoles:');
            console.log('1. admin - Full access, can see all cases');
            console.log('2. operations - Can only see assigned cases');
            console.log('3. customer - Regular customer access\n');

            const roleChoice = await question('Enter role (admin/operations/customer): ');

            if (['admin', 'operations', 'customer'].includes(roleChoice)) {
                await setUserRole(selectedUser.$id, roleChoice);
            } else {
                console.log('❌ Invalid role\n');
            }
        } else if (choice === '3') {
            await createUser();
        } else if (choice === '4') {
            console.log('\n👋 Goodbye!\n');
            break;
        } else {
            console.log('❌ Invalid choice\n');
        }
    }

    rl.close();
}

main();
