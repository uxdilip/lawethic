import Link from 'next/link';
import { ArrowRight, CheckCircle, FileText, Shield, Clock } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto text-center max-w-4xl">
                    <h1 className="text-5xl font-bold mb-6 text-gray-900">
                        Professional Compliance Services
                        <br />
                        <span className="text-blue-600">Simplified for You</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Expert filing services for GST Registration, Trademark, Company Registration, FSSAI License, and more.
                        100% manual filing by experienced CA/CS professionals.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link
                            href="/services"
                            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-lg"
                        >
                            Browse Services
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <Link
                            href="/dashboard"
                            className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center text-lg"
                        >
                            Track Order
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 px-4 bg-gray-50">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Choose LawEthic?</h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <Shield className="h-12 w-12 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">100% Manual Filing</h3>
                            <p className="text-gray-600">
                                Experienced CA/CS professionals handle your documents manually
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <CheckCircle className="h-12 w-12 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Guaranteed Approval</h3>
                            <p className="text-gray-600">
                                We ensure your application is filed correctly the first time
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <Clock className="h-12 w-12 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Fast Processing</h3>
                            <p className="text-gray-600">
                                Quick turnaround times with real-time status updates
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <FileText className="h-12 w-12 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Document Support</h3>
                            <p className="text-gray-600">
                                Guidance on required documents and verification support
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Services */}
            <section className="py-16 px-4">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Popular Services</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'GST Registration',
                                price: '₹999',
                                description: 'Get your GST registration done in 7-10 days',
                                features: ['PAN Card verification', 'Address proof support', 'ARN within 24 hours'],
                            },
                            {
                                name: 'Trademark Registration',
                                price: '₹4,999',
                                description: 'Protect your brand with trademark registration',
                                features: ['Class selection support', 'Comprehensive search', 'Filing in 2-3 days'],
                            },
                            {
                                name: 'Company Registration',
                                price: '₹7,999',
                                description: 'Register your Private Limited Company',
                                features: ['DSC included', 'DIN allotment', 'Incorporation certificate'],
                            },
                        ].map((service) => (
                            <div key={service.name} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                                <h3 className="text-2xl font-semibold mb-2">{service.name}</h3>
                                <p className="text-3xl font-bold text-blue-600 mb-4">{service.price}</p>
                                <p className="text-gray-600 mb-4">{service.description}</p>
                                <ul className="space-y-2 mb-6">
                                    {service.features.map((feature) => (
                                        <li key={feature} className="flex items-start">
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-gray-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/services"
                                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Get Started
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-4">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">LawEthic</h3>
                            <p className="text-gray-400">
                                Professional compliance services platform for businesses across India.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Services</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>GST Registration</li>
                                <li>Trademark Filing</li>
                                <li>Company Registration</li>
                                <li>FSSAI License</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>About Us</li>
                                <li>Contact</li>
                                <li>Privacy Policy</li>
                                <li>Terms of Service</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Contact</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>support@lawethic.com</li>
                                <li>+91 9876543210</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 LawEthic. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
