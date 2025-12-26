import { QuestionnaireTemplate } from './types';

/**
 * TRADEMARK REGISTRATION QUESTIONNAIRE
 * Based on the standard trademark questionnaire format
 */
export const trademarkQuestionnaire: QuestionnaireTemplate = {
    id: 'trademark-registration',
    name: 'Trademark Registration Questionnaire',
    description: 'Complete this questionnaire to proceed with your trademark registration application',
    serviceSlug: 'trademark-registration',
    version: 1,
    createdAt: '2024-12-26',
    sections: [
        {
            id: 'owner-details',
            title: '1. Trademark Owner Details',
            description: 'Information about the person/entity who will own the trademark',
            fields: [
                {
                    id: 'ownerName',
                    label: 'Trademark Owner Name',
                    type: 'text',
                    required: true,
                    placeholder: 'Company / Firm / Individual name',
                    helpText: 'Full legal name of the trademark owner'
                },
                {
                    id: 'organizationType',
                    label: 'Type of Organization / Owner',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'individual', label: 'Individual' },
                        { value: 'proprietorship', label: 'Proprietorship' },
                        { value: 'partnership', label: 'Partnership Firm' },
                        { value: 'llp', label: 'LLP (Limited Liability Partnership)' },
                        { value: 'pvt-ltd', label: 'Private Limited Company' },
                        { value: 'public-ltd', label: 'Public Limited Company' },
                        { value: 'opc', label: 'One Person Company (OPC)' },
                        { value: 'trust', label: 'Trust' },
                        { value: 'society', label: 'Society' }
                    ]
                },
                {
                    id: 'organizationName',
                    label: 'Organization Name',
                    type: 'text',
                    required: false,
                    placeholder: 'If different from owner name',
                    helpText: 'Leave blank if same as owner name'
                },
                {
                    id: 'ownerAddress',
                    label: 'Address of the Trademark Owner',
                    type: 'textarea',
                    required: true,
                    placeholder: 'Complete address including city, state, PIN code'
                },
                {
                    id: 'partnersDirectors',
                    label: 'Full Name of all Partners / Directors / Trustees',
                    type: 'textarea',
                    required: false,
                    placeholder: 'One name per line',
                    helpText: 'Not required for Individual or Proprietorship'
                },
                {
                    id: 'signatoryName',
                    label: 'Authorized Signatory Name',
                    type: 'text',
                    required: true,
                    placeholder: 'Person who will sign the Authorization Letter'
                },
                {
                    id: 'signatoryAddress',
                    label: 'Signatory Residence Address',
                    type: 'textarea',
                    required: true,
                    placeholder: 'Complete residential address'
                },
                {
                    id: 'signatoryAge',
                    label: 'Signatory Age',
                    type: 'text',
                    required: true,
                    placeholder: 'e.g., 35 years'
                },
                {
                    id: 'signatoryNationality',
                    label: 'Signatory Nationality',
                    type: 'text',
                    required: true,
                    placeholder: 'e.g., Indian'
                },
                {
                    id: 'signatoryMobile',
                    label: 'Signatory Mobile Number',
                    type: 'phone',
                    required: true,
                    placeholder: '+91 XXXXX XXXXX'
                },
                {
                    id: 'signatoryEmail',
                    label: 'Signatory Email ID',
                    type: 'email',
                    required: true,
                    placeholder: 'email@example.com'
                },
                {
                    id: 'applicationMobile',
                    label: 'Mobile Number for Trademark Application',
                    type: 'phone',
                    required: true,
                    placeholder: 'To be mentioned in the TM Application',
                    helpText: 'This number will appear on official trademark documents'
                }
            ]
        },
        {
            id: 'trademark-details',
            title: '2. Trademark Details',
            description: 'Information about the brand name and logo to be trademarked',
            fields: [
                {
                    id: 'brandName',
                    label: 'Brand Name for Trademark',
                    type: 'text',
                    required: true,
                    placeholder: 'The exact name you want to trademark'
                },
                {
                    id: 'hasLogo',
                    label: 'Do you have a logo?',
                    type: 'radio',
                    required: true,
                    options: [
                        { value: 'yes', label: 'Yes, I have a logo' },
                        { value: 'no', label: 'No, only word mark (text only)' },
                        { value: 'later', label: 'Will provide logo separately via email' }
                    ],
                    helpText: 'Trademark can be applied without a logo'
                },
                {
                    id: 'logoDescription',
                    label: 'Logo / Image Description',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Describe the logo design in 2-3 lines',
                    helpText: 'Example: The trademark consists of the alphabet "S" with sharp ends pointing upward, applied over a circular background.'
                }
            ]
        },
        {
            id: 'goods-services',
            title: '3. Goods / Services Information',
            description: 'Describe what products or services you sell under this brand',
            fields: [
                {
                    id: 'tradeDescription',
                    label: 'Trade Description of Goods / Services',
                    type: 'textarea',
                    required: true,
                    placeholder: 'Describe exact goods or services sold/promoted under this brand in 3-4 lines',
                    helpText: 'Example: Software Development - Software development and IT-enabled services including web development, mobile applications, and cloud solutions.'
                }
            ]
        },
        {
            id: 'business-size',
            title: '4. Business Size',
            description: 'This determines government fee structure',
            fields: [
                {
                    id: 'businessType',
                    label: 'Business Size Category',
                    type: 'radio',
                    required: true,
                    options: [
                        { value: 'individual', label: 'Individual Applicant' },
                        { value: 'small', label: 'Small Business / MSME' },
                        { value: 'large', label: 'Large Enterprise' }
                    ],
                    helpText: 'Large Enterprise: Manufacturing with Plant & Machinery > ₹10 Cr OR Service with Equipment > ₹5 Cr'
                },
                {
                    id: 'hasMsme',
                    label: 'Do you have MSME (Udyog Aadhaar) Certificate?',
                    type: 'radio',
                    required: true,
                    options: [
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'No' }
                    ],
                    helpText: 'MSME certificate reduces government fees from ₹9,000 to ₹4,500 per class'
                }
            ]
        },
        {
            id: 'online-selling',
            title: '5. Online Selling Details',
            fields: [
                {
                    id: 'sellsOnline',
                    label: 'Are you selling/trading products on any online portal?',
                    type: 'radio',
                    required: true,
                    options: [
                        { value: 'yes', label: 'Yes' },
                        { value: 'no', label: 'No' }
                    ]
                },
                {
                    id: 'onlinePortals',
                    label: 'Which portals?',
                    type: 'checkbox',
                    required: false,
                    options: [
                        { value: 'amazon', label: 'Amazon' },
                        { value: 'flipkart', label: 'Flipkart' },
                        { value: 'snapdeal', label: 'Snapdeal' },
                        { value: 'meesho', label: 'Meesho' },
                        { value: 'other', label: 'Other' }
                    ],
                    helpText: 'Note: Amazon accepts only Wordmark trademarks'
                }
            ]
        },
        {
            id: 'brand-usage',
            title: '6. Brand Usage Details',
            fields: [
                {
                    id: 'brandUsageStatus',
                    label: 'Date of Use of Brand / Mark',
                    type: 'radio',
                    required: true,
                    options: [
                        { value: 'proposed', label: 'Proposed to be used (future use)' },
                        { value: 'in-use', label: 'Already in use' }
                    ]
                },
                {
                    id: 'usageSinceDate',
                    label: 'If already in use, since when?',
                    type: 'date',
                    required: false,
                    helpText: 'Important: If already in use, a notarized User Affidavit on ₹100 stamp paper is mandatory'
                }
            ]
        },
        {
            id: 'communication',
            title: '7. Communication Address',
            fields: [
                {
                    id: 'serviceAddress',
                    label: 'Service Address for Trademark Registry Communication',
                    type: 'textarea',
                    required: true,
                    placeholder: 'Complete address where the Trademark Registry will send official communications',
                    helpText: 'This is the official address that will appear on trademark records'
                }
            ]
        },
        {
            id: 'tagline',
            title: '8. Company Tagline / Slogan',
            description: 'Optional - if you want to register your tagline as well',
            fields: [
                {
                    id: 'tagline',
                    label: 'Company Tagline / Slogan',
                    type: 'text',
                    required: false,
                    placeholder: 'e.g., "Just Do It" or "Think Different"'
                }
            ]
        },
        {
            id: 'additional-notes',
            title: '9. Additional Information',
            fields: [
                {
                    id: 'additionalNotes',
                    label: 'Any additional information or special requests?',
                    type: 'textarea',
                    required: false,
                    placeholder: 'Mention any specific requirements or questions'
                }
            ]
        }
    ]
};
