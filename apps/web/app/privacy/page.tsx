import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Privacy Policy | LAWethic',
    description: 'LAWethic privacy policy. Learn how we collect, use, and protect your information.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12">
                <Link href="/" className="text-brand-600 hover:underline mb-8 inline-block">← Back to Home</Link>

                <h1 className="text-3xl font-bold text-neutral-900 mb-2">Privacy Policy</h1>
                <p className="text-neutral-500 mb-8">Last updated: December 28, 2025</p>

                <div className="space-y-6 text-neutral-700">
                    <p>
                        LAWethic (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information. By using our services, you consent to the practices described here.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Information We Collect</h2>

                    <p><strong>Personal Information:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Name, email, phone number, address</li>
                        <li>Date of birth and gender</li>
                        <li>PAN, Aadhaar, and other government IDs</li>
                        <li>Business information (company name, GST number)</li>
                        <li>Documents uploaded for service processing</li>
                        <li>Communication records with our team</li>
                    </ul>

                    <p><strong>Automatically Collected:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>IP address, browser type, device information</li>
                        <li>Pages visited and time spent on our website</li>
                        <li>Geographic location (city/country level)</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">How We Use Your Information</h2>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Process and fulfill your service requests</li>
                        <li>Communicate about your orders and send updates</li>
                        <li>Process payments and generate invoices</li>
                        <li>Respond to inquiries and support requests</li>
                        <li>Improve our website and services</li>
                        <li>Comply with legal requirements</li>
                        <li>Prevent fraud and ensure security</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Information Sharing</h2>
                    <p>We may share your information with:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li><strong>Government Authorities:</strong> To process registrations and filings on your behalf.</li>
                        <li><strong>Service Providers:</strong> Payment processors, cloud storage, email services.</li>
                        <li><strong>Professional Partners:</strong> CAs, CSs, and legal professionals working on your case.</li>
                        <li><strong>Legal Requirements:</strong> When required by law or court order.</li>
                    </ul>
                    <p className="mt-2 text-brand-600 font-medium">We do NOT sell your personal information to third parties.</p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Cookies</h2>
                    <p>
                        We use cookies to enhance your experience. These include essential cookies (for authentication), analytics cookies (to understand usage), and functional cookies (to remember preferences). You can control cookies through your browser settings.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Data Security</h2>
                    <p>
                        We implement appropriate measures to protect your information, including SSL encryption, secure cloud storage, access controls, and regular security audits. However, no method of transmission is 100% secure.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Data Retention</h2>
                    <p>
                        We retain your information for as long as necessary to fulfill the purposes outlined here and comply with legal obligations. Generally, we retain data for 7 years as required by Indian tax and corporate laws.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Access a copy of your personal data</li>
                        <li>Request correction of inaccurate data</li>
                        <li>Request deletion (subject to legal requirements)</li>
                        <li>Object to certain processing</li>
                        <li>Withdraw consent for marketing</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Grievance Officer</h2>
                    <p>
                        In accordance with the Information Technology Act, 2000:<br />
                        <strong>Grievance Officer</strong><br />
                        LAWethic, Chennai, Tamil Nadu, India<br />
                        Email: <a href="mailto:grievance@lawethic.com" className="text-brand-600 hover:underline">grievance@lawethic.com</a>
                    </p>
                    <p className="text-sm text-neutral-500">Concerns will be addressed within 30 days.</p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Contact Us</h2>
                    <p>
                        For questions about this policy:<br />
                        Email: <a href="mailto:support@lawethic.com" className="text-brand-600 hover:underline">support@lawethic.com</a>
                    </p>

                    <p className="text-neutral-500 text-sm mt-8 pt-6 border-t border-neutral-200">
                        This policy may be updated from time to time. Continued use of our services indicates acceptance of any updates.
                    </p>
                </div>
            </div>
        </div>
    );
}
