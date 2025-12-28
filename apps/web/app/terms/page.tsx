import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Terms and Conditions | LAWethic',
    description: 'LAWethic terms and conditions of service.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12">
                <Link href="/" className="text-brand-600 hover:underline mb-8 inline-block">← Back to Home</Link>

                <h1 className="text-3xl font-bold text-neutral-900 mb-2">Terms and Conditions</h1>
                <p className="text-neutral-500 mb-8">Last updated: December 28, 2025</p>

                <div className="space-y-6 text-neutral-700">
                    <p>
                        Welcome to LAWethic. These Terms govern your use of our website and services. By using our services, you agree to these Terms.
                    </p>

                    <p className="bg-amber-50 p-4 rounded text-amber-800">
                        <strong>Important:</strong> LAWethic is NOT a law firm and does NOT provide legal advice. We are a technology platform that connects users with professionals and facilitates document preparation and filing services.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Definitions</h2>
                    <ul className="list-disc pl-6 space-y-1">
                        <li><strong>&quot;Company,&quot; &quot;we,&quot; &quot;our&quot;</strong> refers to LAWethic.</li>
                        <li><strong>&quot;User,&quot; &quot;you,&quot; &quot;your&quot;</strong> refers to any person using our Services.</li>
                        <li><strong>&quot;Services&quot;</strong> refers to all services offered through our website.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Eligibility</h2>
                    <p>
                        You must be at least 18 years old and have legal capacity to enter into contracts. If using services on behalf of a company, you must have authority to bind that entity.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Services We Provide</h2>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Trademark registration and IP services</li>
                        <li>FSSAI license and food business compliance</li>
                        <li>Trade license and shop establishment registration</li>
                        <li>GST registration and compliance</li>
                        <li>Company and LLP incorporation</li>
                        <li>Import Export Code (IEC) registration</li>
                        <li>MSME/Udyam registration</li>
                        <li>Annual compliance and filing services</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">User Responsibilities</h2>
                    <p>You agree to:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Provide accurate and complete information</li>
                        <li>Upload authentic documents only</li>
                        <li>Respond promptly to requests for information</li>
                        <li>Pay all applicable fees on time</li>
                        <li>Not use services for illegal purposes</li>
                        <li>Keep your account credentials secure</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Prohibited Activities</h2>
                    <p>You must NOT:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Submit false or misleading information</li>
                        <li>Attempt to circumvent security measures</li>
                        <li>Use automated systems without permission</li>
                        <li>Impersonate another person or entity</li>
                        <li>Harass our staff or other users</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Payment Terms</h2>
                    <p>
                        Prices are in Indian Rupees (INR) and include GST unless stated otherwise. Government fees are collected separately. Payment must be made before services commence. We accept payments via Razorpay. See our <Link href="/refund" className="text-brand-600 hover:underline">Refund Policy</Link> for cancellations.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Service Delivery</h2>
                    <p>
                        Estimated timelines are indicative and may vary based on document completeness, government processing times, portal issues, or queries raised by authorities. We are not responsible for delays beyond our control.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Limitation of Liability</h2>
                    <p>
                        To the maximum extent permitted by law, LAWethic shall not be liable for indirect, incidental, or consequential damages, loss of profits, rejection of applications by authorities, or delays in government processing. Our total liability shall not exceed the amount paid for the specific service.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Indemnification</h2>
                    <p>
                        You agree to indemnify LAWethic from claims arising from your use of services, violation of these Terms, or false information provided by you.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Dispute Resolution</h2>
                    <p>
                        Disputes shall first be resolved through good-faith negotiations. If unresolved within 30 days, disputes may be referred to arbitration under the Arbitration and Conciliation Act, 1996, in Chennai.
                    </p>
                    <p className="mt-2">
                        <strong>Governing Law:</strong> Laws of India<br />
                        <strong>Jurisdiction:</strong> Courts of Chennai, Tamil Nadu
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Modifications</h2>
                    <p>
                        We may modify these Terms at any time. Changes are effective upon posting. Continued use constitutes acceptance of revised Terms.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Termination</h2>
                    <p>
                        We may suspend or terminate your access at any time for violation of these Terms or harmful conduct.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Contact Us</h2>
                    <p>
                        For questions about these Terms:<br />
                        Email: <a href="mailto:support@lawethic.com" className="text-brand-600 hover:underline">support@lawethic.com</a>
                    </p>

                    <p className="text-neutral-500 text-sm mt-8 pt-6 border-t border-neutral-200">
                        By using our services, you acknowledge that you have read and agree to these Terms. See also our <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link> and <Link href="/refund" className="text-brand-600 hover:underline">Refund Policy</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
