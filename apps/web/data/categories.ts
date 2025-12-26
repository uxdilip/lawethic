import { CategoryHubData } from '@/types/service'

export const CATEGORIES: Record<string, CategoryHubData> = {
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
