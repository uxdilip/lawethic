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
                <p className="text-neutral-500 mb-8">Last updated: December 29, 2025</p>

                <div className="space-y-6 text-neutral-700">

                    <h2 className="text-xl font-semibold text-neutral-900">1. Information We Collect</h2>
                    <p>We may collect:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Personal information (Name, Email, Phone, Address, ID details)</li>
                        <li>Business details and documents</li>
                        <li>Technical data (IP address, browser, device, cookies)</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">2. Use of Information</h2>
                    <p>Information is used for:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Providing services</li>
                        <li>Facilitating legal consultations</li>
                        <li>Communication and updates</li>
                        <li>Legal and regulatory compliance</li>
                        <li>Improving website and services</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">3. Sharing of Information</h2>
                    <p>Information may be shared with:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Government authorities</li>
                        <li>Empanelled professionals</li>
                        <li>IT service providers and payment gateways</li>
                        <li>Legal or regulatory authorities when required</li>
                    </ul>
                    <p className="mt-2 text-brand-600 font-medium">We do not sell or rent personal data.</p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">4. Cookies</h2>
                    <p>
                        Cookies may be used to enhance user experience. Disabling cookies may affect functionality.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">5. Data Retention</h2>
                    <p>
                        Data is retained only as long as necessary for service delivery or legal compliance.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">6. Governing Law</h2>
                    <p>
                        This Privacy Policy is governed by Indian law, including the Information Technology Act, 2000.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">7. Contact Details</h2>
                    <p>
                        <strong>LAWethic</strong><br />
                        29/13/A, Naskar Para Road, Haridevpur, Kolkata-700041<br />
                        Phone: +91 84205 62101<br />
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
