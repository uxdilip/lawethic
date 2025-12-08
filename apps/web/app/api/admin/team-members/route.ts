import { NextRequest, NextResponse } from 'next/server';
import { Client, Users } from 'node-appwrite';

export async function GET(request: NextRequest) {
    try {
        // Initialize admin client
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
            .setKey(process.env.APPWRITE_API_KEY!);

        const users = new Users(client);

        // Fetch all users (we'll filter by role in the response)
        const allUsers = await users.list();

        // Filter users with admin or operations role
        const teamMembers = allUsers.users
            .filter(user => {
                const role = user.prefs?.role;
                return role === 'admin' || role === 'operations';
            })
            .map(user => ({
                $id: user.$id,
                name: user.name,
                email: user.email,
                role: user.prefs?.role || 'customer'
            }))
            .sort((a, b) => {
                // Sort: admins first, then by name
                if (a.role === 'admin' && b.role !== 'admin') return -1;
                if (a.role !== 'admin' && b.role === 'admin') return 1;
                return a.name.localeCompare(b.name);
            });

        return NextResponse.json({
            success: true,
            teamMembers
        });

    } catch (error: any) {
        console.error('[Team Members API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch team members' },
            { status: 500 }
        );
    }
}
