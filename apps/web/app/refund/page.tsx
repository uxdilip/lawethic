import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Refund Policy | LAWethic',
    description: 'LAWethic refund and cancellation policy.',
};

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12">
                <Link href="/" className="text-brand-600 hover:underline mb-8 inline-block">← Back to Home</Link>

                <h1 className="text-3xl font-bold text-neutral-900 mb-2">Refund Policy</h1>
                <p className="text-neutral-500 mb-8">Last updated: December 28, 2025</p>

                <div className="space-y-6 text-neutral-700">
                    <p>
                        At LAWethic, we are committed to providing exceptional service. This policy outlines the terms under which refunds may be granted.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Refund Eligibility</h2>
                    <p>Refunds may be considered in the following situations:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Service Not Delivered:</strong> If we fail to provide the service due to reasons within our control.</li>
                        <li><strong>Service Deficiency:</strong> If there is a visible deficiency with the service purchased.</li>
                        <li><strong>Duplicate Payment:</strong> If you have been charged multiple times for the same service.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Non-Refundable Scenarios</h2>
                    <p>Refunds will NOT be provided in the following cases:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Change of Mind:</strong> Cancellation due to change of mind after payment.</li>
                        <li><strong>Work Completed:</strong> If the work has been completed and shared with you.</li>
                        <li><strong>Government Fees:</strong> Fees paid to government bodies are non-refundable.</li>
                        <li><strong>Third-Party Charges:</strong> Payments made to third parties are non-refundable.</li>
                        <li><strong>Request After 30 Days:</strong> Refund requests made 30 days after purchase.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Cancellation Policy</h2>
                    <p>
                        Cancellation is generally not possible once payment has been made and work has commenced. If you cancel before work starts, a cancellation fee of 20% + any earned fees + government/third-party fees already paid will apply.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Factors Beyond Our Control</h2>
                    <p>
                        The outcome of any registration or application cannot be guaranteed as it depends on Government Authorities. Rejections, delays, or requests for additional information by government departments do not qualify for refunds.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Force Majeure</h2>
                    <p>
                        LAWethic shall not be liable for delays or failures due to circumstances beyond our control, including natural disasters, epidemics, government actions, war, or technical failures of government systems.
                    </p>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Refund Process</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                        <li>Send your refund request to support@lawethic.com with order details and reason.</li>
                        <li>Our team will review your request within 3-5 business days.</li>
                        <li>You will be notified of our decision via email.</li>
                        <li>If approved, refund will be processed within 7-15 business days.</li>
                    </ol>

                    <h2 className="text-xl font-semibold text-neutral-900 mt-8">Contact Us</h2>
                    <p>
                        For refund requests or questions:<br />
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
