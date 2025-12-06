#!/usr/bin/env tsx

/**
 * Script to set user role in Appwrite
 * Usage: tsx scripts/set-user-role.ts <email> <role>
 * Example: tsx scripts/set-user-role.ts admin@lawethic.com admin
 */

import { Client, Users } from 'node-appwrite';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../apps/web/.env.local') });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

const users = new Users(client);

const validRoles = ['customer', 'operations', 'admin'];

async function setUserRole(email: string, role: string) {
    if (!validRoles.includes(role)) {
        console.error(`❌ Invalid role: ${role}`);
        console.log(`Valid roles are: ${validRoles.join(', ')}`);
        process.exit(1);
    }

    try {
        console.log(`🔍 Searching for user with email: ${email}`);

        // List all users (no parameters for Users.list in node-appwrite)
        let usersList;
        try {
            usersList = await users.list();
        } catch (listError: any) {
            console.error('List error:', listError.message);
            throw listError;
        }

        const user = usersList.users.find(u => u.email === email);

        if (!user) {
            console.error(`❌ User not found with email: ${email}`);
            console.log('\n💡 Make sure the user has registered first.');
            process.exit(1);
        }

        console.log(`✅ Found user: ${user.name} (${user.$id})`);
        console.log(`📝 Setting role to: ${role}`);

        // Update user preferences with role
        await users.updatePrefs(user.$id, {
            ...user.prefs,
            role: role,
        });

        console.log(`✅ Successfully updated user role to: ${role}`);
        console.log('\nUser Details:');
        console.log(`- ID: ${user.$id}`);
        console.log(`- Name: ${user.name}`);
        console.log(`- Email: ${user.email}`);
        console.log(`- Role: ${role}`);

    } catch (error: any) {
        console.error('❌ Error setting user role:', error.message);
        process.exit(1);
    }
}

// Main execution
const email = process.argv[2];
const role = process.argv[3];

if (!email || !role) {
    console.log('Usage: tsx scripts/set-user-role.ts <email> <role>');
    console.log('');
    console.log('Valid roles: customer, operations, admin');
    console.log('');
    console.log('Examples:');
    console.log('  tsx scripts/set-user-role.ts admin@lawethic.com admin');
    console.log('  tsx scripts/set-user-role.ts ops@lawethic.com operations');
    console.log('  tsx scripts/set-user-role.ts user@example.com customer');
    process.exit(1);
}

setUserRole(email, role);
