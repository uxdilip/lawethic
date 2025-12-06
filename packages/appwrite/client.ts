import { Client, Account, Databases, Storage, Functions, Teams } from 'appwrite';
import { appwriteConfig } from './config';

// Client-side Appwrite client (browser)
export const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.project);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const teams = new Teams(client);

// Helper to check if user is authenticated
export const getSession = async () => {
    try {
        return await account.get();
    } catch (error) {
        return null;
    }
};

// Helper to get current user with metadata
export const getCurrentUser = async () => {
    try {
        const user = await account.get();
        // Fetch additional user metadata from users collection if needed
        return user;
    } catch (error) {
        return null;
    }
};
