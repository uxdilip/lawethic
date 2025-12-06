import { account, teams } from './client';
import { UserRole } from './types';
import { appwriteConfig } from './config';

/**
 * Get current user's role from their preferences
 */
export async function getUserRole(): Promise<UserRole> {
    try {
        const user = await account.get();
        const role = user.prefs.role as UserRole;
        return role || 'customer'; // Default to customer if no role set
    } catch (error) {
        console.error('Failed to get user role:', error);
        return 'customer';
    }
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
    const userRole = await getUserRole();
    return userRole === role;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
    return hasRole('admin');
}

/**
 * Check if user is operations team member
 */
export async function isOperations(): Promise<boolean> {
    const userRole = await getUserRole();
    return userRole === 'operations' || userRole === 'admin';
}

/**
 * Check if user has admin or operations role
 */
export async function isStaff(): Promise<boolean> {
    const userRole = await getUserRole();
    return userRole === 'admin' || userRole === 'operations';
}

/**
 * Get user's team memberships
 */
export async function getUserTeams() {
    try {
        const teamsList = await teams.list();
        return teamsList.teams;
    } catch (error) {
        console.error('Failed to get user teams:', error);
        return [];
    }
}

/**
 * Check if user is member of a specific team
 */
export async function isTeamMember(teamId: string): Promise<boolean> {
    try {
        const userTeams = await getUserTeams();
        return userTeams.some(team => team.$id === teamId);
    } catch (error) {
        console.error('Failed to check team membership:', error);
        return false;
    }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
    try {
        return await account.get();
    } catch (error) {
        return null;
    }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser();
    return user !== null;
}
