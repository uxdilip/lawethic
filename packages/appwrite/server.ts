import { Client, Databases, Storage } from 'node-appwrite';
import { appwriteConfig } from './config';

// Server-side Appwrite client (with API key)
// Use this in API routes only - requires node-appwrite
const apiKey = process.env.APPWRITE_API_KEY || '';

if (!apiKey) {
    console.warn('⚠️  APPWRITE_API_KEY is not set. Server-side operations may fail.');
}

export const serverClient = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.project)
    .setKey(apiKey);

export const serverDatabases = new Databases(serverClient);
export const serverStorage = new Storage(serverClient);
