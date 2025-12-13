import { ServiceData } from '@/types/service'

export const privateLimitedService: ServiceData = {
    // Basic Info
    slug: 'private-limited-company',
    title: 'Private Limited Company Registration',
    category: 'company-registration',

    // Pricing
    basePrice: 999,
    timeline: '14-21 days',

    // SEO
    metaTitle: 'Private Limited Company Registration Online @ ₹999 | Expert Assistance',
    metaDescription: 'Register your Private Limited Company in India with LawEthic. Expert filing, transparent pricing from ₹999, incorporation in 14-21 days. 100% online process.',
    keywords: ['private limited company', 'company registration', 'pvt ltd registration', 'incorporation', 'startup registration'],

    // Hero Section
    hero: {
        badge: '',
        title: 'Private Limited Company Registration @ ₹999',
        description: 'Register your Private Limited Company in India with expert assistance. Get incorporation certificate in 14-21 days.',
        highlights: [
            'Expert filing in 2 days',
            'Transparent pricing starting at ₹999 + Govt Fee',
            'Complete compliance handling',
            'Incorporation in 14-21 days'
        ]
    },

    // Packages
    packages: [
        {
            id: 'starter',
            name: 'Starter',
            price: 999,
            timeline: '21 days',
            featured: false,
            inclusions: [
                'Company name filed in 4-7 days',
                'DSC for 2 Directors in 7-10 days',
                'SPICe+ form filing in 21 days',
                'Incorporation Certificate in 40 days',
                'Company PAN+TAN',
                'DIN for Directors'
            ],
            exclusions: [
                'Government fees (₹4,000-8,000)',
                'Quick processing',
                'Trademark registration',
                'MSME registration'
            ]
        },
        {
            id: 'standard',
            name: 'Standard',
            price: 1499,
            timeline: '14-21 days',
            featured: true,
            inclusions: [
                'Expert assisted process',
                'Company name filed in 2-3 days',
                'DSC for 2 Directors in 3-4 days',
                'SPICe+ form filing in 10 days',
                'Incorporation Certificate in 14-21 days',
                'Company PAN+TAN',
                'DIN for directors',
                'Welcome Kit with Compliance Checklist'
            ],
            exclusions: [
                'Government fees (₹4,000-8,000)',
                'Trademark registration',
                'MSME registration'
            ]
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 3499,
            timeline: '8-14 days',
            featured: false,
            inclusions: [
                'Expert-assisted process',
                'Company name filed in 0-1 day',
                'DSC for 2 Directors in 1-2 days',
                'SPICe+ form filing in 5 days',
                'Incorporation Certificate in 8-14 days',
                'Company PAN+TAN',
                'DIN for Directors',
                'Welcome Kit with Compliance Checklist',
                'Quick Trademark Filing in 1 day',
                'MSME registration Free'
            ],
            exclusions: [
                'Government fees (₹4,000-8,000)'
            ]
        }
    ],

    // Process Steps
    process: [
        {
            step: 1,
            title: 'Name Approval',
            description: 'We file your proposed company names with MCA for approval. Choose 3 name options and we handle the rest.',
            duration: '2-3 days'
        },
        {
            step: 2,
            title: 'Digital Signature Certificate',
            description: 'DSC obtained for 2 directors required for signing digital documents with the government.',
            duration: '3-4 days'
        },
        {
            step: 3,
            title: 'SPICe+ Form Filing',
            description: 'Complete incorporation application submitted to MCA including MOA, AOA, and other required documents.',
            duration: '10 days'
        },
        {
            step: 4,
            title: 'Incorporation Certificate',
            description: 'Your company is officially registered! Receive Certificate of Incorporation, PAN, TAN, and DIN.',
            duration: '14-21 days'
        }
    ],

    // Documents
    documents: {
        required: [
            {
                title: 'PAN Card',
                description: 'Mandatory for all directors',
                applicableFor: 'All Directors'
            },
            {
                title: 'Aadhaar Card',
                description: 'For identity proof',
                applicableFor: 'All Directors'
            },
            {
                title: 'Passport-size photograph',
                description: 'Recent photograph',
                applicableFor: 'All Directors'
            },
            {
                title: 'Address Proof',
                description: 'Utility bill, bank statement, or passport',
                applicableFor: 'All Directors'
            },
            {
                title: 'Bank statement',
                description: 'Last 2 months',
                applicableFor: 'All Directors'
            },
            {
                title: 'Registered office address proof',
                description: 'NOC from property owner',
                applicableFor: 'For Company'
            },
            {
                title: 'Rent agreement',
                description: 'If rented property',
                applicableFor: 'For Company'
            },
            {
                title: 'Utility bill',
                description: 'Of registered office',
                applicableFor: 'For Company'
            }
        ],
        optional: [
            {
                title: 'Specimen signature',
                description: 'Signed on blank paper',
                applicableFor: 'All Directors'
            },
            {
                title: 'Directors consent letter',
                description: 'Consent to act as director',
                applicableFor: 'All Directors'
            },
            {
                title: 'Business activities description',
                description: 'Proposed business details',
                applicableFor: 'For Company'
            }
        ]
    },

    // FAQs
    faqs: [
        {
            question: 'How long does Private Limited Company registration take?',
            answer: 'Typically 14-21 days in a straightforward case without objections. With our Pro package, it can be completed in 8-14 days.'
        },
        {
            question: 'What is the minimum capital required?',
            answer: 'There is no minimum capital requirement for Private Limited Companies in India. You can start with as little as ₹1,000.'
        },
        {
            question: 'How many directors are required?',
            answer: 'Minimum 2 directors are required. Maximum limit is 15 directors (can be increased with special resolution). At least one director must be an Indian resident.'
        },
        {
            question: 'What are the annual compliance requirements?',
            answer: 'Private Limited Companies must file annual returns (Form MGT-7), financial statements (Form AOC-4), conduct board meetings, maintain statutory registers, and file income tax returns.'
        },
        {
            question: 'Can foreigners be directors or shareholders?',
            answer: 'Yes, foreigners can be directors and shareholders. However, at least one director must be an Indian resident. Foreign investment may require RBI/FIPB approval in certain sectors.'
        },
        {
            question: 'What is the difference between Private and Public Limited Company?',
            answer: 'Private Limited has minimum 2 and maximum 200 shareholders, cannot raise funds from public. Public Limited can have unlimited shareholders and can raise funds through public issue.'
        },
        {
            question: 'Do I need a physical office to register?',
            answer: 'Yes, you need a registered office address in India. It can be residential or commercial property. We help with virtual office solutions if needed.'
        },
        {
            question: 'What happens if my company name is rejected?',
            answer: 'We conduct thorough name search before filing. If still rejected, we\'ll file your second or third choice at no extra cost.'
        }
    ]
}

export default privateLimitedService
