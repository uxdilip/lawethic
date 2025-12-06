#!/usr/bin/env tsx

/**
 * Script to set user role by user ID
 * Usage: tsx scripts/set-role-by-id.ts <userId> <role>
 * Example: tsx scripts/set-role-by-id.ts 674d7e7b0037ca23fd19 admin
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

async function setUserRole(userId: string, role: string) {
    if (!validRoles.includes(role)) {
        console.error(`❌ Invalid role: ${role}`);
        console.log(`Valid roles are: ${validRoles.join(', ')}`);
        process.exit(1);
    }

    try {
        console.log(`📝 Setting role for user ID: ${userId}`);

        // Update user preferences with role
        const result = await users.updatePrefs(userId, { role });

        console.log(`✅ Successfully updated user role to: ${role}`);
        console.log('\nPreferences updated:', result);

    } catch (error: any) {
        console.error('❌ Error setting user role:', error.message);
        console.log('\n💡 Make sure the user ID is correct.');
        console.log('Find user ID in Appwrite Console → Auth → Users');
        process.exit(1);
    }
}

// Main execution
const userId = process.argv[2];
const role = process.argv[3];

if (!userId || !role) {
    console.log('Usage: tsx scripts/set-role-by-id.ts <userId> <role>');
    console.log('');
    console.log('Valid roles: customer, operations, admin');
    console.log('');
    console.log('Examples:');
    console.log('  tsx scripts/set-role-by-id.ts 674d7e7b0037ca23fd19 admin');
    console.log('  tsx scripts/set-role-by-id.ts 674d7e7b0037ca23fd20 operations');
    console.log('');
    console.log('Find user ID: Appwrite Console → Auth → Users → Select User → Copy ID');
    process.exit(1);
}

setUserRole(userId, role);
