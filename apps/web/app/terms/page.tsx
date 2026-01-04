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
                <p className="text-neutral-500 mb-8">Last updated: December 29, 2025</p>

                <div className="space-y-6 text-neutral-700">

                    <h2 className="text-xl font-semibold text-neutral-900">1. Services Provided</h2>
                    <p>We provide professional assistance and facilitation services, including but not limited to:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Trade Licence Registration</li>
                        <li>FSSAI Registration / License</li>
                        <li>Trademark Registration</li>
                        <li>MSME (Udyam) Registration</li>
                        <li>Import Export Code (IEC) Registration</li>
                        <li>Other business and statutory registrations</li>
                        <li>Legal consultation services through our empanelled advocates and legal professionals</li>
                    </ul>
                    <p>All services are provided in accordance with applicable Indian laws and regulations.</p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">2. Nature of Business</h2>
                    <p>
                        We are not a government body, authority, or department. We are a private consultancy firm that assists clients in applying for registrations and certifications issued by government authorities and also provides legal consultation services through empanelled licensed professionals.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">3. Government Authority Disclaimer</h2>
                    <p>
                        Approval, rejection, timelines, and conditions are solely determined by the respective government departments.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">4. Legal Consultation Disclaimer</h2>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Legal advice is provided only by empanelled licensed advocates</li>
                        <li>The Company does not act as a law firm</li>
                        <li>Legal opinions are based on information provided by the client and prevailing laws</li>
                        <li>Nothing herein constitutes a guarantee, warranty, or prediction of outcomes</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">5. Client Responsibilities</h2>
                    <p>Clients must:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Provide true, accurate, and complete information</li>
                        <li>Submit lawful and valid documents</li>
                        <li>Cooperate during the service process</li>
                        <li>Respond promptly to queries</li>
                    </ul>
                    <p>The Company is not responsible for delays or rejections due to incorrect or incomplete information provided by the client.</p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">6. Fees &amp; Payments</h2>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Fees charged are service/consultation fees unless explicitly stated</li>
                        <li>Government fees, stamp duties, or statutory charges are payable separately</li>
                        <li>Fees are non-refundable except where the Company fails to provide the service</li>
                        <li>Prices may change without prior notice</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">7. No Guarantee of Approval</h2>
                    <p>Submission of an application does not guarantee approval. Approval depends on:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Government authority discretion</li>
                        <li>Compliance with applicable laws</li>
                        <li>Accuracy of information submitted</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">8. Timelines</h2>
                    <p>
                        All timelines provided are estimates only and are not guaranteed. Delays caused by government processing or force majeure events are beyond Company control.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">9. Limitation of Liability</h2>
                    <p>To the maximum extent permitted by law:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>No liability for indirect, incidental, or consequential damages</li>
                        <li>Liability limited to the amount paid for the specific service</li>
                        <li>No liability for business losses, penalties, or missed opportunities</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">10. Intellectual Property</h2>
                    <p>
                        All content on this website, including text, logos, graphics, and layout, is the intellectual property of LAWethic and may not be reproduced without written permission.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">11. Confidentiality &amp; Data Protection</h2>
                    <p>
                        Client data and documents are handled confidentially. Data may be shared only with government authorities or empanelled professionals for service execution.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">12. Third-Party Services</h2>
                    <p>
                        All applications are filed through official government portals. The Company is not liable for disruptions, delays, or changes caused by such authorities.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">13. Termination of Services</h2>
                    <p>
                        The Company reserves the right to refuse or terminate services for false information, non-cooperation, or misuse. No refunds shall be issued in such cases.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">14. Governing Law &amp; Jurisdiction</h2>
                    <p>
                        These Terms are governed by the laws of India. Courts at Kolkata shall have exclusive jurisdiction.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">15. Amendments</h2>
                    <p>
                        Terms may be updated at any time without prior notice. Continued use constitutes acceptance.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">16. Contact Information</h2>
                    <p>
                        <strong>LAWethic</strong><br />
                        29/13/A, Naskar Para Road, Haridevpur, Kolkata-700041<br />
                        Phone: +91 84205 62101<br />
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
