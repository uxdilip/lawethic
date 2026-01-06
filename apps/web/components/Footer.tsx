'use client';

import Link from 'next/link';
import { Lock, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-brand-600 text-white">
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <h3 className="text-2xl font-bold mb-4">
                            <span className="font-playfair">LAW</span>
                            <span className="font-montserrat">ethic</span>
                        </h3>
                        <p className="text-brand-200 text-sm leading-relaxed mb-6">
                            Professional compliance services platform for businesses across India.
                            100% manual filing by experienced legal professionals.
                        </p>
                        <div className="flex items-center gap-3">
                            <Lock className="h-5 w-5 text-brand-200" />
                            <span className="text-sm text-brand-200">SSL Secured</span>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-semibold mb-4">Services</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/services/trademark-registration" className="text-brand-200 hover:text-white transition-colors">Trademark Filing</Link></li>
                            <li><Link href="/services/fssai-registration" className="text-brand-200 hover:text-white transition-colors">FSSAI License</Link></li>
                            <li><Link href="/services/trade-license" className="text-brand-200 hover:text-white transition-colors">Trade License</Link></li>
                            <li><Link href="/services" className="text-white hover:text-brand-200 transition-colors font-medium">View All →</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/privacy" className="text-brand-200 hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-brand-200 hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="/refund" className="text-brand-200 hover:text-white transition-colors">Refund Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4">Get in Touch</h4>
                        <ul className="space-y-3 text-sm text-brand-200">
                            <li className="flex items-start gap-3">
                                <Mail className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <span>support@lawethic.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <span>+91 84205 62101</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <span>29/13/A, Naskar Para Road, Haridevpur, Kolkata-700041</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-8 border-t border-brand-500 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <p className="text-sm text-brand-200">
                        © {new Date().getFullYear()} LAWethic. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
