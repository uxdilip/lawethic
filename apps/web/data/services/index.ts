/**
 * UNIFIED SERVICES REGISTRY
 * ===========================
 *
 * All services are defined in this single file.
 * To add a new service, simply add an object to the SERVICES array.
 *
 * The URL will be: /services/{slug}
 * Example: /services/private-limited-company-registration
 */

// ===========================================
// TYPE DEFINITIONS
// ===========================================

export interface ServicePackage {
    id: string
    name: string
    price: number
    originalPrice?: number
    discount?: string
    timeline: string
    featured: boolean
    inclusions: string[]
    exclusions?: string[]
    emiAvailable?: boolean
}

export interface ProcessStep {
    step: number
    title: string
    description: string
    duration: string
    icon?: string // lucide icon name
}

export interface DocumentGroup {
    entityType: string // "Individuals", "Companies", "LLPs", etc.
    items: string[]
}

export interface FAQ {
    question: string
    answer: string
}

// NEW: Overview section
export interface OverviewSection {
    title: string
    description: string // Supports HTML/markdown
    highlights?: string[]
    image?: string // Placeholder path for illustration
}

// NEW: Eligibility section
export interface EligibilitySection {
    title: string
    description?: string
    entities: {
        name: string
        icon?: string // lucide icon name
    }[]
}

// NEW: Types section (e.g., types of trademarks, types of companies)
export interface TypeItem {
    name: string
    description: string
    icon?: string // lucide icon name
    image?: string // optional image
}

export interface TypesSection {
    title: string
    description?: string
    items: TypeItem[]
}

// NEW: Fees section with table
export interface FeeRow {
    entityType: string
    eFiling: string
    physical?: string
    notes?: string
}

export interface FeesSection {
    title: string
    description?: string
    table: FeeRow[]
}

// NEW: Benefits/Why Choose Us section
export interface BenefitItem {
    title: string
    description: string
    icon?: string // lucide icon name
}

export interface BenefitsSection {
    title: string
    description?: string
    items: BenefitItem[]
}

// NEW: Enhanced documents section
export interface DocumentsSection {
    title?: string
    description?: string
    groups: DocumentGroup[]
}

// ===========================================
// MAIN SERVICE INTERFACE
// ===========================================

export interface Service {
    // Unique identifier (used in URL)
    slug: string

    // Display info
    title: string
    shortTitle?: string
    category: string
    categorySlug: string

    // Pricing
    basePrice: number
    timeline: string
    badge?: string | null

    // SEO
    metaTitle: string
    metaDescription: string
    keywords: string[]

    // Hero Section
    hero: {
        badge?: string
        title: string
        description: string
        highlights: string[]
        trustSignals?: {
            rating: string
            served: string
            certified: string
        }
        // Lead form configuration
        formTitle?: string
        formCta?: string
    }

    // Pricing packages
    packages: ServicePackage[]

    // ===========================================
    // EDUCATION CONTENT SECTIONS (Optional)
    // ===========================================
    // These sections appear in the sticky nav sidebar
    // Only include sections you need for each service

    overview?: OverviewSection
    eligibility?: EligibilitySection
    types?: TypesSection
    fees?: FeesSection
    documents?: DocumentsSection
    process?: ProcessStep[]
    benefits?: BenefitsSection
    faqs?: FAQ[]

    // ===========================================
    // SERVICE-SPECIFIC SECTIONS (Optional)
    // ===========================================
    // Add custom sections as needed per service

    // For trademark - trademark classes
    trademarkClasses?: {
        title: string
        description?: string
        items: { classNumber: number; name: string; description: string }[]
    }

    // For company registration - authorized capital info
    capitalInfo?: {
        title: string
        description: string
        table?: { capital: string; govtFee: string }[]
    }

    // Post-registration procedures
    postRegistration?: {
        title: string
        items: { title: string; description: string }[]
    }

    // Related services (slugs)
    relatedServices?: string[]
}

/**
 * ALL SERVICES
 * Add new services here - that's it!
 */
export const SERVICES: Service[] = [
    // ============================================
    // COMPANY REGISTRATION
    // ============================================
    {
        slug: 'private-limited-company-registration',
        title: 'Private Limited Company Registration',
        shortTitle: 'Pvt Ltd Registration',
        category: 'Company Registration',
        categorySlug: 'company-registration',
        basePrice: 999,
        timeline: '14-21 days',
        badge: 'Most Popular',

        metaTitle: 'Private Limited Company Registration Online @ ₹999 | LawEthic',
        metaDescription: 'Register your Private Limited Company in India with LawEthic. Expert filing, transparent pricing from ₹999, incorporation in 14-21 days. 100% online process.',
        keywords: ['private limited company', 'company registration', 'pvt ltd registration', 'incorporation', 'startup registration'],

        hero: {
            badge: 'Most Popular',
            title: 'Private Limited Company Registration @ ₹999',
            description: 'Register your Private Limited Company in India with expert assistance. Get incorporation certificate in 14-21 days.',
            highlights: [
                'Expert filing in 2 days',
                'Transparent pricing starting at ₹999 + Govt Fee',
                'Complete compliance handling',
                'Incorporation in 14-21 days'
            ],
            trustSignals: {
                rating: '4.5/5 Google Rating',
                served: '10,000+ Companies Registered',
                certified: 'MCA Certified Experts'
            }
        },

        packages: [
            {
                id: 'starter',
                name: 'Starter',
                price: 999,
                originalPrice: 1499,
                discount: '33% off',
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
                originalPrice: 2999,
                discount: '50% off',
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
                originalPrice: 4999,
                discount: '30% off',
                timeline: '8-14 days',
                featured: false,
                emiAvailable: true,
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

        documents: {
            required: [
                { title: 'PAN Card', description: 'Mandatory for all directors', applicableFor: 'All Directors' },
                { title: 'Aadhaar Card', description: 'For identity proof', applicableFor: 'All Directors' },
                { title: 'Passport-size photograph', description: 'Recent photograph', applicableFor: 'All Directors' },
                { title: 'Address Proof', description: 'Utility bill, bank statement, or passport', applicableFor: 'All Directors' },
                { title: 'Bank statement', description: 'Last 2 months', applicableFor: 'All Directors' },
                { title: 'Registered office address proof', description: 'NOC from property owner', applicableFor: 'For Company' },
                { title: 'Rent agreement', description: 'If rented property', applicableFor: 'For Company' },
                { title: 'Utility bill', description: 'Of registered office', applicableFor: 'For Company' }
            ],
            optional: [
                { title: 'Specimen signature', description: 'Signed on blank paper', applicableFor: 'All Directors' },
                { title: 'Directors consent letter', description: 'Consent to act as director', applicableFor: 'All Directors' },
                { title: 'Business activities description', description: 'Proposed business details', applicableFor: 'For Company' }
            ]
        },

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
            }
        ],

        relatedServices: ['llp-registration', 'one-person-company-registration', 'partnership-firm-registration']
    },

    // ============================================
    // LLP REGISTRATION
    // ============================================
    {
        slug: 'llp-registration',
        title: 'Limited Liability Partnership (LLP) Registration',
        shortTitle: 'LLP Registration',
        category: 'Company Registration',
        categorySlug: 'company-registration',
        basePrice: 1999,
        timeline: '10-15 days',
        badge: null,

        metaTitle: 'LLP Registration Online @ ₹1999 | Limited Liability Partnership | LawEthic',
        metaDescription: 'Register your LLP in India with LawEthic. Limited liability with partnership flexibility. Expert filing from ₹1999, registration in 10-15 days.',
        keywords: ['llp registration', 'limited liability partnership', 'llp india', 'register llp online'],

        hero: {
            title: 'LLP Registration @ ₹1999',
            description: 'Register your Limited Liability Partnership in India. Best for professionals and small businesses wanting liability protection.',
            highlights: [
                'Limited liability protection',
                'No minimum capital required',
                'Lower compliance burden than Pvt Ltd',
                'Registration in 10-15 days'
            ],
            trustSignals: {
                rating: '4.5/5 Google Rating',
                served: '5,000+ LLPs Registered',
                certified: 'MCA Certified Experts'
            }
        },

        packages: [
            {
                id: 'basic',
                name: 'Basic',
                price: 1999,
                originalPrice: 2999,
                discount: '33% off',
                timeline: '15 days',
                featured: false,
                inclusions: [
                    'LLP Name Reservation',
                    'DSC for 2 Partners',
                    'DPIN for 2 Partners',
                    'LLP Agreement Drafting',
                    'Certificate of Incorporation',
                    'LLP PAN & TAN'
                ],
                exclusions: [
                    'Government fees (₹1,500-2,000)',
                    'Quick processing'
                ]
            },
            {
                id: 'standard',
                name: 'Standard',
                price: 2999,
                originalPrice: 4999,
                discount: '40% off',
                timeline: '10-12 days',
                featured: true,
                inclusions: [
                    'Everything in Basic',
                    'Priority processing',
                    'Customized LLP Agreement',
                    'GST Registration',
                    'Compliance calendar'
                ],
                exclusions: [
                    'Government fees (₹1,500-2,000)'
                ]
            }
        ],

        process: [
            {
                step: 1,
                title: 'Name Reservation',
                description: 'Reserve your LLP name through RUN-LLP form with MCA.',
                duration: '2-3 days'
            },
            {
                step: 2,
                title: 'DSC & DPIN',
                description: 'Digital Signature Certificate and Designated Partner Identification Number for partners.',
                duration: '3-4 days'
            },
            {
                step: 3,
                title: 'Filing FiLLiP Form',
                description: 'Incorporation form submitted with LLP Agreement and all required documents.',
                duration: '5-7 days'
            },
            {
                step: 4,
                title: 'LLP Incorporation',
                description: 'Receive Certificate of Incorporation, PAN, and TAN.',
                duration: '10-15 days'
            }
        ],

        documents: {
            required: [
                { title: 'PAN Card', description: 'For all partners', applicableFor: 'All Partners' },
                { title: 'Aadhaar Card', description: 'Identity proof', applicableFor: 'All Partners' },
                { title: 'Passport Photo', description: 'Recent photograph', applicableFor: 'All Partners' },
                { title: 'Address Proof', description: 'Bank statement or utility bill', applicableFor: 'All Partners' },
                { title: 'Office Address Proof', description: 'Rent agreement or ownership proof', applicableFor: 'For LLP' },
                { title: 'NOC from Owner', description: 'If rented premises', applicableFor: 'For LLP' }
            ]
        },

        faqs: [
            {
                question: 'What is the minimum requirement to form an LLP?',
                answer: 'Minimum 2 designated partners required. There is no maximum limit. At least one partner must be an Indian resident.'
            },
            {
                question: 'What is the difference between LLP and Private Limited?',
                answer: 'LLP has lower compliance, no minimum capital, and profits are taxed at partner level. Pvt Ltd is better for raising external funding and has clearer ownership structure.'
            },
            {
                question: 'Is there any minimum capital requirement?',
                answer: 'No, there is no minimum capital requirement for LLP registration in India.'
            },
            {
                question: 'What are the annual compliance requirements?',
                answer: 'LLPs must file Form 11 (Annual Return) and Form 8 (Statement of Account) every year.'
            }
        ],

        relatedServices: ['private-limited-company-registration', 'partnership-firm-registration']
    },

    // ============================================
    // ONE PERSON COMPANY
    // ============================================
    {
        slug: 'one-person-company-registration',
        title: 'One Person Company (OPC) Registration',
        shortTitle: 'OPC Registration',
        category: 'Company Registration',
        categorySlug: 'company-registration',
        basePrice: 1499,
        timeline: '10-15 days',
        badge: 'For Solo Entrepreneurs',

        metaTitle: 'One Person Company Registration @ ₹1499 | OPC Registration Online | LawEthic',
        metaDescription: 'Register One Person Company (OPC) in India. Perfect for solo entrepreneurs. Limited liability with single ownership. Registration in 10-15 days.',
        keywords: ['opc registration', 'one person company', 'single owner company', 'opc india'],

        hero: {
            badge: 'For Solo Entrepreneurs',
            title: 'One Person Company Registration @ ₹1499',
            description: 'Start your company as a single owner with limited liability protection. Perfect for solo entrepreneurs.',
            highlights: [
                'Single member ownership',
                'Limited liability protection',
                'Separate legal entity',
                'Easy to convert to Pvt Ltd later'
            ],
            trustSignals: {
                rating: '4.5/5 Google Rating',
                served: '3,000+ OPCs Registered',
                certified: 'MCA Certified Experts'
            }
        },

        packages: [
            {
                id: 'basic',
                name: 'Basic',
                price: 1499,
                originalPrice: 2499,
                discount: '40% off',
                timeline: '15 days',
                featured: false,
                inclusions: [
                    'Name Reservation',
                    'DSC for Director',
                    'DIN for Director',
                    'MOA & AOA Drafting',
                    'Certificate of Incorporation',
                    'PAN & TAN'
                ],
                exclusions: [
                    'Government fees (₹3,000-5,000)'
                ]
            },
            {
                id: 'complete',
                name: 'Complete',
                price: 2499,
                originalPrice: 3999,
                discount: '38% off',
                timeline: '10-12 days',
                featured: true,
                inclusions: [
                    'Everything in Basic',
                    'Priority processing',
                    'GST Registration',
                    'Current Account Opening Support',
                    'Compliance Calendar'
                ],
                exclusions: [
                    'Government fees (₹3,000-5,000)'
                ]
            }
        ],

        process: [
            {
                step: 1,
                title: 'Name Approval',
                description: 'Reserve your company name with MCA through RUN form.',
                duration: '2-3 days'
            },
            {
                step: 2,
                title: 'DSC & DIN',
                description: 'Obtain Digital Signature and Director Identification Number.',
                duration: '3-4 days'
            },
            {
                step: 3,
                title: 'SPICe+ Filing',
                description: 'Submit incorporation form with MOA, AOA, and nominee details.',
                duration: '5-7 days'
            },
            {
                step: 4,
                title: 'Incorporation',
                description: 'Receive Certificate of Incorporation, PAN, TAN, and DIN.',
                duration: '10-15 days'
            }
        ],

        documents: {
            required: [
                { title: 'PAN Card', description: 'Of the single member', applicableFor: 'Member' },
                { title: 'Aadhaar Card', description: 'Identity proof', applicableFor: 'Member' },
                { title: 'Passport Photo', description: 'Recent photograph', applicableFor: 'Member' },
                { title: 'Address Proof', description: 'Bank statement or utility bill', applicableFor: 'Member' },
                { title: 'Nominee Details', description: 'PAN and Aadhaar of nominee', applicableFor: 'Nominee' },
                { title: 'Office Address Proof', description: 'Rent agreement or ownership proof', applicableFor: 'For Company' }
            ]
        },

        faqs: [
            {
                question: 'Who can register an OPC?',
                answer: 'Only a natural person who is an Indian citizen and resident in India can incorporate an OPC. The person must have stayed in India for at least 182 days in the preceding year.'
            },
            {
                question: 'Is nominee mandatory for OPC?',
                answer: 'Yes, you need to appoint a nominee who will become the member in case of death or incapacity of the original member.'
            },
            {
                question: 'Can OPC be converted to Private Limited?',
                answer: 'Yes, OPC can be converted to Private Limited Company voluntarily or mandatorily when turnover exceeds ₹2 crore or paid-up capital exceeds ₹50 lakhs.'
            }
        ],

        relatedServices: ['private-limited-company-registration', 'llp-registration']
    },

    // ============================================
    // GST REGISTRATION
    // ============================================
    {
        slug: 'gst-registration',
        title: 'GST Registration',
        shortTitle: 'GST Registration',
        category: 'Tax & Compliance',
        categorySlug: 'gst-registration',
        basePrice: 999,
        timeline: '3-5 days',
        badge: null,

        metaTitle: 'GST Registration Online @ ₹999 | Quick GST Number | LawEthic',
        metaDescription: 'Get GST Registration in 3-5 days. Expert assistance for GST number application. 100% online process. Starting at ₹999.',
        keywords: ['gst registration', 'gst number', 'gstin', 'gst application', 'gst certificate'],

        hero: {
            title: 'GST Registration @ ₹999',
            description: 'Get your GST number quickly with expert assistance. Required for businesses with turnover above ₹40 lakhs.',
            highlights: [
                'GST Number in 3-5 days',
                'Expert document verification',
                'ARN tracking & updates',
                '100% online process'
            ],
            trustSignals: {
                rating: '4.5/5 Google Rating',
                served: '20,000+ GST Registrations',
                certified: 'GST Certified Experts'
            }
        },

        packages: [
            {
                id: 'basic',
                name: 'Basic',
                price: 999,
                originalPrice: 1499,
                discount: '33% off',
                timeline: '5-7 days',
                featured: false,
                inclusions: [
                    'GST Application Filing',
                    'Document Verification',
                    'ARN Generation',
                    'GSTIN Certificate',
                    'Login Credentials'
                ],
                exclusions: [
                    'GST Return Filing',
                    'Priority processing'
                ]
            },
            {
                id: 'express',
                name: 'Express',
                price: 1499,
                originalPrice: 2499,
                discount: '40% off',
                timeline: '3-5 days',
                featured: true,
                inclusions: [
                    'Everything in Basic',
                    'Priority processing',
                    'First GST Return Filing (GSTR-1)',
                    'GST Software Setup',
                    'Dedicated Support'
                ]
            }
        ],

        process: [
            {
                step: 1,
                title: 'Document Collection',
                description: 'Submit your business and identity documents through our portal.',
                duration: '1 day'
            },
            {
                step: 2,
                title: 'Application Filing',
                description: 'We file your GST application on the government portal.',
                duration: '1-2 days'
            },
            {
                step: 3,
                title: 'ARN Generation',
                description: 'Application Reference Number received for tracking.',
                duration: 'Same day'
            },
            {
                step: 4,
                title: 'GSTIN Allotment',
                description: 'Receive your 15-digit GST Number and certificate.',
                duration: '3-5 days'
            }
        ],

        documents: {
            required: [
                { title: 'PAN Card', description: 'Of business/proprietor', applicableFor: 'Business' },
                { title: 'Aadhaar Card', description: 'Of proprietor/partners/directors', applicableFor: 'Applicant' },
                { title: 'Business Address Proof', description: 'Rent agreement or electricity bill', applicableFor: 'Business' },
                { title: 'Bank Account Details', description: 'Cancelled cheque or statement', applicableFor: 'Business' },
                { title: 'Passport Photo', description: 'Of applicant', applicableFor: 'Applicant' },
                { title: 'Business Registration', description: 'Certificate of Incorporation if applicable', applicableFor: 'Business' }
            ]
        },

        faqs: [
            {
                question: 'Who needs GST Registration?',
                answer: 'GST registration is mandatory if your annual turnover exceeds ₹40 lakhs (₹20 lakhs for special category states) or if you sell online/interstate.'
            },
            {
                question: 'What is the validity of GST Registration?',
                answer: 'GST registration is valid until cancelled. However, you need to file returns regularly to keep it active.'
            },
            {
                question: 'Can I apply for GST voluntarily?',
                answer: 'Yes, even if your turnover is below the threshold, you can voluntarily register for GST to claim input tax credit.'
            },
            {
                question: 'What if my application is rejected?',
                answer: 'We review your documents before filing to minimize rejections. If rejected, we will refile at no extra cost.'
            }
        ],

        relatedServices: ['gst-return-filing', 'gst-cancellation']
    },

    // ============================================
    // TRADEMARK REGISTRATION
    // ============================================
    {
        slug: 'trademark-registration',
        title: 'Trademark Registration',
        shortTitle: 'Trademark',
        category: 'Trademark & IP',
        categorySlug: 'trademark-registration',
        basePrice: 1999,
        timeline: '1-2 days filing',
        badge: 'Brand Protection',

        metaTitle: 'Trademark Registration Online @ ₹1999 | Protect Your Brand | LawEthic',
        metaDescription: 'Register your trademark in India. Protect your brand, logo, and name. Expert filing in 1-2 days. 10-year protection with renewal option.',
        keywords: ['trademark registration', 'brand registration', 'logo trademark', 'tm registration india'],

        hero: {
            badge: 'Protect Your Brand',
            title: 'Trademark Registration Online in India',
            description: 'Protect your brand name, logo, and tagline with expert trademark registration. 10-year protection starting at ₹1,999 + govt fees.',
            highlights: [
                'Trademark filing starts at ₹1,999 + govt fees',
                'Senior IP lawyer conducts thorough trademark search',
                '30-minute consultation with a Trademark Expert',
                'Filing within 6 hours, TM symbol in 24 hours'
            ],
            trustSignals: {
                rating: '4.5/5 Google Rating',
                served: '15,000+ Trademarks Filed',
                certified: 'IP Certified Experts'
            },
            formTitle: 'Register Your Trademark!',
            formCta: 'Get Started'
        },

        packages: [
            {
                id: 'standard',
                name: 'Standard Filing',
                price: 1999,
                originalPrice: 2999,
                discount: '33% off',
                timeline: '3 working days',
                featured: false,
                inclusions: [
                    '30-minute consultation with TM Expert',
                    'Thorough TM name/logo search',
                    'Assistance in selecting TM class',
                    'Form 48 - Complementary',
                    'TM Filing within 3 working days',
                    'TM Receipt within 3 working days'
                ],
                exclusions: [
                    'Government fees (₹4,500 for individuals/MSME)',
                    'Objection handling'
                ]
            },
            {
                id: 'express',
                name: 'Express Filing',
                price: 2999,
                originalPrice: 4999,
                discount: '40% off',
                timeline: '6 hours',
                featured: true,
                emiAvailable: true,
                inclusions: [
                    '30-minute consultation with TM Expert',
                    'Thorough TM name/logo search',
                    'Assistance in selecting TM class',
                    'Form 48 - Complementary',
                    'TM Filing within 6 hours',
                    'TM Receipt within 24 hours',
                    'Free MSME Registration'
                ],
                exclusions: [
                    'Government fees (₹4,500 for individuals/MSME)'
                ]
            }
        ],

        // ===========================================
        // EDUCATION CONTENT SECTIONS
        // ===========================================

        overview: {
            title: 'What is Trademark Registration?',
            description: `Trademark registration is the process of securing exclusive legal rights to your brand name, logo, or symbol. In India, it is governed by the **Trade Marks Act, 1999**, which allows you to protect and exclusively use your intellectual property in the marketplace.

The trademark application process involves filing Form TM-A with the Trademark Office and selecting the appropriate class for your goods or services. Once registered, you gain the right to use the **® symbol**, signifying that your trademark is officially recognized.

At LawEthic, we simplify the online trademark registration process by offering expert guidance through trademark searches, addressing objections or oppositions, and managing renewals.`,
            highlights: [
                'Establishes official public record of ownership',
                'Distinguishes your brand from competitors',
                'Builds customer trust with quality association',
                'Increases business value for investors',
                'Allows licensing to others',
                'Becomes a valuable business asset'
            ],
            image: '/images/services/trademark/overview.svg'
        },

        eligibility: {
            title: 'Who Can Apply for Trademark Registration?',
            description: 'The person or entity listed as the applicant in the registration form will be considered a trademark owner. The following entities can apply:',
            entities: [
                { name: 'Individuals', icon: 'User' },
                { name: 'Joint Owners', icon: 'Users' },
                { name: 'Proprietorship Firms', icon: 'Store' },
                { name: 'Partnership Firms', icon: 'Handshake' },
                { name: 'Limited Liability Partnerships (LLPs)', icon: 'Building' },
                { name: 'Private Limited Companies', icon: 'Building2' },
                { name: 'Public Limited Companies', icon: 'Landmark' },
                { name: 'Foreign Companies', icon: 'Globe' },
                { name: 'Trusts & Societies', icon: 'Heart' }
            ]
        },

        types: {
            title: 'Types of Trademarks in India',
            description: 'Trademarks are categorized into different types, each dedicated to distinguishing goods and services:',
            items: [
                {
                    name: 'Product Mark',
                    description: 'Identifies and distinguishes goods rather than services. Includes brand names, logos, or symbols. Example: Nike, Apple.',
                    icon: 'Package',
                    image: '/images/services/trademark/types/product-mark.svg'
                },
                {
                    name: 'Service Mark',
                    description: 'Outlines services provided by a company. Brand names or logos identifying a service. Example: United Airlines.',
                    icon: 'Briefcase',
                    image: '/images/services/trademark/types/service-mark.svg'
                },
                {
                    name: 'Certification Mark',
                    description: 'Indicates that a product or service meets specific standards. Example: ISI mark, FSSAI mark.',
                    icon: 'BadgeCheck',
                    image: '/images/services/trademark/types/certification-mark.svg'
                },
                {
                    name: 'Collective Mark',
                    description: 'Used by a group or association to identify goods and services from its members. Example: CII.',
                    icon: 'Users',
                    image: '/images/services/trademark/types/collective-mark.svg'
                },
                {
                    name: 'Shape Mark',
                    description: 'Protects the distinctive shape of a product or its packaging. Example: Coca-Cola bottle.',
                    icon: 'Box',
                    image: '/images/services/trademark/types/shape-mark.svg'
                },
                {
                    name: 'Logo Mark',
                    description: 'Protects unique visual symbols, logos, or designs identifying a product or service.',
                    icon: 'Palette',
                    image: '/images/services/trademark/types/logo-mark.svg'
                },
                {
                    name: 'Sound Mark',
                    description: 'Protects a distinctive sound identifying a brand. Example: Yahoo yodel, Intel chime.',
                    icon: 'Volume2',
                    image: '/images/services/trademark/types/sound-mark.svg'
                },
                {
                    name: 'Color Mark',
                    description: 'Protects specific colors or color combinations. Example: Tiffany blue, Cadbury purple.',
                    icon: 'Paintbrush',
                    image: '/images/services/trademark/types/color-mark.svg'
                }
            ]
        },

        fees: {
            title: 'Trademark Registration Fees',
            description: 'Government fees vary based on applicant type and filing method. LawEthic ensures quick, expert filing support.',
            table: [
                {
                    entityType: 'Individuals & Startups',
                    eFiling: '₹4,500 per class',
                    physical: '₹5,000 per class',
                    notes: 'MSME certificate required for reduced fee'
                },
                {
                    entityType: 'Small Enterprises (MSME)',
                    eFiling: '₹4,500 per class',
                    physical: '₹5,000 per class',
                    notes: 'Valid Udyam registration required'
                },
                {
                    entityType: 'Companies & LLPs (Non-MSME)',
                    eFiling: '₹9,000 per class',
                    physical: '₹10,000 per class',
                    notes: 'Standard corporate rate'
                },
                {
                    entityType: 'Foreign Companies',
                    eFiling: '₹9,000 per class',
                    physical: '₹10,000 per class',
                    notes: 'Power of Attorney required'
                }
            ]
        },

        documents: {
            title: 'Documents Required',
            description: 'Documents vary based on applicant type. We help you prepare all required documents.',
            groups: [
                {
                    entityType: 'Individuals & Proprietorship',
                    items: [
                        'Form TM-A (we prepare this)',
                        'Logo copy (if applicable)',
                        'Power of Attorney (Form-48)',
                        'Identity Proof (Aadhaar/PAN/Passport)',
                        'Address Proof (Utility bill/Bank statement)',
                        'User Affidavit (if mark is in use)'
                    ]
                },
                {
                    entityType: 'Partnership Firms',
                    items: [
                        'Form TM-A (we prepare this)',
                        'Logo copy (if applicable)',
                        'Partnership Deed / Registration Certificate',
                        'Identity & Address Proof of Partners',
                        'Power of Attorney (Form-48)',
                        'Partnership PAN Card',
                        'MSME Certificate (optional, for reduced fees)'
                    ]
                },
                {
                    entityType: 'Companies & LLPs',
                    items: [
                        'Form TM-A (we prepare this)',
                        'Certificate of Incorporation / LLP Deed',
                        'Logo copy (if applicable)',
                        'Power of Attorney (Form-48)',
                        'ID & Address Proof of Authorized Signatory',
                        'Company/LLP PAN Card',
                        'Board Resolution for trademark filing',
                        'MSME Certificate (optional, for reduced fees)'
                    ]
                }
            ]
        },

        process: [
            {
                step: 1,
                title: 'Trademark Search',
                description: 'We conduct a comprehensive trademark search to ensure your mark is unique and not already registered.',
                duration: '1 day',
                icon: 'Search'
            },
            {
                step: 2,
                title: 'Vienna Codification',
                description: 'If your trademark includes visual elements or logos, it undergoes Vienna Classification check.',
                duration: 'Same day',
                icon: 'FileCheck'
            },
            {
                step: 3,
                title: 'Application Filing',
                description: 'Our IP lawyers file Form TM-A with the Trademark Registry ensuring all requirements are met.',
                duration: '1-2 days',
                icon: 'FileText'
            },
            {
                step: 4,
                title: 'Formality Check',
                description: 'The Trademark Registrar verifies all submitted details and documents.',
                duration: '1-2 weeks',
                icon: 'ClipboardCheck'
            },
            {
                step: 5,
                title: 'Examination',
                description: 'A trademark officer reviews your application for legal compliance. We help with any objections.',
                duration: '30-60 days',
                icon: 'Scale'
            },
            {
                step: 6,
                title: 'Publication in Journal',
                description: 'Approved trademarks are published in the Trademark Journal for 4 months for public review.',
                duration: '4 months',
                icon: 'Newspaper'
            },
            {
                step: 7,
                title: 'Registration Certificate',
                description: 'If no opposition is filed, you receive your Trademark Registration Certificate valid for 10 years.',
                duration: '6-12 months total',
                icon: 'Award'
            }
        ],

        benefits: {
            title: 'Why Choose LawEthic for Trademark Registration?',
            description: 'We make online trademark registration simple, fast, and reliable.',
            items: [
                {
                    title: 'Expert IP Lawyers',
                    description: 'Our legal team specializes in trademark law, ensuring your application is accurate and efficiently processed.',
                    icon: 'GraduationCap'
                },
                {
                    title: 'Thorough Trademark Search',
                    description: 'We perform comprehensive searches to confirm uniqueness and minimize potential conflicts.',
                    icon: 'Search'
                },
                {
                    title: 'Quick Filing',
                    description: 'Express filing within 6 hours. Get your TM symbol and start protecting your brand immediately.',
                    icon: 'Zap'
                },
                {
                    title: 'Objection Support',
                    description: 'If objections arise, our experts prepare comprehensive responses and represent you at hearings.',
                    icon: 'Shield'
                },
                {
                    title: 'Renewal Reminders',
                    description: 'We send timely reminders before your 10-year renewal date to keep your protection active.',
                    icon: 'Bell'
                },
                {
                    title: 'Complete Support',
                    description: 'From filing to registration certificate, we guide you through the entire process.',
                    icon: 'HeartHandshake'
                }
            ]
        },

        trademarkClasses: {
            title: 'Choosing the Right Trademark Class',
            description: 'India follows the Nice Classification with 45 classes - Classes 1-34 for goods and 35-45 for services.',
            items: [
                { classNumber: 9, name: 'Software & Electronics', description: 'Computer software, mobile apps, electronics' },
                { classNumber: 25, name: 'Clothing', description: 'Clothing, footwear, headgear' },
                { classNumber: 35, name: 'Business Services', description: 'Advertising, business management, retail services' },
                { classNumber: 41, name: 'Education & Entertainment', description: 'Education, training, entertainment, sporting activities' },
                { classNumber: 42, name: 'IT Services', description: 'Scientific services, software development, IT consulting' },
                { classNumber: 43, name: 'Food & Hospitality', description: 'Restaurant, cafe, catering, accommodation services' }
            ]
        },

        postRegistration: {
            title: 'Post-Registration Procedures',
            items: [
                {
                    title: 'Trademark Renewal',
                    description: 'Renew your trademark before expiry (every 10 years) by filing Form TM-R with fees of ₹9,000 per class.'
                },
                {
                    title: 'Trademark Assignment',
                    description: 'Transfer ownership of your trademark to another entity through proper assignment deed and filing.'
                },
                {
                    title: 'Infringement Action',
                    description: 'Take legal action against unauthorized use of your registered trademark for damages and injunctions.'
                }
            ]
        },

        faqs: [
            {
                question: 'What is a trademark?',
                answer: 'A trademark is a form of intellectual property that includes a word, phrase, symbol, design, or combination that identifies and distinguishes your goods or services from others.'
            },
            {
                question: 'How long does trademark registration take?',
                answer: 'The complete process takes 6-12 months in a straightforward case. However, you get TM rights immediately after filing and can use the ™ symbol within 24 hours.'
            },
            {
                question: 'What is the validity of a trademark?',
                answer: 'A registered trademark is valid for 10 years from the date of application. It can be renewed indefinitely for further 10-year periods.'
            },
            {
                question: 'What is the difference between ™ and ®?',
                answer: '™ (trademark) can be used immediately after filing to indicate a pending application. ® (registered) can only be used after your trademark is officially registered.'
            },
            {
                question: 'What is trademark objection?',
                answer: 'A trademark objection is raised by the examiner during review. Our experts help you prepare a comprehensive response to overcome objections.'
            },
            {
                question: 'What is trademark opposition?',
                answer: 'Opposition is filed by third parties within 4 months of journal publication. If opposed, we represent you at hearings to secure your registration.'
            },
            {
                question: 'Can I trademark a logo and name together?',
                answer: 'Yes, you can file them together as a combined mark, or separately for broader protection. We recommend the best approach based on your needs.'
            },
            {
                question: 'What if my trademark is rejected?',
                answer: 'If rejected, we analyze the reasons and help you file an appeal or a fresh application with modifications to improve chances of approval.'
            }
        ],

        relatedServices: ['trademark-objection', 'trademark-renewal', 'copyright-registration']
    },

    // ============================================
    // LICENSES & REGISTRATIONS
    // ============================================

    // UDYAM REGISTRATION
    {
        slug: 'udyam-registration',
        title: 'Udyam Registration',
        shortTitle: 'Udyam Registration',
        category: 'Licenses & Registrations',
        categorySlug: 'licenses-registrations',
        basePrice: 499,
        timeline: '1-2 days',
        badge: 'Free on Govt Portal',

        metaTitle: 'Udyam Registration Online @ ₹499 | MSME Registration | LawEthic',
        metaDescription: 'Get Udyam Registration (MSME) online with expert assistance. Free on government portal. Get your Udyam certificate with permanent registration number in 1-2 days.',
        keywords: ['udyam registration', 'msme registration', 'udyam portal', 'udyam certificate', 'msme certificate'],

        hero: {
            badge: 'Most Popular for MSMEs',
            title: 'Udyam Registration Online',
            description: 'Register your Micro, Small, or Medium Enterprise with expert assistance. Get your Udyam Registration Number and certificate delivered to your email.',
            highlights: [
                'Online Udyam registration done by experts',
                '100% online process with quick filing',
                'Expert support at every step',
                'Permanent Udyam Registration Number'
            ],
            trustSignals: {
                rating: '4.5/5 Google Rating',
                served: '50,000+ MSMEs Registered',
                certified: 'MSME Certified Experts'
            },
            formTitle: 'Register Your MSME!',
            formCta: 'Get Started'
        },

        packages: [
            {
                id: 'basic',
                name: 'Basic',
                price: 499,
                originalPrice: 999,
                discount: '50% off',
                timeline: '2 days',
                featured: false,
                inclusions: [
                    'Udyam Registration Filing',
                    'Document Verification',
                    'Udyam Certificate',
                    'Permanent Registration Number',
                    'Email & WhatsApp Support'
                ],
                exclusions: [
                    'Express processing'
                ]
            },
            {
                id: 'express',
                name: 'Express',
                price: 999,
                originalPrice: 1499,
                discount: '33% off',
                timeline: 'Same day',
                featured: true,
                inclusions: [
                    'Everything in Basic',
                    'Same-day Registration',
                    'Priority Processing',
                    'Dedicated Expert Support',
                    'NIC Code Selection Help'
                ]
            }
        ],

        overview: {
            title: 'What is Udyam Registration?',
            description: `Udyam Registration is a free and paperless process for registering Micro, Small, and Medium Enterprises (MSMEs) in India through the official Udyam portal. It is mandatory for all MSMEs as of 1 July 2020.

Upon successful registration, businesses receive a **permanent identification number**, called the **Udyam Registration Number (URN)**. The Udyam Registration Certificate is sent directly to the registered email ID.

The registration is fully online, requires only **Aadhaar and PAN** for verification, and integrates with Income Tax and GSTIN systems for automatic data fetching.`,
            highlights: [
                'Free and paperless registration process',
                'Permanent identification number for MSMEs',
                'Integrated with Income Tax and GST systems',
                'Only Aadhaar number required for registration',
                'No renewal required - permanent registration',
                'Access to government schemes and subsidies'
            ],
            image: '/images/services/udyam/overview.svg'
        },

        eligibility: {
            title: 'Who Can Apply For Udyam Registration?',
            description: 'Udyam Registration is open to all Micro, Small, and Medium Enterprises (MSMEs) engaged in manufacturing, processing, or providing services.',
            entities: [
                { name: 'Proprietorships', icon: 'User' },
                { name: 'Hindu Undivided Family (HUF)', icon: 'Users' },
                { name: 'Partnership Firms', icon: 'Handshake' },
                { name: 'One-Person Companies (OPCs)', icon: 'User' },
                { name: 'Private Limited Companies', icon: 'Building' },
                { name: 'Limited Companies', icon: 'Building2' },
                { name: 'Producer Companies', icon: 'Factory' },
                { name: 'Limited Liability Partnerships (LLPs)', icon: 'Briefcase' },
                { name: 'Cooperative Societies', icon: 'Users' }
            ]
        },

        types: {
            title: 'MSME Classification Criteria',
            description: 'Businesses must fall under the Micro, Small, or Medium category based on investment in plant & machinery and annual turnover.',
            items: [
                {
                    name: 'Micro Enterprise',
                    description: 'Investment in plant and machinery ≤ ₹1 crore AND annual turnover ≤ ₹5 crore',
                    icon: 'Layers'
                },
                {
                    name: 'Small Enterprise',
                    description: 'Investment in plant and machinery ≤ ₹10 crore AND annual turnover ≤ ₹50 crore',
                    icon: 'TrendingUp'
                },
                {
                    name: 'Medium Enterprise',
                    description: 'Investment in plant and machinery ≤ ₹50 crore AND annual turnover ≤ ₹250 crore',
                    icon: 'Building'
                }
            ]
        },

        fees: {
            title: 'Udyam Registration Fees',
            description: 'Udyam registration is FREE on the official government portal. Professional assistance ensures error-free registration.',
            table: [
                {
                    entityType: 'Government Fee',
                    eFiling: 'FREE',
                    notes: 'No government fee for Udyam registration'
                },
                {
                    entityType: 'Professional Fee (Basic)',
                    eFiling: '₹499',
                    notes: 'Expert-assisted registration with document verification'
                },
                {
                    entityType: 'Professional Fee (Express)',
                    eFiling: '₹999',
                    notes: 'Same-day registration with priority support'
                }
            ]
        },

        documents: {
            title: 'Documents Required for Udyam Registration',
            description: 'Udyam Registration is a simple and paperless process, but requires basic documents.',
            groups: [
                {
                    entityType: 'Proprietorship Firm',
                    items: [
                        'Aadhaar Card of Proprietor',
                        'PAN Card of Enterprise',
                        'GST Number (if registered)',
                        'Bank Account Details',
                        'Business Address'
                    ]
                },
                {
                    entityType: 'Partnership Firm',
                    items: [
                        'Aadhaar Card of Managing Partner',
                        'PAN Card of Firm',
                        'Partnership Deed',
                        'GST Number (if registered)',
                        'Bank Account Details'
                    ]
                },
                {
                    entityType: 'Companies & LLPs',
                    items: [
                        'Aadhaar Card of Authorized Signatory',
                        'PAN Card of Company/LLP',
                        'Certificate of Incorporation',
                        'GST Number (if registered)',
                        'Bank Account Details'
                    ]
                }
            ]
        },

        process: [
            {
                step: 1,
                title: 'Document Collection',
                description: 'Share your Aadhaar, PAN, and business details with our team.',
                duration: '1 hour',
                icon: 'FileText'
            },
            {
                step: 2,
                title: 'Aadhaar Verification',
                description: 'OTP-based Aadhaar authentication on the Udyam portal.',
                duration: '5 minutes',
                icon: 'ShieldCheck'
            },
            {
                step: 3,
                title: 'PAN Validation',
                description: 'PAN details verified from government databases.',
                duration: '5 minutes',
                icon: 'CheckCircle'
            },
            {
                step: 4,
                title: 'Form Submission',
                description: 'Complete enterprise details including NIC code, investment, and turnover.',
                duration: '30 minutes',
                icon: 'Send'
            },
            {
                step: 5,
                title: 'Certificate Generation',
                description: 'Udyam Registration Certificate with URN sent to your email.',
                duration: 'Instant',
                icon: 'Award'
            }
        ],

        benefits: {
            title: 'Benefits of Udyam Registration',
            description: 'Udyam Registration offers a wide range of benefits for MSMEs, helping them access government schemes and financial assistance.',
            items: [
                {
                    title: 'Access to Government Schemes',
                    description: 'Access Credit Linked Capital Subsidy, Credit Guarantee, and Public Procurement Policy schemes.',
                    icon: 'Gift'
                },
                {
                    title: 'Collateral-Free Loans',
                    description: 'Avail collateral-free loans up to ₹5 Crore under CGTMSE scheme at lower interest rates.',
                    icon: 'Banknote'
                },
                {
                    title: 'Reduced Trademark/Patent Fees',
                    description: 'Get 50% discount on trademark and patent registration fees with MSME certificate.',
                    icon: 'BadgePercent'
                },
                {
                    title: 'Priority Sector Lending',
                    description: 'Banks recognize MSMEs under priority sector lending, offering favorable credit terms.',
                    icon: 'TrendingUp'
                },
                {
                    title: 'Protection Against Delayed Payments',
                    description: 'Seek redressal for delayed payments from buyers through MSME tribunals.',
                    icon: 'Shield'
                },
                {
                    title: 'Free ISO Certification',
                    description: 'MSMEs with Udyam registration are eligible for free ISO certification support.',
                    icon: 'Award'
                }
            ]
        },

        faqs: [
            {
                question: 'What is the fee for Udyam Registration?',
                answer: 'Udyam registration is FREE on the official government portal. However, you may choose professional assistance for a smooth, error-free process at ₹499.'
            },
            {
                question: 'Is Udyam Registration mandatory?',
                answer: 'While not mandatory, it is highly recommended as it provides access to government schemes, subsidies, and benefits designed for MSMEs.'
            },
            {
                question: 'What is the validity of Udyam Registration?',
                answer: 'Udyam Registration is permanent and does not require renewal. However, you should update your details annually after filing ITR.'
            },
            {
                question: 'Can I apply without GST registration?',
                answer: 'Yes, GST is not mandatory for Udyam registration unless your business is already GST registered. Service-based businesses with turnover under ₹20 lakh don\'t need GST.'
            },
            {
                question: 'What is Udyam Registration Number (URN)?',
                answer: 'URN is a unique 19-digit identifier assigned to MSMEs upon successful registration. It serves as proof of MSME status for all government benefits.'
            },
            {
                question: 'How is Udyam different from Udyog Aadhaar?',
                answer: 'Udyam replaced Udyog Aadhaar from July 2020. It requires PAN and Aadhaar verification, is more streamlined, and offers better integration with tax systems.'
            }
        ],

        relatedServices: ['msme-registration', 'gst-registration', 'trademark-registration']
    },

    // MSME REGISTRATION
    {
        slug: 'msme-registration',
        title: 'MSME Registration',
        shortTitle: 'MSME Registration',
        category: 'Licenses & Registrations',
        categorySlug: 'licenses-registrations',
        basePrice: 499,
        timeline: '1-2 days',
        badge: null,

        metaTitle: 'MSME Registration Online @ ₹499 | Udyam Certificate | LawEthic',
        metaDescription: 'Get MSME Registration online through Udyam portal. Official government recognition for your business. Access subsidies, schemes, and financial benefits.',
        keywords: ['msme registration', 'msme certificate', 'msme online registration', 'udyam msme', 'small business registration'],

        hero: {
            badge: 'Government Recognition',
            title: 'MSME Registration Online',
            description: 'Give your startup official government recognition through MSME registration. Access schemes, subsidies, and financial benefits designed for small businesses.',
            highlights: [
                'Expert legal help for smooth documentation',
                'Fast, error-free registration process',
                'Access to government schemes and subsidies',
                'Permanent MSME certificate'
            ],
            trustSignals: {
                rating: '4.5/5 Google Rating',
                served: '50,000+ MSMEs Registered',
                certified: 'MSME Certified Experts'
            },
            formTitle: 'Register Your MSME!',
            formCta: 'Get Started'
        },

        packages: [
            {
                id: 'basic',
                name: 'Basic',
                price: 499,
                originalPrice: 999,
                discount: '50% off',
                timeline: '2 days',
                featured: false,
                inclusions: [
                    'MSME/Udyam Registration',
                    'Document Verification',
                    'MSME Certificate',
                    'Permanent Registration Number',
                    'Basic Support'
                ]
            },
            {
                id: 'complete',
                name: 'Complete',
                price: 999,
                originalPrice: 1999,
                discount: '50% off',
                timeline: 'Same day',
                featured: true,
                inclusions: [
                    'Everything in Basic',
                    'Same-day Registration',
                    'NIC Code Selection Help',
                    'GST Registration Support',
                    'Priority Support',
                    'Compliance Guidance'
                ]
            }
        ],

        overview: {
            title: 'What is MSME Registration?',
            description: `MSME stands for **Micro, Small, and Medium Enterprises**. MSME Registration (now called Udyam Registration) provides official government recognition to businesses, enabling them to access various benefits and support programs.

The Ministry of MSME is responsible for formulating rules, regulations, and laws relating to micro, small, and medium enterprises with the goal of promoting economic growth.

Registration is done through the **Udyam portal** using Aadhaar and PAN-based verification. The process is completely **free** on the government portal and provides instant certification.`,
            highlights: [
                'Official government recognition for your business',
                'Access to exclusive MSME schemes and subsidies',
                'Eligibility for priority sector lending',
                'Protection against delayed payments',
                'Reduced fees for trademarks and patents',
                'Easier access to credit and loans'
            ],
            image: '/images/services/msme/overview.svg'
        },

        eligibility: {
            title: 'Who Can Apply for MSME Registration?',
            description: 'Any enterprise meeting the investment and turnover criteria can register as MSME, regardless of business structure.',
            entities: [
                { name: 'Sole Proprietorships', icon: 'User' },
                { name: 'Partnership Firms', icon: 'Handshake' },
                { name: 'Private Limited Companies', icon: 'Building' },
                { name: 'Limited Liability Partnerships', icon: 'Briefcase' },
                { name: 'One Person Companies', icon: 'User' },
                { name: 'Hindu Undivided Families', icon: 'Users' },
                { name: 'Cooperative Societies', icon: 'Users' },
                { name: 'Trusts', icon: 'Heart' }
            ]
        },

        types: {
            title: 'MSME Classification',
            description: 'MSMEs are classified based on investment in plant & machinery and annual turnover.',
            items: [
                {
                    name: 'Micro Enterprise',
                    description: 'Investment up to ₹1 crore AND Turnover up to ₹5 crore. Ideal for startups and small businesses.',
                    icon: 'Sparkles'
                },
                {
                    name: 'Small Enterprise',
                    description: 'Investment up to ₹10 crore AND Turnover up to ₹50 crore. Growing businesses with established operations.',
                    icon: 'TrendingUp'
                },
                {
                    name: 'Medium Enterprise',
                    description: 'Investment up to ₹50 crore AND Turnover up to ₹250 crore. Larger enterprises with significant operations.',
                    icon: 'Building2'
                }
            ]
        },

        documents: {
            title: 'Documents Required for MSME Registration',
            description: 'Simple documentation required for MSME registration through Udyam portal.',
            groups: [
                {
                    entityType: 'All Applicants',
                    items: [
                        'Aadhaar Number of Owner/Partner/Director',
                        'PAN Card of Enterprise',
                        'Business Address Details',
                        'Bank Account Number & IFSC',
                        'NIC 2-digit Code',
                        'Investment Details (Plant/Equipment)',
                        'Turnover Details'
                    ]
                },
                {
                    entityType: 'If Previously Registered',
                    items: [
                        'GST Number (if applicable)',
                        'Previous EM-II or UAM Number',
                        'Sales and Purchase Bill Copies',
                        'Machinery Purchase Bills'
                    ]
                }
            ]
        },

        process: [
            {
                step: 1,
                title: 'Share Documents',
                description: 'Provide Aadhaar, PAN, and business details to our team.',
                duration: '1 hour',
                icon: 'Upload'
            },
            {
                step: 2,
                title: 'Aadhaar OTP Verification',
                description: 'Authenticate using OTP sent to Aadhaar-linked mobile.',
                duration: '5 minutes',
                icon: 'Smartphone'
            },
            {
                step: 3,
                title: 'PAN Verification',
                description: 'Investment and turnover details fetched from IT/GST systems.',
                duration: '5 minutes',
                icon: 'CheckCircle'
            },
            {
                step: 4,
                title: 'Form Submission',
                description: 'Complete details including NIC code and enterprise information.',
                duration: '30 minutes',
                icon: 'FileCheck'
            },
            {
                step: 5,
                title: 'Certificate Issued',
                description: 'MSME Certificate with dynamic QR code sent to email.',
                duration: 'Instant',
                icon: 'Award'
            }
        ],

        benefits: {
            title: 'Benefits of MSME Registration',
            description: 'MSME registration opens doors to various government schemes and financial benefits.',
            items: [
                {
                    title: 'Government Schemes Access',
                    description: 'Access Credit Guarantee, PMEGP, RAMP, and other MSME-focused schemes.',
                    icon: 'Gift'
                },
                {
                    title: 'Easier Credit Access',
                    description: 'Collateral-free loans, lower interest rates, and priority sector lending benefits.',
                    icon: 'CreditCard'
                },
                {
                    title: 'Tax Benefits',
                    description: 'Extended MAT credit for 15 years, excise exemptions, and other tax advantages.',
                    icon: 'Receipt'
                },
                {
                    title: 'Government Tenders Priority',
                    description: 'Preference in government procurement and participation in tenders.',
                    icon: 'FileText'
                },
                {
                    title: 'Dispute Resolution',
                    description: 'Access to MSME tribunals for quick resolution of payment disputes.',
                    icon: 'Scale'
                },
                {
                    title: 'Subsidy Benefits',
                    description: 'Electricity bill subsidies, Industrial Promotion Subsidy, and ISO certification support.',
                    icon: 'BadgePercent'
                }
            ]
        },

        faqs: [
            {
                question: 'Is MSME registration free?',
                answer: 'Yes, MSME/Udyam registration is completely free on the government portal. You only pay for professional assistance if you choose to use our services.'
            },
            {
                question: 'What is the difference between MSME and Udyam?',
                answer: 'MSME and Udyam refer to the same registration. Udyam is the new portal/system introduced in 2020 for MSME registration, replacing the earlier Udyog Aadhaar system.'
            },
            {
                question: 'Is Aadhaar mandatory for MSME registration?',
                answer: 'Yes, Aadhaar is mandatory for identity verification during Udyam registration. The Aadhaar number of the business owner/partner/director is required.'
            },
            {
                question: 'How long is MSME registration valid?',
                answer: 'MSME/Udyam registration is permanent and does not expire. However, annual updation of ITR and GSTR details is recommended.'
            },
            {
                question: 'Can a trading company register for MSME?',
                answer: 'Yes, trading companies can register for MSME by providing business details through the Udyam portal. Both manufacturing and service enterprises are eligible.'
            },
            {
                question: 'What is the NIC code for MSME registration?',
                answer: 'NIC (National Industrial Classification) code is a 6-digit code that categorizes your business activity. We help you select the correct NIC code during registration.'
            }
        ],

        relatedServices: ['udyam-registration', 'gst-registration', 'private-limited-company-registration']
    },

    // FSSAI FOOD LICENSE
    {
        slug: 'fssai-registration',
        title: 'FSSAI Food License Registration',
        shortTitle: 'FSSAI License',
        category: 'Licenses & Registrations',
        categorySlug: 'licenses-registrations',
        basePrice: 1999,
        timeline: '5-7 days',
        badge: 'Food Business Essential',

        metaTitle: 'FSSAI Registration Online @ ₹1999 | Food License in 5 Days | LawEthic',
        metaDescription: 'Get FSSAI Food License online. Registration completed in 5 days. Expert guidance to choose the right license type. 100% online process.',
        keywords: ['fssai registration', 'fssai license', 'food license', 'fssai certificate', 'food business license'],

        hero: {
            badge: 'Food Business Essential',
            title: 'FSSAI Food License Registration',
            description: 'Get your FSSAI food license with expert guidance. We help you choose the right license type based on your business scale and ensure quick registration.',
            highlights: [
                'Expert guidance to choose the right license type',
                'Fast document filing - registration in 5 days',
                'Easy renewal and modification support',
                '100% online process'
            ],
            trustSignals: {
                rating: '4.5/5 Google Rating',
                served: '25,000+ Food Licenses Issued',
                certified: 'FSSAI Certified Experts'
            },
            formTitle: 'Get Your Food License!',
            formCta: 'Get Started'
        },

        packages: [
            {
                id: 'basic-registration',
                name: 'Basic Registration',
                price: 1999,
                originalPrice: 2999,
                discount: '33% off',
                timeline: '7 days',
                featured: false,
                inclusions: [
                    'FSSAI Basic Registration',
                    'Document Preparation',
                    'Application Filing',
                    'Registration Certificate',
                    'Email Support'
                ],
                exclusions: [
                    'Government fees',
                    'State license support'
                ]
            },
            {
                id: 'state-license',
                name: 'State License',
                price: 3999,
                originalPrice: 5999,
                discount: '33% off',
                timeline: '10-15 days',
                featured: true,
                inclusions: [
                    'FSSAI State License Filing',
                    'Document Preparation & Verification',
                    'Application Tracking',
                    'License Certificate',
                    'Dedicated Support',
                    '1-Year Compliance Support'
                ],
                exclusions: [
                    'Government fees (₹2,000-5,000/year)'
                ]
            },
            {
                id: 'central-license',
                name: 'Central License',
                price: 5999,
                originalPrice: 8999,
                discount: '33% off',
                timeline: '15-30 days',
                featured: false,
                inclusions: [
                    'FSSAI Central License Filing',
                    'Complete Document Preparation',
                    'Application & Tracking',
                    'Central License Certificate',
                    'Priority Support',
                    '1-Year Compliance Support'
                ],
                exclusions: [
                    'Government fees (₹7,500/year)'
                ]
            }
        ],

        overview: {
            title: 'What is FSSAI Registration?',
            description: `FSSAI (Food Safety and Standards Authority of India) registration is a mandatory license for anyone involved in the food business in India. It ensures that food products meet safety and quality standards.

Under the **Food Safety and Standards Act, 2006**, all food business operators (FBOs) must obtain FSSAI license or registration before starting operations. The license displays a **14-digit registration number** on food packages.

There are three types of FSSAI licenses based on business scale: **Basic Registration** (for small businesses), **State License** (for medium businesses), and **Central License** (for large businesses and importers/exporters).`,
            highlights: [
                'Mandatory for all food businesses in India',
                'Builds consumer trust and brand credibility',
                'Legal compliance with food safety laws',
                'Required for selling on e-commerce platforms',
                'Enables food export/import business',
                'Protects from legal action and penalties'
            ],
            image: '/images/services/fssai/overview.svg'
        },

        eligibility: {
            title: 'Who Needs FSSAI License?',
            description: 'Any business involved in food-related activities must obtain FSSAI registration or license.',
            entities: [
                { name: 'Food Manufacturers', icon: 'Factory' },
                { name: 'Restaurants & Cafes', icon: 'UtensilsCrossed' },
                { name: 'Food Retailers', icon: 'Store' },
                { name: 'Online Food Sellers', icon: 'Globe' },
                { name: 'Caterers & Cloud Kitchens', icon: 'ChefHat' },
                { name: 'Food Importers/Exporters', icon: 'Truck' },
                { name: 'Food Storage & Warehouses', icon: 'Warehouse' },
                { name: 'Dairy & Bakery Units', icon: 'Milk' }
            ]
        },

        types: {
            title: 'Types of FSSAI License',
            description: 'Choose the right FSSAI license based on your annual turnover and business scale.',
            items: [
                {
                    name: 'Basic Registration',
                    description: 'For small food businesses with annual turnover up to ₹12 lakhs. Includes petty retailers, hawkers, small manufacturers.',
                    icon: 'User'
                },
                {
                    name: 'State License',
                    description: 'For medium businesses with turnover between ₹12 lakhs to ₹20 crores. Includes restaurants, mid-sized manufacturers.',
                    icon: 'Building'
                },
                {
                    name: 'Central License',
                    description: 'For large businesses with turnover above ₹20 crores, importers, exporters, and businesses operating in multiple states.',
                    icon: 'Landmark'
                }
            ]
        },

        fees: {
            title: 'FSSAI License Fees',
            description: 'Government fees vary based on license type and validity period.',
            table: [
                {
                    entityType: 'Basic Registration',
                    eFiling: '₹100/year',
                    notes: 'For turnover up to ₹12 lakhs'
                },
                {
                    entityType: 'State License (1 Year)',
                    eFiling: '₹2,000 - ₹5,000',
                    notes: 'Varies by state and business type'
                },
                {
                    entityType: 'State License (5 Years)',
                    eFiling: '₹10,000 - ₹25,000',
                    notes: 'Multi-year discount available'
                },
                {
                    entityType: 'Central License (1 Year)',
                    eFiling: '₹7,500',
                    notes: 'For turnover above ₹20 crores'
                },
                {
                    entityType: 'Central License (5 Years)',
                    eFiling: '₹37,500',
                    notes: 'Multi-year discount available'
                }
            ]
        },

        documents: {
            title: 'Documents Required for FSSAI License',
            description: 'Documents vary based on the type of FSSAI license and business structure.',
            groups: [
                {
                    entityType: 'Basic Registration',
                    items: [
                        'Photo ID Proof (Aadhaar/Voter ID/PAN)',
                        'Passport Size Photo',
                        'Proof of Business Address',
                        'Declaration Form'
                    ]
                },
                {
                    entityType: 'State & Central License',
                    items: [
                        'Photo ID and Address Proof',
                        'Business Entity Documents (Partnership Deed/COI)',
                        'Food Safety Management Plan',
                        'List of Food Products',
                        'NOC from Local Authority/Municipality',
                        'Proof of Premises (Rent Agreement/Ownership)',
                        'Layout Plan of Premises',
                        'Water Test Report',
                        'List of Equipment & Machinery'
                    ]
                },
                {
                    entityType: 'Additional for Importers',
                    items: [
                        'Import Export Code (IEC) Certificate',
                        'Ministry of Commerce Certificate',
                        'Custom Clearance Documents'
                    ]
                }
            ]
        },

        process: [
            {
                step: 1,
                title: 'License Type Selection',
                description: 'We help you determine the right FSSAI license based on your business scale.',
                duration: '1 day',
                icon: 'Search'
            },
            {
                step: 2,
                title: 'Document Collection',
                description: 'Gather and verify all required documents for your application.',
                duration: '1-2 days',
                icon: 'FileText'
            },
            {
                step: 3,
                title: 'Application Filing',
                description: 'Submit application on FoSCoS portal with all required documents.',
                duration: '1 day',
                icon: 'Upload'
            },
            {
                step: 4,
                title: 'Inspection (if required)',
                description: 'Food safety officer may inspect premises for State/Central license.',
                duration: '7-15 days',
                icon: 'ClipboardCheck'
            },
            {
                step: 5,
                title: 'License Issuance',
                description: 'Receive your FSSAI license certificate with 14-digit number.',
                duration: '5-30 days total',
                icon: 'Award'
            }
        ],

        benefits: {
            title: 'Benefits of FSSAI Registration',
            description: 'FSSAI license provides legal compliance and builds consumer trust for your food business.',
            items: [
                {
                    title: 'Legal Compliance',
                    description: 'Avoid penalties up to ₹5 lakhs and imprisonment for operating without license.',
                    icon: 'Scale'
                },
                {
                    title: 'Consumer Trust',
                    description: 'FSSAI logo on products builds consumer confidence in food safety.',
                    icon: 'Heart'
                },
                {
                    title: 'Business Expansion',
                    description: 'Required for tie-ups with food delivery apps, supermarkets, and e-commerce.',
                    icon: 'TrendingUp'
                },
                {
                    title: 'Import/Export Eligibility',
                    description: 'Central FSSAI license enables import and export of food products.',
                    icon: 'Globe'
                },
                {
                    title: 'Government Tenders',
                    description: 'Mandatory for participating in government food supply tenders.',
                    icon: 'FileText'
                },
                {
                    title: 'Bank Loans',
                    description: 'Banks require FSSAI license for food business loans.',
                    icon: 'CreditCard'
                }
            ]
        },

        faqs: [
            {
                question: 'What is the penalty for not having FSSAI license?',
                answer: 'Operating a food business without FSSAI license can attract penalties up to ₹5 lakhs and imprisonment up to 6 months under the Food Safety Act.'
            },
            {
                question: 'How long is FSSAI license valid?',
                answer: 'FSSAI license can be obtained for 1 to 5 years. You need to renew it before expiry to continue operations legally.'
            },
            {
                question: 'Can I start business while FSSAI application is pending?',
                answer: 'Yes, you can operate using the acknowledgment number until your license is issued. The acknowledgment is valid for 60 days.'
            },
            {
                question: 'Is FSSAI required for home-based food business?',
                answer: 'Yes, even home-based food businesses like tiffin services, home bakers, and pickle sellers need at least Basic FSSAI Registration.'
            },
            {
                question: 'What is FoSCoS portal?',
                answer: 'FoSCoS (Food Safety Compliance System) is the new online portal replacing FLRS for all FSSAI registrations and license applications.'
            },
            {
                question: 'Can I modify my FSSAI license later?',
                answer: 'Yes, you can modify your FSSAI license to add products, change address, or update details through the FoSCoS portal.'
            }
        ],

        relatedServices: ['gst-registration', 'trademark-registration', 'private-limited-company-registration']
    },

    // IEC IMPORT EXPORT CODE
    {
        slug: 'iec-registration',
        title: 'IEC (Import Export Code) Registration',
        shortTitle: 'IEC Code',
        category: 'Licenses & Registrations',
        categorySlug: 'licenses-registrations',
        basePrice: 1499,
        timeline: '2-3 days',
        badge: 'Go Global',

        metaTitle: 'IEC Registration Online @ ₹1499 | Import Export Code in 2 Days | LawEthic',
        metaDescription: 'Get Import Export Code (IEC) registration in 2 days. 100% online process. Expert-assisted filing. Start your import/export business legally.',
        keywords: ['iec registration', 'import export code', 'iec license', 'iec certificate', 'dgft registration'],

        hero: {
            badge: 'Go Global',
            title: 'Import Export Code (IEC) Registration',
            description: 'Get your IEC code and start importing or exporting goods legally. 100% online process with expert assistance. IEC registration completed in 2 days.',
            highlights: [
                'Expert-assisted 100% online IEC Registration',
                'Filing done in 2 days',
                'Go global with end-to-end support',
                '10,000+ businesses served since 2011'
            ],
            trustSignals: {
                rating: '4.5/5 Google Rating',
                served: '10,000+ IEC Registrations',
                certified: 'DGFT Certified Experts'
            },
            formTitle: 'Get Your IEC Code!',
            formCta: 'Get Started'
        },

        packages: [
            {
                id: 'basic',
                name: 'Basic',
                price: 1499,
                originalPrice: 2499,
                discount: '40% off',
                timeline: '3-5 days',
                featured: false,
                inclusions: [
                    'IEC Application Filing',
                    'Document Verification',
                    'DGFT Portal Registration',
                    'IEC Certificate',
                    'Email Support'
                ],
                exclusions: [
                    'Government fees (₹500)',
                    'AD Code Registration'
                ]
            },
            {
                id: 'complete',
                name: 'Complete',
                price: 2999,
                originalPrice: 4999,
                discount: '40% off',
                timeline: '2-3 days',
                featured: true,
                inclusions: [
                    'Everything in Basic',
                    'Priority Processing',
                    'AD Code Registration',
                    'Bank Account Verification',
                    'Dedicated Expert Support',
                    'Export/Import Procedure Guide'
                ],
                exclusions: [
                    'Government fees (₹500)'
                ]
            }
        ],

        overview: {
            title: 'What is Import Export Code (IEC)?',
            description: `Import Export Code (IEC) is a **10-digit unique identification number** issued by the Directorate General of Foreign Trade (DGFT), Ministry of Commerce. It is mandatory for any person or business engaged in import or export of goods and services.

Without IEC, you cannot clear customs for import/export, receive payments from foreign buyers, or send payments to foreign suppliers through banking channels.

IEC registration is a **one-time process** with **lifetime validity**. There is no need for renewal, and the same IEC can be used for multiple products and across multiple branches.`,
            highlights: [
                'Mandatory for all import/export activities',
                'One-time registration with lifetime validity',
                'Required for customs clearance',
                'Enables foreign currency transactions',
                'No renewal required',
                'Can be used across all products and branches'
            ],
            image: '/images/services/iec/overview.svg'
        },

        eligibility: {
            title: 'Who Can Apply for IEC Code?',
            description: 'Any person or business entity engaged in import or export can apply for IEC.',
            entities: [
                { name: 'Sole Proprietorships', icon: 'User' },
                { name: 'Partnership Firms', icon: 'Handshake' },
                { name: 'Private Limited Companies', icon: 'Building' },
                { name: 'Public Limited Companies', icon: 'Landmark' },
                { name: 'Limited Liability Partnerships', icon: 'Briefcase' },
                { name: 'Hindu Undivided Families', icon: 'Users' },
                { name: 'Trusts & Societies', icon: 'Heart' },
                { name: 'Individuals', icon: 'User' }
            ]
        },

        types: {
            title: 'Types of IEC Registration',
            description: 'IEC is a single code for all import/export activities, but usage varies based on business type.',
            items: [
                {
                    name: 'Goods Import/Export',
                    description: 'For businesses importing or exporting physical goods like electronics, textiles, machinery, etc.',
                    icon: 'Package'
                },
                {
                    name: 'Services Export',
                    description: 'For IT companies, consultants, and service providers receiving foreign currency payments.',
                    icon: 'Globe'
                },
                {
                    name: 'E-commerce Export',
                    description: 'For sellers on Amazon Global, eBay, or other international e-commerce platforms.',
                    icon: 'ShoppingCart'
                }
            ]
        },

        fees: {
            title: 'IEC Registration Fees',
            description: 'IEC registration has a nominal government fee with our professional assistance.',
            table: [
                {
                    entityType: 'Government Fee',
                    eFiling: '₹500',
                    notes: 'One-time fee for IEC registration'
                },
                {
                    entityType: 'Professional Fee (Basic)',
                    eFiling: '₹1,499',
                    notes: 'Document verification and filing'
                },
                {
                    entityType: 'Professional Fee (Complete)',
                    eFiling: '₹2,999',
                    notes: 'Includes AD Code registration'
                },
                {
                    entityType: 'IEC Modification',
                    eFiling: '₹999',
                    notes: 'For any changes in IEC details'
                }
            ]
        },

        documents: {
            title: 'Documents Required for IEC Registration',
            description: 'Documents vary based on business structure. We help prepare all required documents.',
            groups: [
                {
                    entityType: 'Proprietorship',
                    items: [
                        'PAN Card of Proprietor',
                        'Aadhaar Card',
                        'Passport Size Photo',
                        'Cancelled Cheque or Bank Certificate',
                        'Address Proof (Electricity Bill/Rent Agreement)',
                        'Digital Signature Certificate (Class 2)'
                    ]
                },
                {
                    entityType: 'Partnership Firm',
                    items: [
                        'PAN Card of Firm',
                        'Partnership Deed',
                        'Partners\' Aadhaar & PAN Cards',
                        'Cancelled Cheque or Bank Certificate',
                        'Office Address Proof',
                        'Digital Signature of Authorized Partner'
                    ]
                },
                {
                    entityType: 'Companies & LLPs',
                    items: [
                        'PAN Card of Company/LLP',
                        'Certificate of Incorporation',
                        'MOA & AOA / LLP Agreement',
                        'Director/Partner ID & Address Proof',
                        'Cancelled Cheque or Bank Certificate',
                        'Board Resolution for IEC Application',
                        'Digital Signature of Authorized Signatory'
                    ]
                }
            ]
        },

        process: [
            {
                step: 1,
                title: 'Document Collection',
                description: 'Submit required documents including PAN, Aadhaar, and bank details.',
                duration: '1 day',
                icon: 'Upload'
            },
            {
                step: 2,
                title: 'DGFT Registration',
                description: 'Create account on DGFT portal and verify email/mobile.',
                duration: '1 hour',
                icon: 'UserPlus'
            },
            {
                step: 3,
                title: 'Application Filing',
                description: 'File IEC application with all required documents on DGFT portal.',
                duration: '1 day',
                icon: 'FileText'
            },
            {
                step: 4,
                title: 'Payment & Verification',
                description: 'Pay government fee and application is verified by DGFT.',
                duration: '1-2 days',
                icon: 'CheckCircle'
            },
            {
                step: 5,
                title: 'IEC Certificate Issued',
                description: 'Download IEC certificate from DGFT portal. Valid for lifetime.',
                duration: '2-3 days total',
                icon: 'Award'
            }
        ],

        benefits: {
            title: 'Benefits of IEC Registration',
            description: 'IEC code opens doors to international trade and global business opportunities.',
            items: [
                {
                    title: 'Legal Import/Export',
                    description: 'Import and export goods legally through Indian customs.',
                    icon: 'Truck'
                },
                {
                    title: 'Lifetime Validity',
                    description: 'One-time registration with no renewal required.',
                    icon: 'Infinity'
                },
                {
                    title: 'Global Business',
                    description: 'Expand your business to international markets.',
                    icon: 'Globe'
                },
                {
                    title: 'Foreign Currency',
                    description: 'Receive payments in foreign currency through banking channels.',
                    icon: 'DollarSign'
                },
                {
                    title: 'Government Benefits',
                    description: 'Access export incentives and DGFT schemes.',
                    icon: 'Gift'
                },
                {
                    title: 'E-commerce Export',
                    description: 'Sell on Amazon Global, eBay, and other international platforms.',
                    icon: 'ShoppingCart'
                }
            ]
        },

        faqs: [
            {
                question: 'Is IEC mandatory for import/export?',
                answer: 'Yes, IEC is mandatory for importing or exporting goods. However, it\'s not required for personal effects or goods exempted under Foreign Trade Policy.'
            },
            {
                question: 'What is the validity of IEC?',
                answer: 'IEC has lifetime validity. Once obtained, you don\'t need to renew it. However, you must update any changes in business details.'
            },
            {
                question: 'Can I apply for IEC online?',
                answer: 'Yes, IEC registration is 100% online through the DGFT portal. We handle the entire process for you digitally.'
            },
            {
                question: 'How long does IEC registration take?',
                answer: 'IEC registration typically takes 2-3 working days if all documents are in order. Express processing is also available.'
            },
            {
                question: 'What is AD Code Registration?',
                answer: 'AD (Authorized Dealer) Code is a 14-digit code obtained from your bank, required for customs clearance. We help with AD Code registration in our Complete package.'
            },
            {
                question: 'Can I use one IEC for multiple products?',
                answer: 'Yes, a single IEC can be used for importing/exporting any number of products. There\'s no restriction on product categories.'
            },
            {
                question: 'Is GST registration required for IEC?',
                answer: 'GST registration is not mandatory for IEC. However, if you\'re already GST registered, you need to link your GST number with IEC.'
            },
            {
                question: 'Can I modify my IEC details?',
                answer: 'Yes, you can modify IEC details like address, bank account, or authorized person through the DGFT portal. We assist with modifications.'
            }
        ],

        relatedServices: ['gst-registration', 'private-limited-company-registration', 'fssai-registration']
    }
]

/**
 * Get a service by slug
 */
export function getServiceBySlug(slug: string): Service | undefined {
    return SERVICES.find(s => s.slug === slug)
}

/**
 * Get all services
 */
export function getAllServices(): Service[] {
    return SERVICES
}

/**
 * Get all service slugs (for static generation)
 */
export function getAllServiceSlugs(): string[] {
    return SERVICES.map(s => s.slug)
}

/**
 * Get services by category
 */
export function getServicesByCategory(categorySlug: string): Service[] {
    return SERVICES.filter(s => s.categorySlug === categorySlug)
}

/**
 * Get related services
 */
export function getRelatedServices(slug: string): Service[] {
    const service = getServiceBySlug(slug)
    if (!service?.relatedServices) return []

    return service.relatedServices
        .map(s => getServiceBySlug(s))
        .filter((s): s is Service => s !== undefined)
}
