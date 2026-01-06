/**
 * UNIFIED SERVICES REGISTRY
 * ===========================
 *
 * All services are defined in this single file.
 * To add a new service, simply add an object to the SERVICES array.
 *
 * The URL will be: /services/{slug}
 * Example: /services/trademark-registration
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
            rating?: string
            served?: string
            certified?: string
            secure?: string
            fast?: string
            support?: string
        }
        // Lead form configuration
        formTitle?: string
        formCta?: string
        // Stats section
        stats?: {
            count?: string
            countLabel?: string
            rating?: string
            ratingLabel?: string
            timeline?: string
            timelineLabel?: string
        }
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

    // Onboarding flow questions (1-3 questions max)
    onboardingQuestions?: {
        id: string
        question: string
        type: 'single' | 'multiple'
        options: { value: string; label: string }[]
        required: boolean
    }[]
}

/**
 * ALL SERVICES
 * Add new services here - that's it!
 */
export const SERVICES: Service[] = [
    // ============================================
    // TRADEMARK REGISTRATION
    // ============================================
    {
        slug: 'trademark-registration',
        title: 'Trademark Registration',
        shortTitle: 'Trademark',
        category: 'Trademark & IP',
        categorySlug: 'trademark-registration',
        basePrice: 1299,
        timeline: '3-5 working days',
        badge: 'Brand Protection',

        metaTitle: 'Trademark Registration Online @ ₹1299 | Protect Your Brand | LawEthic',
        metaDescription: 'Register your trademark in India. Protect your brand, logo, and name. Expert filing. 10-year protection with renewal option.',
        keywords: ['trademark registration', 'brand registration', 'logo trademark', 'tm registration india'],

        hero: {
            badge: 'Protect Your Brand',
            title: 'Trademark Registration Online in India',
            description: 'Protect your brand name, logo, and tagline with expert trademark registration. 10-year protection starting at ₹1,299 + govt fees.',
            highlights: [
                'Trademark filing starts at ₹1,299 + govt fees',
                'Senior IP lawyer conducts thorough trademark search',
                'Expert consultation included',
                'Status monitoring & objection support'
            ],
            trustSignals: {
                secure: '100% Online Process',
                fast: 'Quick Processing',
                support: 'Expert Support'
            },
            formTitle: 'Register Your Trademark!',
            formCta: 'Get Started'
        },

        packages: [
            {
                id: 'basic',
                name: 'Basic',
                price: 1299,
                originalPrice: 1999,
                discount: '35% off',
                timeline: '3-5 working days',
                featured: false,
                inclusions: [
                    'Trademark search',
                    'Expert consultation',
                    'TM-A filing',
                    'Status monitoring'
                ],
                exclusions: [
                    'Government fees (₹4,500 for individuals/MSME)',
                    'Objection handling'
                ]
            },
            {
                id: 'combo',
                name: 'Combo',
                price: 2099,
                originalPrice: 2999,
                discount: '30% off',
                timeline: '3-5 working days',
                featured: false,
                inclusions: [
                    'Word mark + Device mark filing',
                    'Trademark search',
                    'TM-A filing for both marks',
                    'Status monitoring'
                ],
                exclusions: [
                    'Government fees (₹4,500 per mark for individuals/MSME)',
                    'Objection handling'
                ]
            },
            {
                id: 'standard',
                name: 'Standard',
                price: 2299,
                originalPrice: 3499,
                discount: '34% off',
                timeline: '3-5 working days',
                featured: true,
                inclusions: [
                    'Trademark search',
                    'Expert consultation',
                    'TM-A filing',
                    'Objection reply drafting',
                    'Multiple objection handling',
                    'Status monitoring'
                ],
                exclusions: [
                    'Government fees (₹4,500 for individuals/MSME)'
                ]
            },
            {
                id: 'premium',
                name: 'Premium',
                price: 4599,
                originalPrice: 6999,
                discount: '34% off',
                timeline: '3-5 working days',
                featured: false,
                emiAvailable: true,
                inclusions: [
                    'Complete trademark registration',
                    'Trademark search & consultation',
                    'TM-A filing',
                    'Objection reply drafting',
                    'Multiple objection handling',
                    'Hearing representation',
                    'Multiple hearings support',
                    'Dedicated expert support'
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
        title: 'Udyam/MSME Registration',
        shortTitle: 'Udyam/MSME',
        category: 'Licenses & Registrations',
        categorySlug: 'licenses-registrations',
        basePrice: 199,
        timeline: '1-2 days',
        badge: 'Free on Govt Portal',

        metaTitle: 'Udyam/MSME Registration Online @ ₹199 | LawEthic',
        metaDescription: 'Get Udyam/MSME Registration online with expert assistance. Free on government portal. Get your Udyam certificate with permanent registration number in 1-2 days.',
        keywords: ['udyam registration', 'msme registration', 'udyam portal', 'udyam certificate', 'msme certificate'],

        hero: {
            badge: 'Most Popular for MSMEs',
            title: 'Udyam/MSME Registration Online',
            description: 'Register your Micro, Small, or Medium Enterprise with expert assistance. Get your Udyam Registration Number and certificate delivered to your email.',
            highlights: [
                'Online Udyam registration done by experts',
                '100% online process with quick filing',
                'Expert support at every step',
                'Permanent Udyam Registration Number'
            ],
            trustSignals: {
                secure: '100% Online Process',
                fast: 'Quick Processing',
                support: 'Expert Support'
            },
            formTitle: 'Register Your MSME!',
            formCta: 'Get Started'
        },

        packages: [
            {
                id: 'basic',
                name: 'Udyam/MSME Registration',
                price: 199,
                originalPrice: 499,
                discount: '60% off',
                timeline: '1-2 days',
                featured: true,
                inclusions: [
                    'Udyam Registration Filing',
                    'Document Verification',
                    'Udyam Certificate',
                    'Permanent Registration Number',
                    'Expert Support'
                ],
                exclusions: []
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

        relatedServices: ['fssai-registration', 'trademark-registration']
    },

    // FSSAI FOOD LICENSE
    {
        slug: 'fssai-registration',
        title: 'FSSAI Food License Registration',
        shortTitle: 'FSSAI License',
        category: 'Licenses & Registrations',
        categorySlug: 'licenses-registrations',
        basePrice: 1299,
        timeline: '7-10 days',
        badge: 'Food Business Essential',

        metaTitle: 'FSSAI Registration Online @ ₹1299 | Food License | LawEthic',
        metaDescription: 'Get FSSAI Food License online. Basic registration from ₹1,299. Expert guidance to choose the right license type. 100% online process.',
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
                secure: '100% Online Process',
                fast: 'Quick Processing',
                support: 'Expert Support'
            },
            formTitle: 'Get Your Food License!',
            formCta: 'Get Started'
        },

        packages: [
            {
                id: 'basic-registration',
                name: 'Basic Registration',
                price: 1299,
                originalPrice: 1999,
                discount: '35% off',
                timeline: '7-10 working days',
                featured: false,
                inclusions: [
                    '14-digit FSSAI registration',
                    'Documentation & filing',
                    'Application tracking',
                    'Expert support till certificate issuance'
                ],
                exclusions: [
                    'State/Central license support'
                ]
            },
            {
                id: 'state-license',
                name: 'State License',
                price: 1999,
                originalPrice: 2999,
                discount: '33% off',
                timeline: '20-25 working days',
                featured: true,
                inclusions: [
                    'State FSSAI license (1-year validity)',
                    'Complete documentation & filing',
                    'Follow-ups with department',
                    'Expert consultation',
                    'For turnover ₹12 Lakhs - ₹20 Crores'
                ],
                exclusions: [
                    'Government fees (₹2,000-5,000/year)'
                ]
            },
            {
                id: 'central-license',
                name: 'Central License',
                price: 3999,
                originalPrice: 5999,
                discount: '33% off',
                timeline: '~1 month',
                featured: false,
                inclusions: [
                    'Central FSSAI license',
                    'Mandatory for import/export',
                    'Dedicated compliance expert',
                    'End-to-end handling',
                    'For large businesses & multi-state operations'
                ],
                exclusions: [
                    'Government fees (₹7,500 + 18% GST/year)'
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

        relatedServices: ['trademark-registration', 'udyam-registration'],

        onboardingQuestions: [
            {
                id: 'license_type',
                question: 'What type of license are you looking for?',
                type: 'single',
                options: [
                    { value: 'new', label: 'New Registration' },
                    { value: 'renewal', label: 'Renewal' },
                    { value: 'modification', label: 'Modification' }
                ],
                required: true
            },
            {
                id: 'annual_turnover',
                question: "What's your annual turnover?",
                type: 'single',
                options: [
                    { value: 'below_12l', label: 'Less than 12 lakhs' },
                    { value: '12l_20cr', label: '12 lakhs - 20 crores' },
                    { value: 'above_20cr', label: 'More than 20 crores' }
                ],
                required: true
            }
        ]
    },

    // IEC IMPORT EXPORT CODE
    {
        slug: 'iec-registration',
        title: 'IEC (Import Export Code) Registration',
        shortTitle: 'IEC Code',
        category: 'Licenses & Registrations',
        categorySlug: 'licenses-registrations',
        basePrice: 1699,
        timeline: '2-5 days',
        badge: 'Go Global',

        metaTitle: 'IEC Registration Online @ ₹1699 | Import Export Code | LawEthic',
        metaDescription: 'Get Import Export Code (IEC) registration in 2-5 days. 100% online process. Expert-assisted filing. Start your import/export business legally.',
        keywords: ['iec registration', 'import export code', 'iec license', 'iec certificate', 'dgft registration'],

        hero: {
            badge: 'Go Global',
            title: 'Import Export Code (IEC) Registration',
            description: 'Get your IEC code and start importing or exporting goods legally. 100% online process with expert assistance. Lifetime validity - no renewal required.',
            highlights: [
                'Expert-assisted 100% online IEC Registration',
                'Filing done in 2-5 working days',
                'Lifetime validity - no renewal required',
                'Required for customs clearance & foreign remittances'
            ],
            trustSignals: {
                secure: '100% Online Process',
                fast: 'Quick Processing',
                support: 'Expert Support'
            },
            formTitle: 'Get Your IEC Code!',
            formCta: 'Get Started'
        },

        packages: [
            {
                id: 'standard',
                name: 'IEC Registration',
                price: 1699,
                originalPrice: 2499,
                discount: '32% off',
                timeline: '2-5 working days',
                featured: true,
                inclusions: [
                    'IEC application preparation',
                    'Documentation assistance',
                    'Online filing on DGFT portal',
                    'PAN-based IEC',
                    'Tracking & follow-ups',
                    'Expert support till issuance'
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

        relatedServices: ['fssai-registration', 'udyam-registration', 'trademark-registration'],

        onboardingQuestions: [
            {
                id: 'registration_type',
                question: 'What do you need?',
                type: 'single',
                options: [
                    { value: 'new', label: 'New IEC Registration' },
                    { value: 'modification', label: 'IEC Modification' },
                    { value: 'ad_code', label: 'AD Code Registration' }
                ],
                required: true
            },
            {
                id: 'business_type',
                question: 'What is your business type?',
                type: 'single',
                options: [
                    { value: 'proprietorship', label: 'Proprietorship' },
                    { value: 'partnership', label: 'Partnership Firm' },
                    { value: 'company', label: 'Private Limited Company' },
                    { value: 'llp', label: 'LLP' }
                ],
                required: true
            }
        ]
    },

    // ============================================
    // TRADE LICENSE
    // ============================================
    {
        slug: 'trade-license',
        title: 'Trade License Registration',
        shortTitle: 'Trade License',
        category: 'Licenses & Registrations',
        categorySlug: 'licenses-registrations',
        basePrice: 3599,
        timeline: '7-15 days',
        badge: 'Essential for Business',

        metaTitle: 'Trade License Registration Online @ ₹3599 | LawEthic',
        metaDescription: 'Get your Trade License from Municipal Corporation with expert assistance. Complete documentation support, fast processing in 7-15 days. 100% online process.',
        keywords: ['trade license', 'trade license registration', 'municipal license', 'business license', 'shop license', 'trade permit'],

        hero: {
            badge: 'Essential for Business',
            title: 'Trade License Registration @ ₹3599',
            description: 'Get your Trade License from the Municipal Corporation with expert assistance. We handle complete documentation and filing to ensure quick approval.',
            highlights: [
                'Expert assistance with Form-353',
                'Complete documentation support',
                'Fast processing in 7-12 days',
                'Renewal & modification support'
            ],
            trustSignals: {
                secure: '100% Online Process',
                fast: 'Quick Processing',
                support: 'Expert Support'
            },
            formTitle: 'Get Your Trade License!',
            formCta: 'Get Started'
        },

        packages: [
            {
                id: 'standard',
                name: 'Trade License Registration',
                price: 3599,
                originalPrice: 4999,
                discount: '28% off',
                timeline: '7-15 working days',
                featured: true,
                inclusions: [
                    'Application preparation',
                    'Documentation support',
                    'Online filing',
                    'Regular follow-ups',
                    'Status tracking',
                    'Expert support'
                ],
                exclusions: [
                    'Government fees (as applicable)'
                ]
            }
        ],

        overview: {
            title: 'What is Trade License?',
            description: `A **Trade License** is a legal certificate issued by the local Municipal Corporation or Municipal Authority that permits businesses to operate within a specific area or jurisdiction.

Under the **Municipal Corporation Act**, every business establishment must obtain a Trade License before commencing operations. This license certifies that the business follows all safety, health, and environmental regulations set by the local authority.

The Trade License ensures that businesses don't engage in any practices that might endanger the health, safety, or well-being of local residents. It must be **renewed annually** (typically between January 1 to March 31) to remain valid.`,
            highlights: [
                'Mandatory for all business establishments',
                'Legal permission to operate a business',
                'Ensures compliance with local regulations',
                'Must be displayed at business premises',
                'Annual renewal required',
                'Protects from penalties and closure'
            ],
            image: '/images/services/trade-license/overview.svg'
        },

        eligibility: {
            title: 'Who Needs a Trade License?',
            description: 'Any business or commercial activity operating within municipal limits requires a Trade License.',
            entities: [
                { name: 'Shops & Retail Stores', icon: 'Store' },
                { name: 'Restaurants & Hotels', icon: 'UtensilsCrossed' },
                { name: 'Manufacturing Units', icon: 'Factory' },
                { name: 'Healthcare Facilities', icon: 'Hospital' },
                { name: 'Entertainment Venues', icon: 'Ticket' },
                { name: 'Transport Services', icon: 'Truck' },
                { name: 'Construction Companies', icon: 'Building2' },
                { name: 'Street Vendors & Hawkers', icon: 'ShoppingCart' }
            ]
        },

        types: {
            title: 'Types of Trade License',
            description: 'Trade licenses are categorized based on the nature of business activity.',
            items: [
                {
                    name: 'Type A - Food Establishments',
                    description: 'Required for all food service establishments including restaurants, cafes, bakeries, and food processing units.',
                    icon: 'UtensilsCrossed'
                },
                {
                    name: 'Type B - Manufacturing Units',
                    description: 'For manufacturing and processing units where machines and electricity are used, such as milling units and factories.',
                    icon: 'Factory'
                },
                {
                    name: 'Type C - High-Risk Activities',
                    description: 'For high-risk activities including manufacture of fireworks, explosives, chemicals, and hazardous materials.',
                    icon: 'AlertTriangle'
                }
            ]
        },

        fees: {
            title: 'Trade License Fees',
            description: 'Government fees vary based on the type of business, area, and municipal corporation.',
            table: [
                {
                    entityType: 'Small Shops (< 500 sq ft)',
                    eFiling: '₹500 - ₹2,000/year',
                    notes: 'Varies by city/municipality'
                },
                {
                    entityType: 'Medium Establishments',
                    eFiling: '₹2,000 - ₹5,000/year',
                    notes: 'Based on area and nature of business'
                },
                {
                    entityType: 'Large Commercial Units',
                    eFiling: '₹5,000 - ₹25,000/year',
                    notes: 'Based on turnover and area'
                },
                {
                    entityType: 'Manufacturing Units',
                    eFiling: '₹3,000 - ₹20,000/year',
                    notes: 'Based on machinery and production'
                },
                {
                    entityType: 'High-Risk Activities',
                    eFiling: '₹10,000 - ₹50,000/year',
                    notes: 'Includes additional clearances'
                }
            ]
        },

        documents: {
            title: 'Documents Required for Trade License',
            description: 'Documents required vary based on business type and entity structure.',
            groups: [
                {
                    entityType: 'For All Applicants',
                    items: [
                        'Completed Form-353',
                        'Photo ID Proof (Aadhaar/PAN/Voter ID)',
                        'Passport Size Photographs',
                        'Property Ownership Proof or Rent Agreement',
                        'NOC from Property Owner',
                        'Property Tax Receipts'
                    ]
                },
                {
                    entityType: 'For Companies & LLPs',
                    items: [
                        'Memorandum of Association (MoA)',
                        'Article of Association (AoA)',
                        'Certificate of Incorporation',
                        'Board Resolution',
                        'GST Registration Certificate',
                        'Income Tax Returns'
                    ]
                },
                {
                    entityType: 'For Partnership Firms',
                    items: [
                        'Partnership Deed',
                        'Income Tax Returns',
                        'Property Tax Receipt',
                        'Rental Agreement/Lease Deed',
                        'Previous Trade License (if renewal)'
                    ]
                },
                {
                    entityType: 'Additional Clearances (if applicable)',
                    items: [
                        'NOC from Fire Department',
                        'NOC from Pollution Control Board',
                        'Food NOC (for food businesses)',
                        'Drug NOC (for pharmaceutical)',
                        'Building Plan Approval'
                    ]
                }
            ]
        },

        process: [
            {
                step: 1,
                title: 'Application Preparation',
                description: 'Complete Form-353 and gather all required documents based on your business type.',
                duration: '1-2 days',
                icon: 'FileText'
            },
            {
                step: 2,
                title: 'Document Submission',
                description: 'Submit application with documents to the Municipal Corporation along with required fees.',
                duration: '1 day',
                icon: 'Upload'
            },
            {
                step: 3,
                title: 'Site Inspection',
                description: 'Municipal inspector visits your business premises to verify compliance with regulations.',
                duration: '3-5 days',
                icon: 'ClipboardCheck'
            },
            {
                step: 4,
                title: 'License Approval',
                description: 'Upon successful inspection, the Trade License is approved and issued.',
                duration: '2-4 days',
                icon: 'Award'
            }
        ],

        benefits: {
            title: 'Benefits of Trade License',
            description: 'Trade License provides multiple advantages for your business.',
            items: [
                {
                    title: 'Legal Entity Status',
                    description: 'Trade license establishes your business as a legal entity, recognized by government authorities.',
                    icon: 'Scale'
                },
                {
                    title: 'Business Credibility',
                    description: 'Builds trust with customers, vendors, and financial institutions. Essential for business loans and partnerships.',
                    icon: 'Shield'
                },
                {
                    title: 'Compliance Assurance',
                    description: 'Ensures your business complies with local health, safety, and environmental regulations.',
                    icon: 'CheckCircle'
                },
                {
                    title: 'Avoid Penalties',
                    description: 'Operating without a trade license can result in heavy fines, penalties, or business closure.',
                    icon: 'AlertCircle'
                },
                {
                    title: 'Government Recognition',
                    description: 'Enables participation in government tenders and access to various business schemes.',
                    icon: 'Building'
                },
                {
                    title: 'Bank Account & Loans',
                    description: 'Required for opening business bank accounts and applying for business loans.',
                    icon: 'CreditCard'
                }
            ]
        },

        faqs: [
            {
                question: 'What is a Trade License?',
                answer: 'A Trade License is a legal permit issued by the local Municipal Corporation that allows businesses to operate within a specific area. It certifies that the business complies with local rules, health, and safety regulations.'
            },
            {
                question: 'Is Trade License mandatory for all businesses?',
                answer: 'Yes, any business operating within municipal limits must obtain a Trade License. Operating without one can result in penalties, fines, or even closure of the business.'
            },
            {
                question: 'How long is a Trade License valid?',
                answer: 'A Trade License is typically valid for one year and must be renewed annually. The renewal period is usually between January 1 and March 31.'
            },
            {
                question: 'What is Form-353?',
                answer: 'Form-353 is the standard application form used to apply for a Trade License from the Municipal Corporation. It contains details about the business, premises, and applicant.'
            },
            {
                question: 'What happens if I don\'t renew my Trade License?',
                answer: 'Failure to renew your Trade License can result in penalties, fines, and legal action. The municipal authority may also shut down your business for non-compliance.'
            },
            {
                question: 'Can I apply for Trade License online?',
                answer: 'Yes, most municipal corporations now allow online Trade License applications through their official portals. We can assist you with the complete online filing process.'
            },
            {
                question: 'How long does it take to get a Trade License?',
                answer: 'Trade License is typically issued within 7-12 days after application submission, depending on the municipal corporation and completion of site inspection.'
            },
            {
                question: 'What is the cost of Trade License registration?',
                answer: 'Government fees vary based on the city, type of business, area of premises, and nature of activity. Fees typically range from ₹500 to ₹50,000 per year.'
            },
            {
                question: 'Do I need separate licenses for multiple locations?',
                answer: 'Yes, you need to obtain a separate Trade License for each business location as the license is specific to the premises address.'
            },
            {
                question: 'Can Trade License be revoked?',
                answer: 'Yes, the municipal authority can revoke a Trade License if the business violates terms of the license, endangers public health/safety, or fails to comply with regulations.'
            }
        ],

        relatedServices: ['fssai-registration', 'shop-establishment-registration', 'udyam-registration'],

        onboardingQuestions: [
            {
                id: 'city',
                question: 'In which city is your business located?',
                type: 'single',
                options: [
                    { value: 'delhi', label: 'Delhi' },
                    { value: 'mumbai', label: 'Mumbai' },
                    { value: 'bangalore', label: 'Bangalore' },
                    { value: 'chennai', label: 'Chennai' },
                    { value: 'kolkata', label: 'Kolkata' },
                    { value: 'hyderabad', label: 'Hyderabad' },
                    { value: 'pune', label: 'Pune' },
                    { value: 'other', label: 'Other City' }
                ],
                required: true
            },
            {
                id: 'businessType',
                question: 'What type of business do you operate?',
                type: 'single',
                options: [
                    { value: 'retail', label: 'Retail Shop' },
                    { value: 'restaurant', label: 'Restaurant/Food Business' },
                    { value: 'manufacturing', label: 'Manufacturing Unit' },
                    { value: 'services', label: 'Service Business' },
                    { value: 'healthcare', label: 'Healthcare Facility' },
                    { value: 'other', label: 'Other' }
                ],
                required: true
            },
            {
                id: 'entityType',
                question: 'What is your business entity type?',
                type: 'single',
                options: [
                    { value: 'proprietorship', label: 'Proprietorship' },
                    { value: 'partnership', label: 'Partnership Firm' },
                    { value: 'company', label: 'Private Limited Company' },
                    { value: 'llp', label: 'LLP' }
                ],
                required: true
            }
        ]
    },

    // ============================================
    // GST REGISTRATION
    // ============================================
    {
        slug: 'gst-registration',
        title: 'GST Registration',
        shortTitle: 'GST',
        category: 'Tax & Compliance',
        categorySlug: 'tax-compliance',
        basePrice: 399,
        timeline: '2-5 working days',
        badge: 'Tax Compliant',

        metaTitle: 'GST Registration Online @ ₹399 | Get GSTIN in 2-5 Days | LawEthic',
        metaDescription: 'Apply for GST registration online. Get your GSTIN number quickly with expert assistance. 100% online process, affordable pricing, and dedicated support.',
        keywords: ['gst registration', 'gstin number', 'gst certificate', 'online gst registration', 'gst registration india', 'goods and services tax'],

        hero: {
            badge: 'Mandatory for Business',
            title: 'GST Registration Online – Get Your GSTIN',
            description: 'Get your GST registration done quickly and hassle-free. Apply online for GSTIN and unlock Input Tax Credit, e-commerce selling, and pan-India business expansion.',
            highlights: [
                'GST registration starting at just ₹399',
                'Expert-assisted document preparation',
                'ARN generated within 24-48 hours',
                'Complete compliance support included'
            ],
            trustSignals: {
                secure: '100% Online Process',
                fast: 'Quick GSTIN Delivery',
                support: 'Expert Support'
            },
            formTitle: 'Apply for GST Registration',
            formCta: 'Get Started'
        },

        packages: [
            {
                id: 'basic',
                name: 'Basic',
                price: 399,
                originalPrice: 699,
                discount: '43% off',
                timeline: '3-5 working days',
                featured: false,
                inclusions: [
                    'GST application filing',
                    'Document preparation assistance',
                    'ARN generation',
                    'GST Certificate delivery',
                    'Basic compliance guidance'
                ],
                exclusions: [
                    'GST return filing',
                    'Objection handling'
                ]
            },
            {
                id: 'standard',
                name: 'Standard',
                price: 1699,
                originalPrice: 2499,
                discount: '32% off',
                timeline: '2-3 working days',
                featured: true,
                inclusions: [
                    'Priority GST application filing',
                    'Complete document preparation',
                    'ARN generation within 24 hours',
                    'GST Certificate delivery',
                    'Query/objection handling',
                    '3 months GST return filing (GSTR-1 & 3B)',
                    'Dedicated expert support'
                ],
                exclusions: [
                    'Transactions beyond 100/month'
                ]
            },
            {
                id: 'premium',
                name: 'Premium',
                price: 2999,
                originalPrice: 4499,
                discount: '33% off',
                timeline: '1-2 working days',
                featured: false,
                emiAvailable: true,
                inclusions: [
                    'Express GST registration',
                    'Complete document preparation',
                    'ARN generation same day',
                    'GST Certificate delivery',
                    'Query/objection handling',
                    '12 months GST return filing (GSTR-1 & 3B)',
                    'MSME/Udyam registration included',
                    'Accounting software license (1 year)',
                    'Dedicated account manager',
                    'Priority support'
                ],
                exclusions: [
                    'Transactions beyond 300/month'
                ]
            }
        ],

        overview: {
            title: 'What is GST Registration?',
            description: `**Goods and Services Tax (GST)** is India's unified indirect tax system that replaced multiple taxes like VAT, Service Tax, and Excise Duty. GST registration is mandatory for businesses with annual turnover exceeding the threshold limit.

Once registered, you receive a unique **15-digit GSTIN (GST Identification Number)** that allows you to collect GST from customers, claim Input Tax Credit (ITC), and conduct interstate business seamlessly.

GST registration is essential for:
- **E-commerce sellers** – Mandatory regardless of turnover
- **Interstate suppliers** – For selling across state borders
- **Claiming Input Tax Credit** – Reduce tax liability
- **Business credibility** – Builds trust with customers and vendors`,
            highlights: [
                'Single tax system across India',
                'Claim Input Tax Credit on purchases',
                'Sell on e-commerce platforms',
                'Interstate business made easy',
                'Enhanced business credibility',
                'Access to government tenders'
            ]
        },

        eligibility: {
            title: 'Who Needs GST Registration?',
            description: 'GST registration is mandatory in the following cases:',
            entities: [
                { name: 'Turnover > ₹40 lakhs (Goods)', icon: 'TrendingUp' },
                { name: 'Turnover > ₹20 lakhs (Services)', icon: 'Briefcase' },
                { name: 'Interstate Suppliers', icon: 'Truck' },
                { name: 'E-commerce Sellers', icon: 'ShoppingCart' },
                { name: 'Casual Taxable Persons', icon: 'Calendar' },
                { name: 'Input Service Distributors', icon: 'GitBranch' },
                { name: 'TDS/TCS Deductors', icon: 'Receipt' },
                { name: 'Agents of Suppliers', icon: 'Users' }
            ]
        },

        types: {
            title: 'Types of GST Registration',
            description: 'Different types of GST registration are available based on business requirements:',
            items: [
                {
                    name: 'Regular GST Registration',
                    description: 'For businesses with turnover above threshold limits. Allows charging GST and claiming ITC.',
                    icon: 'Building'
                },
                {
                    name: 'Composition Scheme',
                    description: 'For small businesses with turnover up to ₹1.5 crore. Pay tax at fixed rate without ITC benefit.',
                    icon: 'Package'
                },
                {
                    name: 'Casual Taxable Person',
                    description: 'For occasional suppliers with no fixed place of business. Valid for 90 days, extendable.',
                    icon: 'Calendar'
                },
                {
                    name: 'Non-Resident Taxable Person',
                    description: 'For foreign businesses supplying goods/services in India without a permanent establishment.',
                    icon: 'Globe'
                },
                {
                    name: 'Input Service Distributor',
                    description: 'For businesses distributing ITC of input services to branches/units.',
                    icon: 'GitBranch'
                },
                {
                    name: 'E-commerce Operator',
                    description: 'Mandatory for platforms facilitating supply of goods/services through electronic commerce.',
                    icon: 'ShoppingBag'
                }
            ]
        },

        fees: {
            title: 'GST Registration Fees',
            description: 'Government fees for GST registration is NIL. You only pay our professional service charges.',
            table: [
                {
                    entityType: 'Government Fees',
                    eFiling: 'NIL',
                    notes: 'GST registration is free on govt portal'
                },
                {
                    entityType: 'Our Service Fees',
                    eFiling: 'From ₹399',
                    notes: 'Expert assistance & documentation'
                },
                {
                    entityType: 'Digital Signature (if required)',
                    eFiling: '₹800-1500',
                    notes: 'Required for companies & LLPs'
                }
            ]
        },

        documents: {
            title: 'Documents Required for GST Registration',
            description: 'Documents vary based on your business type. We help you prepare everything.',
            groups: [
                {
                    entityType: 'Proprietorship',
                    items: [
                        'PAN Card of Proprietor',
                        'Aadhaar Card of Proprietor',
                        'Passport size photograph',
                        'Bank account statement/Cancelled cheque',
                        'Electricity bill/Rent agreement of business premises',
                        'NOC from landlord (if rented)'
                    ]
                },
                {
                    entityType: 'Partnership Firm / LLP',
                    items: [
                        'PAN Card of Firm/LLP',
                        'Partnership Deed / LLP Agreement',
                        'PAN & Aadhaar of all Partners',
                        'Passport size photographs of Partners',
                        'Bank account details of Firm',
                        'Address proof of business premises',
                        'NOC from landlord (if rented)',
                        'Board Resolution/Authorization letter'
                    ]
                },
                {
                    entityType: 'Private Limited / Public Company',
                    items: [
                        'PAN Card of Company',
                        'Certificate of Incorporation',
                        'MOA & AOA',
                        'PAN & Aadhaar of all Directors',
                        'Passport size photographs of Directors',
                        'Bank account details of Company',
                        'Address proof of registered office',
                        'NOC from landlord (if rented)',
                        'Board Resolution for GST registration',
                        'Digital Signature Certificate (DSC)'
                    ]
                }
            ]
        },

        process: [
            {
                step: 1,
                title: 'Document Collection',
                description: 'Share your documents through our secure portal. Our experts verify and prepare them for filing.',
                duration: 'Day 1',
                icon: 'FileText'
            },
            {
                step: 2,
                title: 'Application Filing',
                description: 'We file your GST application (Form GST REG-01) on the official GST portal with accurate details.',
                duration: 'Day 1-2',
                icon: 'Send'
            },
            {
                step: 3,
                title: 'ARN Generation',
                description: 'Application Reference Number (ARN) is generated. You can track status using this number.',
                duration: 'Day 2',
                icon: 'Hash'
            },
            {
                step: 4,
                title: 'Verification',
                description: 'GST officer verifies your application. We handle any queries or additional document requests.',
                duration: 'Day 2-4',
                icon: 'CheckCircle'
            },
            {
                step: 5,
                title: 'GSTIN Issued',
                description: 'Upon approval, your GSTIN and GST Registration Certificate are issued. We deliver both to you.',
                duration: 'Day 3-5',
                icon: 'Award'
            }
        ],

        benefits: {
            title: 'Benefits of GST Registration',
            description: 'Why you should register for GST:',
            items: [
                {
                    title: 'Input Tax Credit',
                    description: 'Claim credit on taxes paid for business purchases, reducing overall tax liability.',
                    icon: 'PiggyBank'
                },
                {
                    title: 'Interstate Business',
                    description: 'Sell goods and services across state borders without any restrictions.',
                    icon: 'Truck'
                },
                {
                    title: 'E-commerce Access',
                    description: 'Sell on Amazon, Flipkart, and other platforms. GSTIN is mandatory.',
                    icon: 'ShoppingCart'
                },
                {
                    title: 'Business Credibility',
                    description: 'GST registration builds trust with customers, vendors, and financial institutions.',
                    icon: 'Shield'
                },
                {
                    title: 'Government Tenders',
                    description: 'GSTIN is often required to participate in government tenders and contracts.',
                    icon: 'FileCheck'
                },
                {
                    title: 'Loan Eligibility',
                    description: 'Banks prefer GST-registered businesses for loans and credit facilities.',
                    icon: 'CreditCard'
                }
            ]
        },

        faqs: [
            {
                question: 'What is the threshold limit for GST registration?',
                answer: 'For goods suppliers, the threshold is ₹40 lakhs annual turnover (₹20 lakhs for special category states). For service providers, it is ₹20 lakhs (₹10 lakhs for special category states). E-commerce sellers need registration regardless of turnover.'
            },
            {
                question: 'How long does GST registration take?',
                answer: 'GST registration typically takes 2-5 working days from application submission. With our premium plan, you can get it done in 1-2 days with expedited processing.'
            },
            {
                question: 'Is GST registration free?',
                answer: 'Yes, the government does not charge any fees for GST registration. You only pay our professional service charges for expert assistance and documentation support.'
            },
            {
                question: 'Can I register for GST without a business address?',
                answer: 'No, a valid business address with proof (rent agreement/electricity bill) is mandatory. If you work from home, you can use your residential address with proper documentation.'
            },
            {
                question: 'What is GSTIN?',
                answer: 'GSTIN is a 15-digit unique identification number assigned to every GST-registered business. It contains state code, PAN, entity number, and check digit.'
            },
            {
                question: 'Do I need GST registration to sell on Amazon/Flipkart?',
                answer: 'Yes, GST registration is mandatory for selling on e-commerce platforms like Amazon, Flipkart, Meesho, etc., regardless of your turnover.'
            },
            {
                question: 'What happens if I dont register for GST?',
                answer: 'Operating without GST registration when required attracts penalty of ₹10,000 or 10% of tax due (whichever is higher). Continued non-compliance can lead to prosecution.'
            },
            {
                question: 'Can I cancel my GST registration?',
                answer: 'Yes, you can apply for GST cancellation if you stop business operations, turnover falls below threshold, or business is transferred/merged. File Form GST REG-16 for cancellation.'
            }
        ],

        relatedServices: ['gst-return-filing', 'udyam-registration', 'trade-license'],

        onboardingQuestions: [
            {
                id: 'turnover',
                question: 'What is your expected annual turnover?',
                type: 'single',
                options: [
                    { value: 'below20', label: 'Below ₹20 lakhs' },
                    { value: '20to40', label: '₹20 lakhs - ₹40 lakhs' },
                    { value: '40to1cr', label: '₹40 lakhs - ₹1 crore' },
                    { value: 'above1cr', label: 'Above ₹1 crore' }
                ],
                required: true
            },
            {
                id: 'entityType',
                question: 'What is your business entity type?',
                type: 'single',
                options: [
                    { value: 'proprietorship', label: 'Proprietorship' },
                    { value: 'partnership', label: 'Partnership Firm' },
                    { value: 'llp', label: 'LLP' },
                    { value: 'company', label: 'Private Limited Company' }
                ],
                required: true
            },
            {
                id: 'reason',
                question: 'Why do you need GST registration?',
                type: 'single',
                options: [
                    { value: 'ecommerce', label: 'To sell on e-commerce platforms' },
                    { value: 'interstate', label: 'For interstate business' },
                    { value: 'threshold', label: 'Crossed turnover threshold' },
                    { value: 'itc', label: 'To claim Input Tax Credit' },
                    { value: 'other', label: 'Other reason' }
                ],
                required: true
            }
        ]
    },

    // ============================================
    // GST RETURN FILING
    // ============================================
    {
        slug: 'gst-return-filing',
        title: 'GST Return Filing',
        shortTitle: 'GST Filing',
        category: 'Tax & Compliance',
        categorySlug: 'tax-compliance',
        basePrice: 799,
        timeline: 'Monthly/Quarterly',
        badge: 'Stay Compliant',

        metaTitle: 'GST Return Filing Online @ ₹799 | GSTR-1, GSTR-3B Filing | LawEthic',
        metaDescription: 'File your GST returns online with expert assistance. Timely GSTR-1 & GSTR-3B filing, avoid penalties, maximize ITC claims. Affordable pricing from ₹799.',
        keywords: ['gst return filing', 'gstr-1 filing', 'gstr-3b filing', 'gst compliance', 'gst filing online', 'monthly gst return'],

        hero: {
            badge: 'Stay Compliant',
            title: 'GST Return Filing – GSTR-1 & GSTR-3B',
            description: 'Never miss a GST deadline again. Our experts file your GSTR-1 & GSTR-3B returns accurately and on time, helping you avoid penalties and maximize Input Tax Credit.',
            highlights: [
                'GST return filing starting at ₹799',
                'Timely filing before deadlines',
                'ITC reconciliation & optimization',
                'Dedicated expert for your account'
            ],
            trustSignals: {
                secure: 'Secure Data Handling',
                fast: 'On-time Filing',
                support: 'Expert Support'
            },
            formTitle: 'Start GST Filing',
            formCta: 'Get Started'
        },

        packages: [
            {
                id: 'quarterly',
                name: 'Quarterly',
                price: 799,
                originalPrice: 1199,
                discount: '33% off',
                timeline: '3 months',
                featured: false,
                inclusions: [
                    'GSTR-1 filing (3 months)',
                    'GSTR-3B filing (3 months)',
                    'Up to 100 transactions/month',
                    'ITC reconciliation',
                    'Basic compliance support',
                    'Email support'
                ],
                exclusions: [
                    'GSTR-9 annual return',
                    'GST audit support'
                ]
            },
            {
                id: 'annual',
                name: 'Annual',
                price: 2499,
                originalPrice: 3599,
                discount: '31% off',
                timeline: '12 months',
                featured: true,
                inclusions: [
                    'GSTR-1 filing (12 months)',
                    'GSTR-3B filing (12 months)',
                    'Up to 300 transactions/month',
                    'ITC reconciliation & optimization',
                    'Turnover up to ₹20 lakhs',
                    'Accounting software license (1 year)',
                    'Dedicated account manager',
                    'Phone & email support'
                ],
                exclusions: [
                    'GSTR-9 annual return'
                ]
            },
            {
                id: 'premium',
                name: 'Premium',
                price: 3999,
                originalPrice: 5999,
                discount: '33% off',
                timeline: '12 months',
                featured: false,
                emiAvailable: true,
                inclusions: [
                    'GSTR-1 filing (12 months)',
                    'GSTR-3B filing (12 months)',
                    'GSTR-9 annual return filing',
                    'Up to 500 transactions/month',
                    'Turnover up to ₹50 lakhs',
                    'ITC reconciliation & optimization',
                    'ITR filing for one financial year',
                    'Accounting software license (1 year)',
                    'Dedicated senior accountant',
                    'Priority phone support',
                    'GST notice assistance'
                ],
                exclusions: []
            }
        ],

        overview: {
            title: 'What is GST Return Filing?',
            description: `**GST Return Filing** is the process of submitting periodic reports of sales, purchases, and tax payments to the GST authorities. Every GST-registered business must file returns regardless of business activity.

The main returns to be filed are:
- **GSTR-1**: Details of outward supplies (sales) – filed monthly or quarterly
- **GSTR-3B**: Summary return with tax payment – filed monthly
- **GSTR-9**: Annual return – filed yearly

Timely GST filing ensures you:
- Avoid late fees and penalties
- Maintain ITC eligibility
- Keep your GST registration active
- Build compliant business records`,
            highlights: [
                'Avoid penalties up to ₹10,000/month',
                'Maintain Input Tax Credit eligibility',
                'Prevent GST registration cancellation',
                'Build credible business records',
                'Required for loan applications',
                'Mandatory for e-commerce sellers'
            ]
        },

        types: {
            title: 'Types of GST Returns',
            description: 'Different GST returns serve different purposes:',
            items: [
                {
                    name: 'GSTR-1',
                    description: 'Monthly/quarterly return for outward supplies (sales). Due by 11th of next month (monthly) or end of month following quarter.',
                    icon: 'FileOutput'
                },
                {
                    name: 'GSTR-3B',
                    description: 'Monthly summary return with tax payment. Self-declaration of sales, ITC, and tax liability. Due by 20th of next month.',
                    icon: 'FileText'
                },
                {
                    name: 'GSTR-9',
                    description: 'Annual return consolidating all monthly/quarterly returns. Due by 31st December of next financial year.',
                    icon: 'Calendar'
                },
                {
                    name: 'GSTR-4',
                    description: 'Annual return for composition scheme dealers. Simplified return with fixed tax rate payment.',
                    icon: 'Package'
                },
                {
                    name: 'GSTR-9C',
                    description: 'Reconciliation statement for businesses with turnover above ₹5 crore. Filed along with GSTR-9.',
                    icon: 'GitCompare'
                },
                {
                    name: 'GSTR-2A/2B',
                    description: 'Auto-populated returns showing ITC available from suppliers. Used for reconciliation.',
                    icon: 'FileInput'
                }
            ]
        },

        fees: {
            title: 'GST Return Filing Fees & Penalties',
            description: 'Late filing attracts significant penalties. File on time with our expert assistance.',
            table: [
                {
                    entityType: 'Late Fee - GSTR-1',
                    eFiling: '₹50/day (₹20 for nil return)',
                    notes: 'Maximum ₹10,000 per return'
                },
                {
                    entityType: 'Late Fee - GSTR-3B',
                    eFiling: '₹50/day (₹20 for nil return)',
                    notes: 'Maximum ₹10,000 per return'
                },
                {
                    entityType: 'Interest on Late Tax Payment',
                    eFiling: '18% per annum',
                    notes: 'Calculated on outstanding tax'
                },
                {
                    entityType: 'Our Service Fee',
                    eFiling: 'From ₹799',
                    notes: 'For 3 months filing'
                }
            ]
        },

        documents: {
            title: 'Information Required for GST Filing',
            description: 'Keep these details ready for hassle-free GST return filing:',
            groups: [
                {
                    entityType: 'Sales Information',
                    items: [
                        'Sales invoices with customer GSTIN',
                        'B2C sales summary (sales to consumers)',
                        'Credit/debit notes issued',
                        'Advances received',
                        'Export invoices (if any)',
                        'E-commerce sales data'
                    ]
                },
                {
                    entityType: 'Purchase Information',
                    items: [
                        'Purchase invoices with supplier GSTIN',
                        'Import bills of entry',
                        'Credit/debit notes received',
                        'Expense invoices (rent, utilities, services)',
                        'Capital goods purchases',
                        'Reverse charge transactions'
                    ]
                },
                {
                    entityType: 'Other Details',
                    items: [
                        'GST portal login credentials',
                        'Previous return copies',
                        'Bank statements for reconciliation',
                        'HSN/SAC codes for products/services',
                        'E-way bills generated (if any)'
                    ]
                }
            ]
        },

        process: [
            {
                step: 1,
                title: 'Data Collection',
                description: 'Share your sales and purchase data through our secure portal or accounting software integration.',
                duration: 'Day 1-3',
                icon: 'Upload'
            },
            {
                step: 2,
                title: 'Data Verification',
                description: 'Our experts verify invoices, reconcile with GSTR-2A/2B, and identify ITC mismatches.',
                duration: 'Day 4-5',
                icon: 'CheckCircle'
            },
            {
                step: 3,
                title: 'Return Preparation',
                description: 'We prepare GSTR-1 and GSTR-3B with accurate categorization and tax calculations.',
                duration: 'Day 6-8',
                icon: 'FileText'
            },
            {
                step: 4,
                title: 'Review & Approval',
                description: 'You review the prepared returns. We make any necessary corrections before filing.',
                duration: 'Day 9-10',
                icon: 'Eye'
            },
            {
                step: 5,
                title: 'Filing & Confirmation',
                description: 'Returns filed on GST portal. You receive ARN and filing confirmation.',
                duration: 'Before deadline',
                icon: 'Send'
            }
        ],

        benefits: {
            title: 'Why Choose LawEthic for GST Filing?',
            description: 'Benefits of our GST return filing service:',
            items: [
                {
                    title: 'Never Miss Deadlines',
                    description: 'We track all due dates and file your returns before deadlines, avoiding penalties.',
                    icon: 'Clock'
                },
                {
                    title: 'Maximize ITC Claims',
                    description: 'Expert reconciliation ensures you claim maximum eligible Input Tax Credit.',
                    icon: 'PiggyBank'
                },
                {
                    title: 'Error-Free Filing',
                    description: 'Thorough verification prevents errors that could lead to notices or penalties.',
                    icon: 'ShieldCheck'
                },
                {
                    title: 'Dedicated Expert',
                    description: 'Get a dedicated accountant who understands your business and handles all GST matters.',
                    icon: 'UserCheck'
                },
                {
                    title: 'Compliance Reports',
                    description: 'Monthly reports on your GST compliance status, ITC utilization, and tax liability.',
                    icon: 'BarChart'
                },
                {
                    title: 'Notice Support',
                    description: 'If you receive any GST notice, we help draft responses and resolve issues.',
                    icon: 'FileWarning'
                }
            ]
        },

        faqs: [
            {
                question: 'What is the due date for GSTR-1 filing?',
                answer: 'For monthly filers, GSTR-1 is due by the 11th of the following month. For quarterly filers (turnover up to ₹5 crore), it is due by the 13th of the month following the quarter.'
            },
            {
                question: 'What is the due date for GSTR-3B filing?',
                answer: 'GSTR-3B is due by the 20th of the following month for most businesses. For businesses with turnover up to ₹5 crore in certain states, staggered dates of 22nd or 24th apply.'
            },
            {
                question: 'What happens if I file GST returns late?',
                answer: 'Late filing attracts a late fee of ₹50 per day (₹20 for nil returns) up to ₹10,000 per return. Additionally, 18% interest per annum applies on unpaid tax. Continuous non-filing can lead to GST registration cancellation.'
            },
            {
                question: 'Can I file nil GST return?',
                answer: 'Yes, if you have no sales or purchases in a month, you still need to file a nil return. Non-filing of nil returns also attracts late fees.'
            },
            {
                question: 'What is ITC reconciliation?',
                answer: 'ITC reconciliation is matching your purchase records with GSTR-2A/2B (supplier-reported data) to ensure you claim only eligible Input Tax Credit. Mismatches can lead to ITC denial.'
            },
            {
                question: 'Do I need to file GSTR-9 annual return?',
                answer: 'GSTR-9 is mandatory for all regular taxpayers. However, businesses with turnover up to ₹2 crore can opt out. For turnover above ₹5 crore, GSTR-9C reconciliation is also required.'
            },
            {
                question: 'Can you handle GST filing for multiple GSTINs?',
                answer: 'Yes, we can manage GST filing for businesses with multiple GSTINs (different states or verticals). Contact us for custom pricing based on the number of registrations.'
            },
            {
                question: 'What if I receive a GST notice?',
                answer: 'Our premium plan includes GST notice assistance. We help analyze the notice, prepare appropriate responses, and represent your case if needed.'
            }
        ],

        relatedServices: ['gst-registration', 'udyam-registration', 'trade-license'],

        onboardingQuestions: [
            {
                id: 'filingFrequency',
                question: 'What is your GST filing frequency?',
                type: 'single',
                options: [
                    { value: 'monthly', label: 'Monthly (GSTR-1 & 3B)' },
                    { value: 'quarterly', label: 'Quarterly (QRMP scheme)' },
                    { value: 'composition', label: 'Composition Scheme' },
                    { value: 'notSure', label: 'Not sure' }
                ],
                required: true
            },
            {
                id: 'transactions',
                question: 'How many transactions do you have per month?',
                type: 'single',
                options: [
                    { value: 'below50', label: 'Below 50' },
                    { value: '50to100', label: '50-100' },
                    { value: '100to300', label: '100-300' },
                    { value: 'above300', label: 'Above 300' }
                ],
                required: true
            },
            {
                id: 'currentStatus',
                question: 'Are your previous GST returns filed?',
                type: 'single',
                options: [
                    { value: 'allFiled', label: 'Yes, all returns filed' },
                    { value: 'pending', label: 'Some returns pending' },
                    { value: 'newRegistration', label: 'New GST registration' }
                ],
                required: true
            }
        ]
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
