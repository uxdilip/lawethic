#!/usr/bin/env node

/**
 * Appwrite Database Setup Script
 * 
 * This script automatically creates:
 * - Database
 * - All collections with attributes and indexes
 * - Storage bucket
 * - Teams
 * 
 * Run: node scripts/setup-appwrite.js
 */

const sdk = require('node-appwrite');

// Configuration
const APPWRITE_ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '692af80b00364ca8a6b2';
const APPWRITE_API_KEY = 'standard_89d27dfc6220b586dbd11b45cb73bda182047c5ddefe18bd07b57384ba08eda6fe256559ad23b1d79740f73335eebd44ed1e51198a835156de91266ba1f11285538a566dbe669b36035ddb285412c43ceff5aede62fb5ead53c98826d193600452305935b82bb08ad0972cf23de2017d28ef44fdcaec7776eacf5b232f2f68a7';

const DATABASE_ID = 'main';

// Initialize Appwrite client
const client = new sdk.Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const storage = new sdk.Storage(client);
const teams = new sdk.Teams(client);// Helper to handle existing resources
async function safeCreate(createFn, name) {
    try {
        const result = await createFn();
        console.log(`✅ Created ${name}`);
        return result;
    } catch (error) {
        if (error.code === 409) {
            console.log(`⚠️  ${name} already exists, skipping...`);
            return null;
        }
        console.error(`❌ Error creating ${name}:`, error.message);
        throw error;
    }
}

// Create database
async function createDatabase() {
    console.log('\n📦 Creating database...');
    return safeCreate(
        () => databases.create(DATABASE_ID, 'Main Database'),
        'Database "main"'
    );
}

// Create collections
async function createCollections() {
    console.log('\n📚 Creating collections...');

    // Collection: services
    await safeCreate(
        () => databases.createCollection(DATABASE_ID, 'services', 'Services'),
        'Collection: services'
    );

    // Add attributes for services
    const serviceAttrs = [
        { key: 'name', type: 'string', size: 255, required: true },
        { key: 'slug', type: 'string', size: 255, required: true },
        { key: 'shortDescription', type: 'string', size: 500, required: true },
        { key: 'description', type: 'string', size: 5000, required: true },
        { key: 'price', type: 'integer', required: true, default: 0 },
        { key: 'documentRequired', type: 'string', size: 255, required: false, array: true },
        { key: 'estimatedDays', type: 'string', size: 100, required: true },
        { key: 'isActive', type: 'boolean', required: true, default: true },
        { key: 'category', type: 'string', size: 100, required: true },
        { key: 'features', type: 'string', size: 500, required: false, array: true },
        { key: 'questionForm', type: 'string', size: 10000, required: false }, // JSON string for service-specific questions
    ];

    for (const attr of serviceAttrs) {
        try {
            if (attr.type === 'string') {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    'services',
                    attr.key,
                    attr.size,
                    attr.required,
                    attr.default,
                    attr.array || false
                );
            } else if (attr.type === 'integer') {
                await databases.createIntegerAttribute(
                    DATABASE_ID,
                    'services',
                    attr.key,
                    attr.required,
                    undefined,
                    undefined,
                    attr.default
                );
            } else if (attr.type === 'boolean') {
                await databases.createBooleanAttribute(
                    DATABASE_ID,
                    'services',
                    attr.key,
                    attr.required,
                    attr.default
                );
            }
            console.log(`  ✅ Added attribute: services.${attr.key}`);
            await sleep(1000); // Wait between attribute creation
        } catch (error) {
            if (error.code === 409) {
                console.log(`  ⚠️  Attribute services.${attr.key} already exists`);
            } else {
                console.error(`  ❌ Error creating attribute services.${attr.key}:`, error.message);
            }
        }
    }

    // Create indexes for services
    await createIndex(DATABASE_ID, 'services', 'slug_index', 'key', ['slug'], ['ASC']);
    await createIndex(DATABASE_ID, 'services', 'active_index', 'key', ['isActive'], ['ASC']);
    await createIndex(DATABASE_ID, 'services', 'category_index', 'key', ['category'], ['ASC']);

    // Collection: orders
    await safeCreate(
        () => databases.createCollection(DATABASE_ID, 'orders', 'Orders'),
        'Collection: orders'
    );

    const orderAttrs = [
        { key: 'orderNumber', type: 'string', size: 50, required: true },
        { key: 'customerId', type: 'string', size: 255, required: true },
        { key: 'serviceId', type: 'string', size: 255, required: true },
        { key: 'status', type: 'string', size: 50, required: true, default: 'new' },
        { key: 'paymentStatus', type: 'string', size: 50, required: true, default: 'pending' },
        { key: 'paymentId', type: 'string', size: 255, required: false },
        { key: 'amount', type: 'integer', required: true, default: 0 },
        { key: 'formData', type: 'string', size: 10000, required: true, default: '{}' },
        { key: 'assignedTo', type: 'string', size: 255, required: false },
        { key: 'completedAt', type: 'datetime', required: false },
    ];

    for (const attr of orderAttrs) {
        try {
            if (attr.type === 'string') {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    'orders',
                    attr.key,
                    attr.size,
                    attr.required,
                    attr.default
                );
            } else if (attr.type === 'integer') {
                await databases.createIntegerAttribute(
                    DATABASE_ID,
                    'orders',
                    attr.key,
                    attr.required,
                    undefined,
                    undefined,
                    attr.default
                );
            } else if (attr.type === 'datetime') {
                await databases.createDatetimeAttribute(
                    DATABASE_ID,
                    'orders',
                    attr.key,
                    attr.required,
                    attr.default
                );
            }
            console.log(`  ✅ Added attribute: orders.${attr.key}`);
            await sleep(1000);
        } catch (error) {
            if (error.code === 409) {
                console.log(`  ⚠️  Attribute orders.${attr.key} already exists`);
            } else {
                console.error(`  ❌ Error creating attribute orders.${attr.key}:`, error.message);
            }
        }
    }

    await createIndex(DATABASE_ID, 'orders', 'order_number_index', 'unique', ['orderNumber'], ['ASC']);
    await createIndex(DATABASE_ID, 'orders', 'customer_index', 'key', ['customerId'], ['ASC']);
    await createIndex(DATABASE_ID, 'orders', 'status_index', 'key', ['status'], ['ASC']);

    // Collection: documents
    await safeCreate(
        () => databases.createCollection(DATABASE_ID, 'documents', 'Documents'),
        'Collection: documents'
    );

    const documentAttrs = [
        { key: 'orderId', type: 'string', size: 255, required: true },
        { key: 'fileId', type: 'string', size: 255, required: true },
        { key: 'fileName', type: 'string', size: 500, required: true },
        { key: 'fileType', type: 'string', size: 100, required: true },
        { key: 'uploadedBy', type: 'string', size: 255, required: true },
        { key: 'status', type: 'string', size: 50, required: true, default: 'pending' },
        { key: 'rejectionReason', type: 'string', size: 1000, required: false },
    ];

    for (const attr of documentAttrs) {
        try {
            await databases.createStringAttribute(
                DATABASE_ID,
                'documents',
                attr.key,
                attr.size,
                attr.required,
                attr.default
            );
            console.log(`  ✅ Added attribute: documents.${attr.key}`);
            await sleep(1000);
        } catch (error) {
            if (error.code === 409) {
                console.log(`  ⚠️  Attribute documents.${attr.key} already exists`);
            }
        }
    }

    await createIndex(DATABASE_ID, 'documents', 'order_index', 'key', ['orderId'], ['ASC']);
    await createIndex(DATABASE_ID, 'documents', 'file_index', 'key', ['fileId'], ['ASC']);

    // Collection: messages
    await safeCreate(
        () => databases.createCollection(DATABASE_ID, 'messages', 'Messages'),
        'Collection: messages'
    );

    const messageAttrs = [
        { key: 'orderId', type: 'string', size: 255, required: true },
        { key: 'senderId', type: 'string', size: 255, required: true },
        { key: 'senderName', type: 'string', size: 255, required: true },
        { key: 'senderRole', type: 'string', size: 50, required: true },
        { key: 'message', type: 'string', size: 5000, required: false },
        { key: 'messageType', type: 'string', size: 50, required: true, default: 'text' },
        { key: 'read', type: 'boolean', required: true, default: false },
        { key: 'readAt', type: 'datetime', required: false },
        { key: 'metadata', type: 'string', size: 5000, required: false },
    ];

    for (const attr of messageAttrs) {
        try {
            if (attr.type === 'string') {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    'messages',
                    attr.key,
                    attr.size,
                    attr.required,
                    attr.default,
                    attr.array || false
                );
            } else if (attr.type === 'boolean') {
                await databases.createBooleanAttribute(
                    DATABASE_ID,
                    'messages',
                    attr.key,
                    attr.required,
                    attr.default
                );
            } else if (attr.type === 'datetime') {
                await databases.createDatetimeAttribute(
                    DATABASE_ID,
                    'messages',
                    attr.key,
                    attr.required,
                    attr.default
                );
            }
            console.log(`  ✅ Added attribute: messages.${attr.key}`);
            await sleep(1000);
        } catch (error) {
            if (error.code === 409) {
                console.log(`  ⚠️  Attribute messages.${attr.key} already exists`);
            }
        }
    }

    await createIndex(DATABASE_ID, 'messages', 'order_msg_index', 'key', ['orderId'], ['ASC']);

    // Collection: notifications
    await safeCreate(
        () => databases.createCollection(DATABASE_ID, 'notifications', 'Notifications'),
        'Collection: notifications'
    );

    const notificationAttrs = [
        { key: 'userId', type: 'string', size: 255, required: true },
        { key: 'orderId', type: 'string', size: 255, required: false },
        { key: 'type', type: 'string', size: 100, required: true },
        { key: 'message', type: 'string', size: 1000, required: true },
        { key: 'isRead', type: 'boolean', required: true, default: false },
    ];

    for (const attr of notificationAttrs) {
        try {
            if (attr.type === 'string') {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    'notifications',
                    attr.key,
                    attr.size,
                    attr.required,
                    attr.default
                );
            } else if (attr.type === 'boolean') {
                await databases.createBooleanAttribute(
                    DATABASE_ID,
                    'notifications',
                    attr.key,
                    attr.required,
                    attr.default
                );
            }
            console.log(`  ✅ Added attribute: notifications.${attr.key}`);
            await sleep(1000);
        } catch (error) {
            if (error.code === 409) {
                console.log(`  ⚠️  Attribute notifications.${attr.key} already exists`);
            }
        }
    }

    await createIndex(DATABASE_ID, 'notifications', 'user_notif_index', 'key', ['userId'], ['ASC']);

    // Collection: payments
    await safeCreate(
        () => databases.createCollection(DATABASE_ID, 'payments', 'Payments'),
        'Collection: payments'
    );

    const paymentAttrs = [
        { key: 'orderId', type: 'string', size: 255, required: true },
        { key: 'razorpayOrderId', type: 'string', size: 255, required: false },
        { key: 'razorpayPaymentId', type: 'string', size: 255, required: false },
        { key: 'razorpaySignature', type: 'string', size: 500, required: false },
        { key: 'amount', type: 'integer', required: true, default: 0 },
        { key: 'status', type: 'string', size: 50, required: true, default: 'created' },
        { key: 'method', type: 'string', size: 100, required: false },
    ];

    for (const attr of paymentAttrs) {
        try {
            if (attr.type === 'string') {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    'payments',
                    attr.key,
                    attr.size,
                    attr.required,
                    attr.default
                );
            } else if (attr.type === 'integer') {
                await databases.createIntegerAttribute(
                    DATABASE_ID,
                    'payments',
                    attr.key,
                    attr.required,
                    undefined,
                    undefined,
                    attr.default
                );
            }
            console.log(`  ✅ Added attribute: payments.${attr.key}`);
            await sleep(1000);
        } catch (error) {
            if (error.code === 409) {
                console.log(`  ⚠️  Attribute payments.${attr.key} already exists`);
            }
        }
    }

    await createIndex(DATABASE_ID, 'payments', 'payment_order_index', 'key', ['orderId'], ['ASC']);

    // Collection: order_timeline
    await safeCreate(
        () => databases.createCollection(DATABASE_ID, 'order_timeline', 'Order Timeline'),
        'Collection: order_timeline'
    );

    const timelineAttrs = [
        { key: 'orderId', type: 'string', size: 255, required: true },
        { key: 'status', type: 'string', size: 50, required: true },
        { key: 'note', type: 'string', size: 2000, required: true },
        { key: 'updatedBy', type: 'string', size: 255, required: true },
    ];

    for (const attr of timelineAttrs) {
        try {
            await databases.createStringAttribute(
                DATABASE_ID,
                'order_timeline',
                attr.key,
                attr.size,
                attr.required
            );
            console.log(`  ✅ Added attribute: order_timeline.${attr.key}`);
            await sleep(1000);
        } catch (error) {
            if (error.code === 409) {
                console.log(`  ⚠️  Attribute order_timeline.${attr.key} already exists`);
            }
        }
    }

    await createIndex(DATABASE_ID, 'order_timeline', 'timeline_order_index', 'key', ['orderId'], ['ASC']);

    // Collection: leads
    await safeCreate(
        () => databases.createCollection(DATABASE_ID, 'leads', 'Leads'),
        'Collection: leads'
    );

    const leadAttrs = [
        { key: 'name', type: 'string', size: 255, required: true },
        { key: 'email', type: 'string', size: 255, required: true },
        { key: 'phone', type: 'string', size: 20, required: true },
        { key: 'city', type: 'string', size: 100, required: true },
        { key: 'service', type: 'string', size: 255, required: true },
        { key: 'category', type: 'string', size: 100, required: true },
        { key: 'package', type: 'string', size: 100, required: false },
        { key: 'status', type: 'string', size: 50, required: true, default: 'new' },
    ];

    for (const attr of leadAttrs) {
        try {
            await databases.createStringAttribute(
                DATABASE_ID,
                'leads',
                attr.key,
                attr.size,
                attr.required,
                attr.default
            );
            console.log(`  ✅ Added attribute: leads.${attr.key}`);
            await sleep(1000);
        } catch (error) {
            if (error.code === 409) {
                console.log(`  ⚠️  Attribute leads.${attr.key} already exists`);
            }
        }
    }

    await createIndex(DATABASE_ID, 'leads', 'email_index', 'key', ['email'], ['ASC']);
    await createIndex(DATABASE_ID, 'leads', 'status_index', 'key', ['status'], ['ASC']);
    await createIndex(DATABASE_ID, 'leads', 'service_index', 'key', ['service'], ['ASC']);
}

async function createIndex(databaseId, collectionId, key, type, attributes, orders) {
    try {
        await databases.createIndex(databaseId, collectionId, key, type, attributes, orders);
        console.log(`  ✅ Created index: ${collectionId}.${key}`);
        await sleep(1000);
    } catch (error) {
        if (error.code === 409) {
            console.log(`  ⚠️  Index ${collectionId}.${key} already exists`);
        } else {
            console.error(`  ❌ Error creating index ${collectionId}.${key}:`, error.message);
        }
    }
}

// Create storage bucket
async function createStorageBucket() {
    console.log('\n💾 Creating storage buckets...');

    // Customer Documents Bucket
    try {
        await storage.createBucket(
            'customer-documents',
            'Customer Documents',
            [
                sdk.Permission.read(sdk.Role.any()),
                sdk.Permission.create(sdk.Role.users()),
                sdk.Permission.update(sdk.Role.team('operations')),
                sdk.Permission.update(sdk.Role.team('admin')),
                sdk.Permission.delete(sdk.Role.team('operations')),
                sdk.Permission.delete(sdk.Role.team('admin')),
            ],
            false, // fileSecurity
            true,  // enabled
            10485760, // maxFileSize (10MB)
            ['pdf', 'jpg', 'jpeg', 'png'], // allowedFileExtensions
            'none', // compression
            true,  // encryption
            true   // antivirus
        );
        console.log('✅ Created storage bucket: customer-documents');
    } catch (error) {
        if (error.code === 409) {
            console.log('⚠️  Storage bucket customer-documents already exists');
        } else {
            console.error('❌ Error creating storage bucket customer-documents:', error.message);
        }
    }

    // Message Attachments Bucket
    try {
        await storage.createBucket(
            'message-attachments',
            'Message Attachments',
            [
                sdk.Permission.read(sdk.Role.users()),
                sdk.Permission.create(sdk.Role.users()),
                sdk.Permission.update(sdk.Role.team('operations')),
                sdk.Permission.update(sdk.Role.team('admin')),
                sdk.Permission.delete(sdk.Role.team('operations')),
                sdk.Permission.delete(sdk.Role.team('admin')),
            ],
            false, // fileSecurity
            true,  // enabled
            10485760, // maxFileSize (10MB)
            ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'], // allowedFileExtensions
            'none', // compression
            true,  // encryption
            true   // antivirus
        );
        console.log('✅ Created storage bucket: message-attachments');
    } catch (error) {
        if (error.code === 409) {
            console.log('⚠️  Storage bucket message-attachments already exists');
        } else {
            console.error('❌ Error creating storage bucket message-attachments:', error.message);
        }
    }
}

// Create teams
async function createTeams() {
    console.log('\n👥 Creating teams...');

    await safeCreate(
        () => teams.create(sdk.ID.unique(), 'Operations Team', ['operations']),
        'Team: Operations'
    );

    await safeCreate(
        () => teams.create(sdk.ID.unique(), 'Admin Team', ['admin']),
        'Team: Admin'
    );
}

// Seed sample services
async function seedServices() {
    console.log('\n🌱 Seeding sample services...');

    const services = [
        {
            name: 'GST Registration',
            slug: 'gst-registration',
            shortDescription: 'Get your business registered for GST in 7-10 days',
            description: 'Complete GST registration service with expert assistance. We handle all paperwork and ensure your application is filed correctly. Includes ARN generation, document verification, and post-registration support.',
            price: 999,
            documentRequired: ['PAN Card', 'Address Proof', 'Bank Statement', 'Business Registration Proof'],
            estimatedDays: '7-10 days',
            isActive: true,
            category: 'Tax',
            features: [
                'ARN within 24 hours',
                'Document verification support',
                'Filing assistance',
                'GST certificate download',
                'Post-registration support'
            ],
            questionForm: JSON.stringify([
                {
                    id: 'propertyType',
                    label: 'What Is the Type of Property Where Your Office Is Located?',
                    type: 'radio',
                    options: ['Self/Own Property', 'Rented Property', 'Commercial Space', 'Home-based'],
                    required: true
                },
                {
                    id: 'gstReason',
                    label: 'Why are You Applying for GST Registration?',
                    type: 'radio',
                    options: [
                        'To Start a New Business',
                        'Selling on Amazon, Flipkart, Etc.',
                        'Freelancing',
                        'Already Running a Business, Need Compliance',
                        'Just Exploring, Not Sure Yet!'
                    ],
                    required: true
                },
                {
                    id: 'businessType',
                    label: 'Type of Business Structure',
                    type: 'select',
                    options: ['Sole Proprietorship', 'Partnership', 'LLP', 'Private Limited', 'Other'],
                    required: true
                },
                {
                    id: 'expectedTurnover',
                    label: 'Expected Annual Turnover',
                    type: 'select',
                    options: ['Below 20 Lakhs', '20-40 Lakhs', '40 Lakhs - 1 Cr', 'Above 1 Crore'],
                    required: false
                }
            ])
        },
        {
            name: 'Trademark Registration',
            slug: 'trademark-registration',
            shortDescription: 'Protect your brand with trademark registration',
            description: 'Complete trademark filing service including comprehensive search, class selection, and application filing. We ensure your trademark is properly protected and guide you through the entire process.',
            price: 4999,
            documentRequired: ['Logo/Wordmark', 'Business PAN', 'ID Proof', 'Address Proof'],
            estimatedDays: '2-3 days for filing',
            isActive: true,
            category: 'Legal',
            features: [
                'Comprehensive trademark search',
                'Class selection support',
                'Application filing with IPO',
                'Vienna code classification',
                'Objection handling support'
            ],
            questionForm: JSON.stringify([
                {
                    id: 'trademarkType',
                    label: 'What type of trademark do you want to register?',
                    type: 'radio',
                    options: ['Brand Name/Wordmark', 'Logo', 'Both Name and Logo', 'Slogan'],
                    required: true
                },
                {
                    id: 'businessCategory',
                    label: 'Select Your Business Category',
                    type: 'select',
                    options: ['Goods (Products)', 'Services', 'Both Goods and Services'],
                    required: true
                },
                {
                    id: 'alreadyUsing',
                    label: 'Are you already using this trademark in business?',
                    type: 'radio',
                    options: ['Yes, already in use', 'No, planning to use'],
                    required: true
                },
                {
                    id: 'trademarkClasses',
                    label: 'Do you know which class(es) to file under?',
                    type: 'radio',
                    options: ['Yes, I know the class', 'No, need help selecting'],
                    required: false,
                    helpText: 'We can help you select the appropriate class(es) for your trademark'
                }
            ])
        },
        {
            name: 'Private Limited Company Registration',
            slug: 'company-registration',
            shortDescription: 'Register your Private Limited Company with MCA',
            description: 'Complete company incorporation service including DSC, DIN allotment, name approval, and certificate of incorporation. We handle everything from drafting MOA/AOA to final registration.',
            price: 7999,
            documentRequired: ['Director PAN', 'Director Aadhaar', 'Address Proof', 'Utility Bill', 'Passport Size Photo'],
            estimatedDays: '10-15 days',
            isActive: true,
            category: 'Legal',
            features: [
                'DSC for 2 directors',
                'DIN allotment',
                'Name approval (2 options)',
                'Incorporation certificate',
                'PAN and TAN',
                'MOA and AOA drafting'
            ],
            questionForm: JSON.stringify([
                {
                    id: 'numberOfDirectors',
                    label: 'Number of Directors',
                    type: 'select',
                    options: ['2 Directors', '3 Directors', '4 or more Directors'],
                    required: true
                },
                {
                    id: 'authorizedCapital',
                    label: 'Proposed Authorized Capital',
                    type: 'select',
                    options: ['1 Lakh', '5 Lakhs', '10 Lakhs', 'More than 10 Lakhs'],
                    required: true
                },
                {
                    id: 'companyActivity',
                    label: 'What will be your main business activity?',
                    type: 'textarea',
                    required: true,
                    placeholder: 'Describe your business activity briefly',
                    helpText: 'This helps us draft the MOA/AOA correctly'
                },
                {
                    id: 'hasOffice',
                    label: 'Do you have a registered office address?',
                    type: 'radio',
                    options: ['Yes, I have office space', 'No, need assistance'],
                    required: true
                }
            ])
        },
        {
            name: 'FSSAI License',
            slug: 'fssai-license',
            shortDescription: 'Get FSSAI license for your food business',
            description: 'FSSAI registration and licensing for food businesses. We help you obtain the right type of license (Basic/State/Central) based on your business requirements.',
            price: 1999,
            documentRequired: ['PAN Card', 'Business Proof', 'ID Proof', 'Food Safety Plan', 'Layout Plan'],
            estimatedDays: '15-20 days',
            isActive: true,
            category: 'Licensing',
            features: [
                'License type consultation',
                'Application preparation',
                'Document verification',
                'FSSAI certificate',
                'Renewal support'
            ]
        },
        {
            name: 'GST Return Filing',
            slug: 'gst-return-filing',
            shortDescription: 'Monthly GST return filing service',
            description: 'Professional GST return filing service (GSTR-1, GSTR-3B) with reconciliation, error checking, and timely filing to avoid penalties.',
            price: 499,
            documentRequired: ['GST Login Credentials', 'Purchase Invoices', 'Sales Invoices', 'Bank Statement'],
            estimatedDays: '2-3 days',
            isActive: true,
            category: 'Tax',
            features: [
                'GSTR-1 filing',
                'GSTR-3B filing',
                'Invoice reconciliation',
                'Error checking',
                'Timely filing'
            ]
        }
    ];

    for (const service of services) {
        try {
            await databases.createDocument(
                DATABASE_ID,
                'services',
                sdk.ID.unique(),
                service
            );
            console.log(`✅ Created service: ${service.name}`);
        } catch (error) {
            if (error.code === 409) {
                console.log(`⚠️  Service ${service.name} already exists`);
            } else {
                console.error(`❌ Error creating service ${service.name}:`, error.message);
            }
        }
    }
}

// Update services collection with new fields for rich content
async function updateServicesCollection() {
    console.log('\n📝 Updating services collection with content fields...');

    const newAttributes = [
        { key: 'category', type: 'string', size: 100, required: false },
        { key: 'shortDescription', type: 'string', size: 500, required: false },
        { key: 'heroBadge', type: 'string', size: 200, required: false },
        { key: 'heroTitle', type: 'string', size: 300, required: false },
        { key: 'heroHighlights', type: 'string', size: 500, required: false, array: true },
        { key: 'contentBlocks', type: 'string', size: 100000, required: false },
        { key: 'metaTitle', type: 'string', size: 200, required: false },
        { key: 'metaDescription', type: 'string', size: 500, required: false },
        { key: 'keywords', type: 'string', size: 200, required: false, array: true },
    ];

    for (const attr of newAttributes) {
        try {
            if (attr.array) {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    'services',
                    attr.key,
                    attr.size,
                    attr.required,
                    undefined,
                    attr.array
                );
            } else {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    'services',
                    attr.key,
                    attr.size,
                    attr.required
                );
            }
            console.log(`✅ Added attribute: ${attr.key}`);
            await sleep(1000); // Wait between attribute creations
        } catch (error) {
            if (error.code === 409) {
                console.log(`⚠️  Attribute ${attr.key} already exists`);
            } else {
                console.error(`❌ Error adding ${attr.key}:`, error.message);
            }
        }
    }
}

// Create categories collection
async function createCategoriesCollection() {
    console.log('\n📂 Creating categories collection...');

    try {
        await databases.createCollection(
            DATABASE_ID,
            'categories',
            'Categories',
            [
                sdk.Permission.read(sdk.Role.any()),
                sdk.Permission.write(sdk.Role.team('admin')),
                sdk.Permission.write(sdk.Role.team('operations'))
            ]
        );
        console.log('✅ Created categories collection');

        await sleep(2000);

        const attributes = [
            { key: 'slug', type: 'string', size: 100, required: true },
            { key: 'title', type: 'string', size: 200, required: true },
            { key: 'description', type: 'string', size: 1000, required: false },
            { key: 'icon', type: 'string', size: 200, required: false },
            { key: 'order', type: 'integer', required: true },
            { key: 'hubContent', type: 'string', size: 50000, required: false },
            { key: 'metaTitle', type: 'string', size: 200, required: false },
            { key: 'metaDescription', type: 'string', size: 500, required: false },
        ];

        for (const attr of attributes) {
            try {
                if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(
                        DATABASE_ID,
                        'categories',
                        attr.key,
                        attr.required,
                        0,
                        1000
                    );
                } else {
                    await databases.createStringAttribute(
                        DATABASE_ID,
                        'categories',
                        attr.key,
                        attr.size,
                        attr.required
                    );
                }
                console.log(`✅ Added attribute: ${attr.key}`);
                await sleep(1000);
            } catch (error) {
                if (error.code === 409) {
                    console.log(`⚠️  Attribute ${attr.key} already exists`);
                } else {
                    console.error(`❌ Error adding ${attr.key}:`, error.message);
                }
            }
        }

        // Create index on slug
        await sleep(2000);
        try {
            await databases.createIndex(
                DATABASE_ID,
                'categories',
                'slug_index',
                'key',
                ['slug'],
                ['ASC']
            );
            console.log('✅ Created slug index');
        } catch (error) {
            if (error.code === 409) {
                console.log('⚠️  Slug index already exists');
            } else {
                console.error('❌ Error creating index:', error.message);
            }
        }

    } catch (error) {
        if (error.code === 409) {
            console.log('⚠️  Categories collection already exists');
        } else {
            console.error('❌ Error creating categories collection:', error.message);
        }
    }
}

// Helper sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main execution
async function main() {
    console.log('🚀 Starting Appware setup...\n');
    console.log(`Project ID: ${APPWRITE_PROJECT_ID}\n`);
    console.log(`Endpoint: ${APPWRITE_ENDPOINT}\n`);

    try {
        await createDatabase();
        await sleep(2000);
        await createCollections();
        await sleep(2000);

        await createStorageBucket();
        await sleep(2000);

        await createTeams();
        await sleep(2000);

        await seedServices();
        await sleep(2000);

        // Update services collection with new fields
        await updateServicesCollection();
        await sleep(2000);

        // Create categories collection
        await createCategoriesCollection();

        console.log('\n✅ Appwrite setup complete!');
        console.log('\n📝 Next steps:');
        console.log('1. Update .env.local files with your Appwrite credentials');
        console.log('2. Add your development URLs to Appwrite Console → Settings → Platforms');
        console.log('3. Run: npm install');
        console.log('4. Run: npm run dev');

    } catch (error) {
        console.error('\n❌ Setup failed:', error);
        process.exit(1);
    }
}

main();
