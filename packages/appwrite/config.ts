export const appwriteConfig = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '',
    project: process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '',
    apiKey: process.env.APPWRITE_API_KEY || '',
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main',
    collections: {
        users: process.env.NEXT_PUBLIC_COLLECTION_USERS || 'users',
        services: process.env.NEXT_PUBLIC_COLLECTION_SERVICES || 'services',
        orders: process.env.NEXT_PUBLIC_COLLECTION_ORDERS || 'orders',
        documents: process.env.NEXT_PUBLIC_COLLECTION_DOCUMENTS || 'documents',
        messages: process.env.NEXT_PUBLIC_COLLECTION_MESSAGES || 'messages',
        notifications: process.env.NEXT_PUBLIC_COLLECTION_NOTIFICATIONS || 'notifications',
        payments: process.env.NEXT_PUBLIC_COLLECTION_PAYMENTS || 'payments',
        orderTimeline: process.env.NEXT_PUBLIC_COLLECTION_ORDER_TIMELINE || 'order_timeline',
    },
    buckets: {
        customerDocuments: process.env.NEXT_PUBLIC_BUCKET_CUSTOMER_DOCUMENTS || 'customer-documents',
    },
    teams: {
        operations: process.env.NEXT_PUBLIC_TEAM_OPERATIONS || 'operations',
        admin: process.env.NEXT_PUBLIC_TEAM_ADMIN || 'admin',
    },
} as const;

export type AppwriteConfig = typeof appwriteConfig;
