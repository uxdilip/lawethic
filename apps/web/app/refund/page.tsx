import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Refund & Cancellation Policy | LAWethic',
    description: 'LAWethic refund and cancellation policy.',
};

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12">
                <Link href="/" className="text-brand-600 hover:underline mb-8 inline-block">← Back to Home</Link>

                <h1 className="text-3xl font-bold text-neutral-900 mb-2">Refund &amp; Cancellation Policy</h1>
                <p className="text-neutral-500 mb-8">Last updated: December 29, 2025</p>

                <div className="space-y-6 text-neutral-700">

                    <h2 className="text-xl font-semibold text-neutral-900">1. Service Fees</h2>
                    <p>
                        Fees paid are professional service and consultation fees. Government fees and third-party costs are non-refundable.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">2. No Refund Policy</h2>
                    <p>
                        Once service initiation begins or documents are received, no refunds shall be issued except where the Company fails to provide the service.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">3. Cancellation Requests</h2>
                    <p>
                        Cancellation must be requested before work has commenced. Once processing begins, cancellation is not permitted and is subject to Company discretion.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">4. Non-Refundable Situations</h2>
                    <p>No refunds will be provided for:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Incorrect or incomplete client information</li>
                        <li>Failure to submit documents on time</li>
                        <li>Government rule or policy changes</li>
                        <li>Delays or rejection by authorities</li>
                        <li>Client non-responsiveness</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">5. Exceptional Circumstances</h2>
                    <p>
                        Refunds may be considered for duplicate or failed payments, excluding 20% administrative charges.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">6. Decision Authority</h2>
                    <p>
                        All refund and cancellation decisions by LAWethic shall be final and binding.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Contact Us</h2>
                    <p>
                        For refund requests or questions:<br />
                        <strong>LAWethic</strong><br />
                        Chennai, Tamil Nadu, India<br />
                        Email: <a href="mailto:support@lawethic.com" className="text-brand-600 hover:underline">support@lawethic.com</a>
                    </p>

                    <p className="text-neutral-500 text-sm mt-8 pt-6 border-t border-neutral-200">
                        This policy is subject to change without prior notice. Continued use of our services indicates acceptance of any updates.
                    </p>
                </div>
            </div>
        </div>
    );
}
