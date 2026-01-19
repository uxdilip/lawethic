'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    Check,
    Star,
    FileText,
    Building2,
    Scale,
    BadgeCheck,
    Sparkles,
    ChevronDown,
    Zap,
    CheckCircle2
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getNavigationData } from '@/lib/services-static';

// Note: Metadata moved to layout or use generateMetadata for client components

const SERVICES = [
    {
        icon: Scale,
        title: 'Legal Matters',
        description: 'Contract review, legal agreements, dispute resolution guidance, and business law queries.',
        examples: ['Contract drafting', 'Legal notices', 'Agreement review'],
    },
    {
        icon: Building2,
        title: 'Business Compliance',
        description: 'Navigate complex regulations with ease. GST, ROC filings, annual returns, and more.',
        examples: ['GST registration', 'Annual compliance', 'ROC filings'],
    },
    {
        icon: FileText,
        title: 'Registrations & Licenses',
        description: 'Company registration, trademark filing, FSSAI, trade license - all under one roof.',
        examples: ['Company formation', 'Trademark', 'FSSAI license'],
    },
    {
        icon: BadgeCheck,
        title: 'Small Business Advisory',
        description: 'Personalized guidance for startups and SMEs on which compliances you actually need.',
        examples: ['Startup compliance', 'Tax planning', 'Growth strategy'],
    },
];

const PROCESS_STEPS = [
    {
        title: 'Share your legal matter',
        description: 'Submit your business or legal query at no cost. Tell us what you need help with.',
    },
    {
        title: 'Get upfront guidance',
        description: 'Our expert reviews your case and provides clear, actionable advice with transparent pricing.',
    },
    {
        title: 'Expert takes action',
        description: 'Choose to proceed and our team handles everything — you focus on your business.',
    },
    {
        title: 'Delivered & done',
        description: 'Receive your completed work, reviewed by experienced professionals you can trust.',
    },
];

const TESTIMONIALS = [
    {
        quote: "I was drowning in compliance confusion. LawEthic's expert not only clarified what I needed but saved me from costly mistakes.",
        author: "Arun K.",
        role: "Founder, SaaS Startup",
        rating: 5,
    },
    {
        quote: "Finally, legal advice that makes sense for small businesses. No jargon, just clear guidance on what we actually need.",
        author: "Priya M.",
        role: "Restaurant Owner",
        rating: 5,
    },
    {
        quote: "The consultation was incredibly thorough. They identified compliance gaps I didn't even know existed.",
        author: "Vikram S.",
        role: "E-commerce Entrepreneur",
        rating: 5,
    },
];

const FAQS = [
    {
        q: 'Is the consultation really free?',
        a: 'Yes, absolutely free for a limited time (normally ₹199). We believe in helping you understand your needs before any commitment.',
    },
    {
        q: 'What topics can I discuss?',
        a: 'Anything related to business compliance, legal matters, registrations, licenses, GST, trademark, company formation, contracts, and small business advisory.',
    },
    {
        q: 'How soon will I get a response?',
        a: 'Our expert will review your case and respond within 24 hours. For urgent matters, we prioritize faster turnaround.',
    },
    {
        q: 'Do I need to prepare anything?',
        a: 'Just a basic understanding of your question or situation. Any relevant documents you have will help us serve you better.',
    },
    {
        q: 'What happens after the consultation?',
        a: 'You receive clear recommendations. If you need any services, you can choose to proceed with transparent, upfront pricing. No pressure, no hidden fees.',
    },
    {
        q: 'Is my information confidential?',
        a: 'Absolutely. All consultations are 100% confidential and handled by qualified professionals bound by strict privacy standards.',
    },
];

const PRICING_FEATURES = [
    'Unlimited questions during consultation',
    'Personalized compliance roadmap',
    'Service recommendations with pricing',
    'Priority response within 24 hours',
    'Follow-up clarifications included',
    'No obligation to purchase',
];

export default function ConsultExpertPage() {
    // Get navigation data for header
    const navigationData = getNavigationData();

    // Animated steps state
    const [activeStep, setActiveStep] = useState(0);

    // Animate through steps
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % (PROCESS_STEPS.length + 1));
        }, 2000); // Change every 2 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Header with navigation */}
            <Header navigationData={navigationData} />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

                <div className="relative container mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-sm font-medium mb-8">
                            <Sparkles className="w-4 h-4" />
                            Limited Time: Free Consultation (Worth ₹199)
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-[1.1] tracking-tight">
                            Compliance for startups.
                            <br />
                            <span className="bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">Done right.</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Fast and reliable compliance guidance designed for businesses.
                            Our experts simplify the complex, so you can focus on growth.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                            <Link
                                href="/dashboard/consultations/new"
                                className="group inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-semibold text-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/25 hover:-translate-y-0.5"
                            >
                                Start Free Consultation
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="#how-it-works"
                                className="inline-flex items-center gap-2 px-6 py-4 text-slate-600 font-medium hover:text-slate-900 transition-colors"
                            >
                                See how it works
                                <ChevronDown className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Trust indicators */}
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-emerald-500" />
                                <span>100% Free</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-emerald-500" />
                                <span>No Credit Card</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-emerald-500" />
                                <span>Expert Response in 24hrs</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What We Help With */}
            <section id="services" className="py-20 md:py-28 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <p className="text-brand-600 font-semibold mb-3">What we help with</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                                Every business question, one place
                            </h2>
                            <p className="text-slate-600 max-w-2xl mx-auto">
                                From legal queries to compliance confusion — our experts have helped
                                thousands of businesses get clarity.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {SERVICES.map((service, index) => (
                                <div
                                    key={index}
                                    className="group p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all duration-300"
                                >
                                    <div className="flex items-start gap-5">
                                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                            <service.icon className="w-6 h-6 text-brand-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-slate-900 mb-2">
                                                {service.title}
                                            </h3>
                                            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                                {service.description}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {service.examples.map((example, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-3 py-1 bg-white text-slate-600 text-xs rounded-full border border-slate-200"
                                                    >
                                                        {example}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works - Arcline Style */}
            <section id="how-it-works" className="py-20 md:py-28 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                            {/* Left Side - Title and Benefits */}
                            <div className="lg:sticky lg:top-32">
                                <p className="text-slate-500 text-sm mb-4">Compliance designed for startups.</p>
                                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight">
                                    Here&apos;s how it works:
                                </h2>

                                <ul className="space-y-4 mb-10">
                                    <li className="flex items-start gap-2 text-slate-700">
                                        <span className="text-slate-400">•</span>
                                        <span>Flat fees, no surprises.</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-slate-700">
                                        <span className="text-slate-400">•</span>
                                        <span>Compliance experts who&apos;ve done it before.</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-slate-700">
                                        <span className="text-slate-400">•</span>
                                        <span>Fast turnaround, transparent process.</span>
                                    </li>
                                </ul>

                                <Link
                                    href="/dashboard/consultations/new"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-all"
                                >
                                    Try LawEthic
                                </Link>
                            </div>

                            {/* Right Side - Steps Timeline */}
                            <div className="relative">
                                {/* Vertical line */}
                                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200" />

                                <div className="space-y-0">
                                    {PROCESS_STEPS.map((step, index) => {
                                        const isCompleted = index < activeStep;
                                        return (
                                            <div key={index} className="relative flex gap-6 pb-12 last:pb-0">
                                                {/* Circle indicator */}
                                                <div className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${isCompleted
                                                        ? 'bg-slate-900 border-slate-900'
                                                        : 'bg-white border-slate-300'
                                                    }`}>
                                                    {isCompleted && (
                                                        <Check className="w-3 h-3 text-white animate-in fade-in zoom-in duration-300" />
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 -mt-1">
                                                    <h3 className="font-semibold text-lg text-slate-900 mb-2">
                                                        {step.title}
                                                    </h3>
                                                    <p className="text-slate-600 leading-relaxed">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 md:py-28 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <p className="text-brand-600 font-semibold mb-3">Limited time offer</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                                Expert consultation, on us
                            </h2>
                            <p className="text-slate-600 max-w-xl mx-auto">
                                We&apos;re waiving our consultation fee to help more businesses get the guidance they need.
                            </p>
                        </div>

                        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl" />

                            <div className="relative grid md:grid-cols-2 gap-10 items-center">
                                {/* Left - Pricing */}
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium mb-6">
                                        <Zap className="w-4 h-4" />
                                        Free for limited period
                                    </div>

                                    <div className="flex items-baseline gap-3 mb-4">
                                        <span className="text-5xl md:text-6xl font-bold text-white">₹0</span>
                                        <div className="flex flex-col">
                                            <span className="text-slate-400 line-through text-lg">₹199</span>
                                            <span className="text-emerald-400 text-sm font-medium">100% OFF</span>
                                        </div>
                                    </div>

                                    <p className="text-slate-400 mb-8">
                                        One consultation • All your questions answered • No strings attached
                                    </p>

                                    <Link
                                        href="/dashboard/consultations/new"
                                        className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-semibold hover:bg-slate-100 transition-all"
                                    >
                                        Claim Free Consultation
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>

                                {/* Right - Features */}
                                <div>
                                    <h4 className="text-white font-semibold mb-6">What&apos;s included:</h4>
                                    <ul className="space-y-4">
                                        {PRICING_FEATURES.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center mt-0.5">
                                                    <Check className="w-3 h-3 text-emerald-400" />
                                                </div>
                                                <span className="text-slate-300">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16 bg-slate-50 border-y border-slate-100">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { value: 'Flat Fees', label: 'No Hidden Costs' },
                                { value: '24hr', label: 'Quick Response' },
                                { value: '100%', label: 'Confidential' },
                                { value: 'Expert', label: 'Verified Professionals' },
                            ].map((stat, index) => (
                                <div key={index} className="text-center">
                                    <p className="text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</p>
                                    <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 md:py-28 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <p className="text-brand-600 font-semibold mb-3">Customer stories</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                                Trusted by businesses across India
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {TESTIMONIALS.map((testimonial, index) => (
                                <div
                                    key={index}
                                    className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors"
                                >
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-700 mb-6 leading-relaxed">
                                        &quot;{testimonial.quote}&quot;
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                            {testimonial.author.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{testimonial.author}</p>
                                            <p className="text-sm text-slate-500">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 md:py-28 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-12">
                            <p className="text-brand-600 font-semibold mb-3">Questions</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                                Frequently Asked Questions
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {FAQS.map((faq, index) => (
                                <details
                                    key={index}
                                    className="group bg-white rounded-xl border border-slate-200 overflow-hidden"
                                >
                                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                        <span className="font-medium text-slate-900 pr-4">{faq.q}</span>
                                        <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                                    </summary>
                                    <div className="px-6 pb-6 pt-0">
                                        <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA - Arcline Style */}
            <section className="py-20 md:py-28 bg-slate-900 relative overflow-hidden">
                <div className="relative container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        {/* Headline */}
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                                Legal for startups.
                                <br />
                                <span className="text-slate-400">Done right.</span>
                            </h2>
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid md:grid-cols-2 gap-8 items-stretch">
                            {/* Left - Testimonial */}
                            <div className="bg-slate-800/50 rounded-2xl p-8 md:p-10 flex flex-col justify-between">
                                <div>
                                    <p className="text-xl md:text-2xl text-white leading-relaxed mb-6">
                                        &quot;As a founder, compliance work used to be painfully slow and confusing.
                                    </p>
                                    <p className="text-xl md:text-2xl text-white leading-relaxed">
                                        With LawEthic, we finally have experts who understand our business, and work at startup speed and cost&quot;
                                    </p>
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-700">
                                    <p className="text-white font-medium">Rahul M.</p>
                                    <p className="text-slate-400 text-sm">Founder, Tech Startup</p>
                                </div>
                            </div>

                            {/* Right - CTA Card */}
                            <div className="bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-orange-400/20 rounded-2xl p-8 md:p-10 flex flex-col justify-center items-center text-center relative overflow-hidden">
                                {/* Gradient orb decoration */}
                                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-orange-400/30 rounded-full blur-3xl" />

                                <div className="relative z-10">
                                    <Link
                                        href="/dashboard/consultations/new"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-all shadow-lg mb-6"
                                    >
                                        Book a Free Consultation
                                    </Link>

                                    <Link
                                        href="/login"
                                        className="block px-8 py-4 border border-pink-400/50 text-pink-300 rounded-lg font-medium hover:bg-pink-500/10 transition-all"
                                    >
                                        Login or Sign up
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
