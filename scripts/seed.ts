import { Client, Databases, ID, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('692af80b00364ca8a6b2')
    .setKey('standard_89d27dfc6220b586dbd11b45cb73bda182047c5ddefe18bd07b57384ba08eda6fe256559ad23b1d79740f73335eebd44ed1e51198a835156de91266ba1f11285538a566dbe669b36035ddb285412c43ceff5aede62fb5ead53c98826d193600452305935b82bb08ad0972cf23de2017d28ef44fdcaec7776eacf5b232f2f68a7');

const databases = new Databases(client);
const databaseId = 'main';

const services = [
    {
        name: 'GST Registration',
        slug: 'gst-registration',
        category: 'Tax & Compliance',
        shortDescription: 'Complete GST registration service with expert guidance',
        description: `Our GST registration service provides end-to-end assistance for obtaining your GST number. We handle all documentation, filing, and follow-ups with the tax authorities.

Key Benefits:
• Expert consultation on GST applicability
• Complete documentation assistance
• Online application filing
• Regular status updates
• Post-registration compliance support

Process Overview:
1. Document collection and verification
2. Online application preparation
3. Filing with GST portal
4. Follow-up and tracking
5. GST certificate delivery

Timeline: 7-10 business days
Our CA experts ensure 100% compliance with GST regulations.`,
        price: 2999,
        currency: 'INR',
        deliveryTime: 7,
        features: [
            'Expert CA consultation',
            'Document verification',
            'Online GST application filing',
            'Regular status updates',
            'GST certificate delivery',
            'Post-registration support',
        ],
        requiredDocuments: [
            'PAN card',
            'Aadhaar card',
            'Business address proof',
            'Bank account details',
            'Business registration certificate',
            'Photograph',
        ],
    },
    {
        name: 'Trademark Registration',
        slug: 'trademark-registration',
        category: 'Intellectual Property',
        shortDescription: 'Protect your brand with comprehensive trademark registration',
        description: `Secure your brand identity with our expert trademark registration service. We provide complete assistance from search to registration.

Key Benefits:
• Comprehensive trademark search
• Professional application drafting
• Filing with Trademark Registry
• Opposition handling
• Registration certificate

Process Overview:
1. Trademark availability search
2. Class identification
3. Application drafting and filing
4. Examination response
5. Publication in Trademark Journal
6. Registration certificate

Timeline: 12-18 months (depending on examination)
Our IP experts ensure strong trademark protection.`,
        price: 6999,
        currency: 'INR',
        deliveryTime: 365,
        features: [
            'Trademark search report',
            'Class recommendation',
            'Professional application drafting',
            'Filing with registry',
            'Examination response',
            'Opposition handling (if required)',
            'Registration certificate',
        ],
        requiredDocuments: [
            'Applicant ID proof',
            'Business details',
            'Logo/wordmark sample',
            'Power of attorney',
            'Business registration (if company)',
        ],
    },
    {
        name: 'Private Limited Company Registration',
        slug: 'private-limited-company',
        category: 'Company Formation',
        shortDescription: 'Start your Private Limited Company with complete legal compliance',
        description: `Register your Private Limited Company with our comprehensive incorporation service. We handle everything from DSC to PAN/TAN.

Key Benefits:
• Digital Signature Certificate (DSC)
• Director Identification Number (DIN)
• Name reservation and approval
• MOA & AOA drafting
• Company PAN and TAN
• Current bank account assistance

Process Overview:
1. DSC and DIN application
2. Name availability check
3. SPICe+ form filing
4. MOA & AOA preparation
5. Certificate of Incorporation
6. PAN & TAN application

Timeline: 10-15 business days
Our CS professionals ensure full MCA compliance.`,
        price: 9999,
        currency: 'INR',
        deliveryTime: 15,
        features: [
            '2 Director DSC included',
            'DIN for directors',
            'Name approval',
            'MOA & AOA drafting',
            'SPICe+ filing',
            'Certificate of Incorporation',
            'PAN & TAN',
            'Current account assistance',
        ],
        requiredDocuments: [
            'Director PAN cards',
            'Director Aadhaar cards',
            'Photographs',
            'Registered office address proof',
            'Utility bills',
            'NOC from property owner',
        ],
    },
    {
        name: 'FSSAI Food License',
        slug: 'fssai-license',
        category: 'License & Registration',
        shortDescription: 'Get FSSAI food license for your food business',
        description: `Obtain your FSSAI food license with our expert assistance. We handle Basic, State, and Central licenses based on your business scale.

Key Benefits:
• License type recommendation
• Complete documentation support
• Application filing
• Regular tracking
• License certificate delivery

Types of FSSAI Licenses:
• Basic Registration (up to ₹12 lakhs turnover)
• State License (₹12 lakhs to ₹20 crores)
• Central License (above ₹20 crores)

Process Overview:
1. Business assessment
2. License type selection
3. Document preparation
4. Online application filing
5. Inspection support (if required)
6. License certificate

Timeline: 15-30 business days
Our food safety experts ensure full compliance.`,
        price: 3999,
        currency: 'INR',
        deliveryTime: 30,
        features: [
            'License type consultation',
            'Document preparation',
            'FSSAI portal filing',
            'Inspection support',
            'License certificate',
            '1-year validity (renewable)',
        ],
        requiredDocuments: [
            'Business owner ID proof',
            'Business address proof',
            'List of food products',
            'Layout plan of premises',
            'Source of water supply',
            'Partnership deed/Company registration',
        ],
    },
    {
        name: 'ISO Certification',
        slug: 'iso-certification',
        category: 'Certification',
        shortDescription: 'Get ISO 9001:2015 certification for quality management',
        description: `Achieve ISO 9001:2015 certification with our comprehensive support. We guide you through documentation, implementation, and audit.

Key Benefits:
• Gap analysis
• Documentation support
• Process implementation
• Internal audit training
• Certification audit support
• Internationally recognized certificate

Process Overview:
1. Initial consultation and gap analysis
2. Documentation preparation
3. Quality manual creation
4. Process implementation
5. Internal audit
6. Certification audit
7. ISO certificate issuance

Timeline: 45-60 days
Our quality management experts ensure smooth certification.`,
        price: 14999,
        currency: 'INR',
        deliveryTime: 60,
        features: [
            'Gap analysis report',
            'Quality manual preparation',
            'Process documentation',
            'Employee training',
            'Internal audit support',
            'Certification audit coordination',
            'ISO 9001:2015 certificate',
        ],
        requiredDocuments: [
            'Company registration certificate',
            'Business details',
            'Organization structure',
            'Product/service details',
            'Current processes documentation',
        ],
    },
    {
        name: 'Import Export Code (IEC)',
        slug: 'iec-registration',
        category: 'Trade License',
        shortDescription: 'Obtain IEC for importing and exporting goods',
        description: `Get your Import Export Code (IEC) to start international trade. Our experts handle the complete DGFT application process.

Key Benefits:
• Quick processing
• Complete documentation support
• DGFT filing
• Digital IEC certificate
• Lifetime validity

Process Overview:
1. Document collection
2. Application preparation
3. DGFT portal filing
4. Payment processing
5. IEC certificate download

Timeline: 3-5 business days
One-time registration, lifetime validity.`,
        price: 2499,
        currency: 'INR',
        deliveryTime: 5,
        features: [
            'Fast processing',
            'Expert consultation',
            'DGFT filing',
            'Digital IEC certificate',
            'Lifetime validity',
            'No renewal required',
        ],
        requiredDocuments: [
            'PAN card',
            'Aadhaar card',
            'Bank certificate/cancelled cheque',
            'Business address proof',
            'Photograph',
            'Business registration proof',
        ],
    },
    {
        name: 'Shop and Establishment License',
        slug: 'shop-establishment-license',
        category: 'License & Registration',
        shortDescription: 'Register your shop or commercial establishment legally',
        description: `Obtain Shop and Establishment license for your business premises. This is mandatory for all commercial establishments.

Key Benefits:
• Legal compliance
• Business legitimacy
• Employee welfare compliance
• Required for other licenses
• Easy renewal support

Process Overview:
1. Document collection
2. Application preparation
3. Online submission
4. Department processing
5. License certificate

Timeline: 7-15 business days (varies by state)
Essential license for all commercial establishments.`,
        price: 1999,
        currency: 'INR',
        deliveryTime: 15,
        features: [
            'Application preparation',
            'Online filing',
            'Follow-up with authorities',
            'License certificate',
            'Renewal reminder',
        ],
        requiredDocuments: [
            'Owner PAN card',
            'Owner Aadhaar card',
            'Premises address proof',
            'Rent agreement/ownership deed',
            'NOC from landlord',
            'Employee details',
        ],
    },
    {
        name: 'MSME/Udyam Registration',
        slug: 'msme-registration',
        category: 'Business Registration',
        shortDescription: 'Register as MSME for government benefits and subsidies',
        description: `Get your Udyam Registration Certificate (MSME) to avail various government benefits, subsidies, and easier loan approvals.

Key Benefits:
• Government subsidies
• Easy loan approvals
• Lower interest rates
• Priority in government tenders
• Protection against delayed payments
• Tax benefits

Process Overview:
1. Business classification
2. Aadhaar verification
3. Online registration
4. Certificate generation

Timeline: 1-2 business days
Free registration, instant certificate.`,
        price: 999,
        currency: 'INR',
        deliveryTime: 2,
        features: [
            'Instant registration',
            'Udyam certificate',
            'Lifetime validity',
            'Government benefits eligibility',
            'Free process',
            'Aadhaar-based',
        ],
        requiredDocuments: [
            'Owner Aadhaar card',
            'Business PAN card',
            'Business details',
            'Bank account details',
        ],
    },
];

async function seedServices() {
    console.log('🌱 Starting service seeding...\n');
    console.log('ℹ️  Note: If service already exists, creation will be skipped automatically.\n');

    let successCount = 0;
    let errorCount = 0;

    for (const service of services) {
        try {
            // Create new service
            await databases.createDocument(
                databaseId,
                'services',
                ID.unique(),
                service
            );

            console.log(`✅ Created: ${service.name}`);
            successCount++;
        } catch (error: any) {
            if (error.message && error.message.includes('already exists')) {
                console.log(`⏭️  Skipping: ${service.name} (already exists)`);
            } else if (error.message && error.message.includes('unique')) {
                console.log(`⏭️  Skipping: ${service.name} (duplicate slug)`);
            } else {
                console.error(`❌ Failed to create ${service.name}:`, error.message);
                errorCount++;
            }
        }
    }

    console.log('\n🎉 Seeding completed!');
    console.log(`   Created: ${successCount} services`);
    console.log(`   Errors: ${errorCount} services`);
    console.log(`   Total: ${services.length} services`);
}

// Run the script
seedServices()
    .then(() => {
        console.log('\n✨ All done! Services are now available.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error);
        process.exit(1);
    });
