import { CategoryHubData } from '@/types/service'

export const CATEGORIES: Record<string, CategoryHubData> = {
    'company-registration': {
        slug: 'company-registration',
        title: 'Company Registration Services in India',
        description: 'Choose the right business structure for your venture. We help you register your company with expert guidance and complete compliance support.',

        hero: {
            title: 'Register Your Company in India',
            description: 'Choose from Private Limited, LLP, OPC, Partnership, and more. Expert assistance for hassle-free company registration with complete compliance support.',
            image: '/images/company-registration-hero.jpg'
        },

        whyChoose: [
            {
                title: 'Expert Guidance',
                description: 'CA & CS professionals help you choose the right business structure based on your needs',
                icon: 'Users'
            },
            {
                title: 'Fast Processing',
                description: 'Get your company registered in as little as 8-14 days with our expedited service',
                icon: 'Zap'
            },
            {
                title: 'Complete Compliance',
                description: 'All government registrations, PAN, TAN, and statutory documents included',
                icon: 'Shield'
            },
            {
                title: '100% Online',
                description: 'Entire process handled online. No need to visit government offices',
                icon: 'Globe'
            }
        ],

        stats: [
            { label: 'Companies Registered', value: '100,000+' },
            { label: 'Success Rate', value: '98%' },
            { label: 'Average Timeline', value: '14 days' },
            { label: 'Expert CAs', value: '50+' }
        ],

        faqs: [
            {
                question: 'Which company type should I choose?',
                answer: 'It depends on your business needs. Private Limited is ideal for startups seeking funding. LLP is great for professional services. OPC suits solo entrepreneurs. Partnership works for 2+ partners. We provide free consultation to help you decide.'
            },
            {
                question: 'What is the difference between Private Limited and LLP?',
                answer: 'Private Limited offers easier funding options and better credibility but has stricter compliance. LLP has lower compliance requirements and is tax-efficient for partners but may face challenges in raising funds from investors.'
            },
            {
                question: 'How much does company registration cost?',
                answer: 'Our professional fees start at ₹999. Government fees vary: ₹4,000-8,000 for Private Limited, ₹500 for LLP name + ₹500 for incorporation, ₹500-1,000 for Partnership. Total cost depends on the structure you choose.'
            },
            {
                question: 'Can I register a company from home?',
                answer: 'Yes, absolutely! The entire process is 100% online. You can register your company from anywhere in India. We handle all paperwork and government filings digitally.'
            },
            {
                question: 'What are the compliance requirements after registration?',
                answer: 'Private Limited: Annual returns, financial statements, board meetings, AGM. LLP: Annual filings, financial statements. Partnership: Income tax returns. OPC: Similar to Private Limited with some relaxations. We offer compliance packages to help you stay compliant.'
            }
        ]
    },

    'gst-registration': {
        slug: 'gst-registration',
        title: 'GST Registration & Compliance Services',
        description: 'Register for GST online and stay compliant with GST return filing services. Expert assistance for hassle-free GST registration.',

        hero: {
            title: 'GST Registration & Return Filing',
            description: 'Get your GSTIN in 3-5 days. Complete GST registration and compliance services with expert CA support.',
            image: '/images/gst-registration-hero.jpg'
        },

        whyChoose: [
            {
                title: 'Quick Registration',
                description: 'Get your GSTIN in just 3-5 working days',
                icon: 'Clock'
            },
            {
                title: 'Expert Filing',
                description: 'CA-assisted GST return filing with zero errors',
                icon: 'Award'
            },
            {
                title: 'Compliance Support',
                description: 'Reminders for due dates and ongoing compliance support',
                icon: 'Bell'
            },
            {
                title: 'Affordable Pricing',
                description: 'Transparent pricing with no hidden costs',
                icon: 'DollarSign'
            }
        ],

        stats: [
            { label: 'GST Registrations', value: '50,000+' },
            { label: 'Returns Filed', value: '500,000+' },
            { label: 'Client Satisfaction', value: '99%' },
            { label: 'Average Timeline', value: '3 days' }
        ],

        faqs: [
            {
                question: 'Who needs GST registration?',
                answer: 'GST registration is mandatory if your annual turnover exceeds ₹40 lakhs (₹20 lakhs for services in special category states). It\'s also required for inter-state supply, e-commerce sellers, and certain specified businesses regardless of turnover.'
            },
            {
                question: 'What documents are required for GST registration?',
                answer: 'You need PAN card, Aadhaar card, business address proof, bank account details, business registration certificate (if applicable), and photographs of proprietor/partners/directors.'
            },
            {
                question: 'How long does GST registration take?',
                answer: 'Typically 3-5 working days if all documents are in order. The process may take longer if there are queries from the GST officer.'
            },
            {
                question: 'What are GST return filing requirements?',
                answer: 'Regular taxpayers must file GSTR-1 (monthly), GSTR-3B (monthly), and annual return GSTR-9. Composition scheme taxpayers file quarterly GSTR-4.'
            }
        ]
    },

    'trademark-registration': {
        slug: 'trademark-registration',
        title: 'Trademark Registration & IP Protection',
        description: 'Protect your brand with trademark registration. Expert trademark search, filing, and prosecution services.',

        hero: {
            title: 'Protect Your Brand with Trademark Registration',
            description: 'Register your trademark and secure your brand identity. Expert trademark search and filing services.',
            image: '/images/trademark-registration-hero.jpg'
        },

        whyChoose: [
            {
                title: 'Comprehensive Search',
                description: 'Thorough trademark search to avoid objections',
                icon: 'Search'
            },
            {
                title: 'Expert Filing',
                description: 'Trademark attorneys handle your application',
                icon: 'FileText'
            },
            {
                title: 'Objection Handling',
                description: 'We respond to objections and opposition',
                icon: 'Shield'
            },
            {
                title: '10-Year Protection',
                description: 'Valid for 10 years, renewable indefinitely',
                icon: 'Award'
            }
        ],

        stats: [
            { label: 'Trademarks Filed', value: '25,000+' },
            { label: 'Success Rate', value: '95%' },
            { label: 'Objections Cleared', value: '90%' },
            { label: 'Average Timeline', value: '45 days' }
        ],

        faqs: [
            {
                question: 'What can be registered as a trademark?',
                answer: 'You can register words, logos, symbols, slogans, sounds, or a combination of these that uniquely identifies your goods or services. It should be distinctive and not generic or descriptive.'
            },
            {
                question: 'How long does trademark registration take?',
                answer: 'The filing process takes 1-2 days. Government examination takes 12-18 months. If there are no objections, you receive registration certificate in 18-24 months from filing date.'
            },
            {
                question: 'What is a trademark class?',
                answer: 'Trademarks are categorized into 45 classes (34 for goods, 11 for services). You must select the class(es) relevant to your business. Each class requires separate filing and fees.'
            },
            {
                question: 'Can I use TM or ® symbol?',
                answer: 'You can use ™ symbol immediately after filing your application. The ® symbol can only be used after your trademark is registered.'
            }
        ]
    },

    'licenses-registrations': {
        slug: 'licenses-registrations',
        title: 'Licenses & Registrations Services',
        description: 'Get essential business licenses and registrations including MSME/Udyam, FSSAI, Import Export Code (IEC), and more. Expert assistance for seamless compliance.',

        hero: {
            title: 'Business Licenses & Registrations',
            description: 'From MSME/Udyam registration to FSSAI food license and Import Export Code, we help you get all essential licenses for your business with expert guidance.',
            image: '/images/licenses-registrations-hero.jpg'
        },

        whyChoose: [
            {
                title: 'Quick Processing',
                description: 'Get your licenses in the shortest possible time with our expedited processing',
                icon: 'Zap'
            },
            {
                title: 'Expert Guidance',
                description: 'CA & Legal professionals guide you through the entire process',
                icon: 'Users'
            },
            {
                title: '100% Online',
                description: 'Complete the entire process from home without visiting any government office',
                icon: 'Globe'
            },
            {
                title: 'Compliance Support',
                description: 'Ongoing support for renewals and compliance requirements',
                icon: 'Shield'
            }
        ],

        stats: [
            { label: 'Licenses Obtained', value: '50,000+' },
            { label: 'Success Rate', value: '99%' },
            { label: 'Average Timeline', value: '5 days' },
            { label: 'Expert Team', value: '30+' }
        ],

        faqs: [
            {
                question: 'What is Udyam/MSME Registration?',
                answer: 'Udyam Registration is the government\'s online portal for registering Micro, Small, and Medium Enterprises (MSMEs). It replaced the earlier Udyog Aadhaar system and provides a unique permanent identification number to businesses.'
            },
            {
                question: 'Who needs FSSAI Food License?',
                answer: 'Any business involved in food manufacturing, processing, packaging, storage, distribution, or sale needs FSSAI registration or license. The type of license depends on turnover and scale of operations.'
            },
            {
                question: 'What is IEC Code and who needs it?',
                answer: 'Import Export Code (IEC) is a 10-digit unique identification number issued by DGFT. It is mandatory for any business or individual engaged in import or export of goods and services in India.'
            },
            {
                question: 'How long does it take to get these licenses?',
                answer: 'Udyam registration is instant. FSSAI basic registration takes 7-10 days. IEC registration typically takes 3-5 working days. Timelines may vary based on documentation completeness.'
            },
            {
                question: 'What are the benefits of MSME registration?',
                answer: 'MSME registration provides access to government schemes, subsidies, lower interest rates on loans, priority sector lending, protection against delayed payments, and reduced trademark/patent fees.'
            }
        ]
    }
}
