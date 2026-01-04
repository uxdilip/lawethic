'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Footer from '@/components/Footer';
import {
    ArrowRight,
    CheckCircle,
    FileText,
    Shield,
    Building2,
    Award,
    Sparkles,
    Users,
    Lock,
    Headphones,
    ChevronDown,
    ChevronRight,
    BadgeCheck,
    TrendingUp,
    FileCheck,
    CreditCard,
    Play,
    Search,
    Zap,
    Clock,
    Phone,
    Mail,
    MapPin,
    ArrowUpRight
} from 'lucide-react';

// ============================================
// INTERACTIVE COMPONENTS
// ============================================

// Animated text that types out
function TypeWriter({ texts, className }: { texts: string[]; className?: string }) {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const text = texts[currentTextIndex];
        const timeout = setTimeout(() => {
            if (!isDeleting) {
                if (currentText.length < text.length) {
                    setCurrentText(text.slice(0, currentText.length + 1));
                } else {
                    setTimeout(() => setIsDeleting(true), 2000);
                }
            } else {
                if (currentText.length > 0) {
                    setCurrentText(text.slice(0, currentText.length - 1));
                } else {
                    setIsDeleting(false);
                    setCurrentTextIndex((prev) => (prev + 1) % texts.length);
                }
            }
        }, isDeleting ? 50 : 100);

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, currentTextIndex, texts]);

    return (
        <span className={className}>
            {currentText}
            <span className="animate-pulse">|</span>
        </span>
    );
}

// Floating animation wrapper
function FloatingElement({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <div
            className="animate-float"
            style={{ animationDelay: `${delay}s` }}
        >
            {children}
        </div>
    );
}

// Interactive service card with hover effects
function ServiceCard({
    icon: Icon,
    title,
    description,
    price,
    timeline,
    href,
    gradient,
    index
}: {
    icon: any;
    title: string;
    description: string;
    price: string;
    timeline: string;
    href: string;
    gradient: string;
    index: number;
}) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link
            href={href}
            className="group relative block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <div className={`relative overflow-hidden rounded-2xl bg-white border-2 transition-all duration-500 ${isHovered ? 'border-brand-200 shadow-2xl shadow-brand-200/20 -translate-y-2' : 'border-neutral-100 shadow-lg'}`}>
                {/* Gradient accent bar */}
                <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

                {/* Animated background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-500 ${isHovered ? 'opacity-5' : ''}`} />

                <div className="relative p-6">
                    {/* Icon with animation */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 text-white transition-transform duration-500 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
                        <Icon className="h-7 w-7" />
                    </div>

                    <h3 className="text-lg font-bold text-brand-600 mb-2 group-hover:text-brand-700 transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                        {description}
                    </p>

                    {/* Price and timeline */}
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <p className="text-xs text-neutral-500 mb-0.5">Starting at</p>
                            <p className="text-2xl font-bold text-brand-600">{price}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-neutral-500 mb-0.5">Timeline</p>
                            <p className="text-sm font-semibold text-neutral-700">{timeline}</p>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className={`flex items-center justify-between pt-4 border-t border-neutral-100 transition-all duration-300 ${isHovered ? 'border-brand-100' : ''}`}>
                        <span className="text-sm font-semibold text-brand-500 group-hover:text-brand-600">
                            Get Started
                        </span>
                        <div className={`w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center transition-all duration-300 ${isHovered ? 'bg-brand-600 translate-x-1' : ''}`}>
                            <ArrowRight className={`h-4 w-4 transition-colors ${isHovered ? 'text-white' : 'text-brand-600'}`} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// Interactive category tabs
function CategoryTabs({
    categories,
    activeCategory,
    onCategoryChange
}: {
    categories: { id: string; label: string; icon: any }[];
    activeCategory: string;
    onCategoryChange: (id: string) => void;
}) {
    return (
        <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all duration-300 ${activeCategory === cat.id
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                        : 'bg-white text-neutral-600 hover:bg-brand-50 hover:text-brand-600 border border-neutral-200'
                        }`}
                >
                    <cat.icon className="h-4 w-4" />
                    {cat.label}
                </button>
            ))}
        </div>
    );
}

// Animated counter with intersection observer
function AnimatedCounter({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    let start = 0;
                    const duration = 2000;
                    const startTime = performance.now();

                    const animate = (currentTime: number) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const easeOut = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(easeOut * end));

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    };
                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, hasAnimated]);

    return (
        <span ref={ref}>
            {prefix}{count}{suffix}
        </span>
    );
}

// FAQ Accordion
function FAQItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
    return (
        <div className={`border-b border-neutral-200 last:border-0 transition-colors ${isOpen ? 'bg-brand-50/50' : ''}`}>
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between py-5 px-4 text-left group"
            >
                <span className={`font-medium transition-colors pr-4 ${isOpen ? 'text-brand-600' : 'text-neutral-900 group-hover:text-brand-600'}`}>
                    {question}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-brand-600 rotate-180' : 'bg-neutral-100 group-hover:bg-brand-100'}`}>
                    <ChevronDown className={`h-4 w-4 transition-colors ${isOpen ? 'text-white' : 'text-neutral-600'}`} />
                </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <p className="text-neutral-600 leading-relaxed px-4 pb-5">{answer}</p>
            </div>
        </div>
    );
}

// Process step with animation
function ProcessStep({ step, title, description, icon: Icon, isActive }: { step: number; title: string; description: string; icon: any; isActive: boolean }) {
    return (
        <div className={`relative text-center transition-all duration-500 z-10 ${isActive ? 'scale-105' : 'opacity-70'}`}>
            <div className={`relative inline-flex mb-4`}>
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 bg-white ${isActive ? 'ring-4 ring-brand-600 shadow-lg shadow-brand-600/30' : 'ring-2 ring-brand-100'}`}>
                    <Icon className={`h-8 w-8 transition-colors ${isActive ? 'text-brand-600' : 'text-brand-400'}`} />
                </div>
                <span className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${isActive ? 'bg-brand-200 text-brand-700' : 'bg-neutral-200 text-neutral-600'}`}>
                    {step}
                </span>
            </div>
            <h3 className={`text-lg font-semibold mb-2 transition-colors ${isActive ? 'text-brand-600' : 'text-neutral-700'}`}>
                {title}
            </h3>
            <p className="text-sm text-neutral-600 max-w-[200px] mx-auto">
                {description}
            </p>
        </div>
    );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function HomePage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeStep, setActiveStep] = useState(0);
    const [openFAQ, setOpenFAQ] = useState<number | null>(0);
    const [searchQuery, setSearchQuery] = useState('');

    // Auto-rotate process steps
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 4);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const categories = [
        { id: 'all', label: 'All Services', icon: Sparkles },
        { id: 'trademark', label: 'Trademark & IP', icon: Award },
        { id: 'licenses', label: 'Licenses', icon: BadgeCheck },
    ];

    const services = [
        {
            slug: 'trademark-registration',
            name: 'Trademark Registration',
            price: '₹4,999',
            timeline: '1-2 days filing',
            description: 'Protect your brand identity and logo',
            icon: Award,
            gradient: 'from-brand-600 to-brand-500',
            category: 'trademark',
        },
        {
            slug: 'fssai-registration',
            name: 'FSSAI License',
            price: '₹1,999',
            timeline: '7-15 days',
            description: 'Required for all food businesses',
            icon: BadgeCheck,
            gradient: 'from-brand-600 to-brand-500',
            category: 'licenses',
        },
        {
            slug: 'trade-license-registration',
            name: 'Trade License',
            price: '₹2,999',
            timeline: '7-15 days',
            description: 'Required for operating any business legally',
            icon: Building2,
            gradient: 'from-brand-600 to-brand-500',
            category: 'licenses',
        },
        {
            slug: 'iec-registration',
            name: 'Import Export Code',
            price: '₹1,499',
            timeline: '3-5 days',
            description: 'Essential for international trade',
            icon: TrendingUp,
            gradient: 'from-brand-600 to-brand-500',
            category: 'licenses',
        },
    ];

    const filteredServices = activeCategory === 'all'
        ? services
        : services.filter(s => s.category === activeCategory);

    const processSteps = [
        { title: 'Choose Service', description: 'Browse and select the service you need', icon: Search },
        { title: 'Submit Documents', description: 'Upload required documents securely', icon: FileText },
        { title: 'Expert Processing', description: 'Our legal team handles your filing', icon: Users },
        { title: 'Get Certificate', description: 'Receive your registration certificate', icon: BadgeCheck },
    ];

    const features = [
        { title: '100% Manual Filing', description: 'Experienced legal professionals handle your documents personally', icon: Users },
        { title: 'Real-time Tracking', description: 'Track your application status from your dashboard', icon: TrendingUp },
        { title: 'Document Support', description: 'Expert guidance on required documentation', icon: FileCheck },
        { title: 'Transparent Pricing', description: 'No hidden charges, what you see is what you pay', icon: CreditCard },
        { title: 'Secure & Confidential', description: 'Your documents are encrypted and protected', icon: Lock },
        { title: 'Dedicated Support', description: 'Get help via chat, email, or phone', icon: Headphones },
    ];

    const faqs = [
        { question: 'What documents do I need for registration?', answer: 'Document requirements vary by service. Generally, you\'ll need identity proof (Aadhaar/PAN), address proof, and photographs. We provide a detailed checklist after you place your order.' },
        { question: 'How long does the registration process take?', answer: 'Timeline depends on the service. GST takes 3-5 days, trademark filing 1-2 days, and company incorporation 14-21 days. We provide realistic timelines and keep you updated.' },
        { question: 'How can I track my application status?', answer: 'Once you place an order, you get access to your personal dashboard where you can track the status in real-time with email notifications at each milestone.' },
        { question: 'Are there any hidden charges?', answer: 'No hidden charges. Our pricing is transparent. Service fee and government fees are clearly shown before payment.' },
        { question: 'What if my application gets rejected?', answer: 'We review all documents before submission. In case of rejection, we\'ll work with you to address issues and refile at no extra service charge.' },
    ];

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            {/* Custom CSS for animations */}
            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                @keyframes gradient-x {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-x 3s ease infinite;
                }
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
            `}</style>

            {/* ============================================ */}
            {/* HERO SECTION - Interactive & Vibrant */}
            {/* ============================================ */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800" />

                {/* Animated blobs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl animate-blob" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-300/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-400/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
                    <div className="max-w-3xl mx-auto text-center">
                        {/* Main content */}
                        <div className="text-white">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white mb-6 mx-auto">
                                <Sparkles className="h-4 w-4 text-brand-200" />
                                Professional Compliance Services
                            </div>

                            {/* Headline with typewriter effect */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                                <span className="block">Start Your <span className="text-brand-200 inline-block min-w-[180px] sm:min-w-[220px]"><TypeWriter texts={['Business', 'Startup', 'Company', 'Dream']} /></span></span>
                                <span className="text-white/90">With Expert Legal Support</span>
                            </h1>

                            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                                GST Registration, Trademark, Company Incorporation & more.
                                <span className="font-semibold text-brand-200"> 100% manual filing</span> by experienced legal professionals.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-4 justify-center">
                                <Link
                                    href="/services"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-600 rounded-xl font-semibold hover:bg-brand-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    Browse Services
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </div>

                            {/* Trust indicators */}
                            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 mb-16 text-sm text-white/70">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-brand-200" />
                                    <span>Government Registered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-brand-200" />
                                    <span>Secure Payments</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-brand-200" />
                                    <span>Expert Team</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wave divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
                    </svg>
                </div>
            </section>

            {/* ============================================ */}
            {/* SERVICES SECTION - Interactive Categories */}
            {/* ============================================ */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-brand-600 mb-4">
                            Our Services
                        </h2>
                        <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-8">
                            Comprehensive legal and compliance services for businesses of all sizes
                        </p>

                        {/* Interactive category tabs */}
                        <CategoryTabs
                            categories={categories}
                            activeCategory={activeCategory}
                            onCategoryChange={setActiveCategory}
                        />
                    </div>

                    {/* Service cards grid with animation */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                        {filteredServices.map((service, index) => (
                            <ServiceCard
                                key={service.slug}
                                icon={service.icon}
                                title={service.name}
                                description={service.description}
                                price={service.price}
                                timeline={service.timeline}
                                href={`/services/${service.slug}`}
                                gradient={service.gradient}
                                index={index}
                            />
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            href="/services"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            View All Services
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* HOW IT WORKS - Interactive Steps */}
            {/* ============================================ */}
            <section className="py-20 px-4 bg-gradient-to-b from-neutral-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-brand-600 mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                            Simple 4-step process to get your registration done
                        </p>
                    </div>

                    {/* Interactive process steps */}
                    <div className="relative">
                        {/* Progress bar - positioned below the step numbers */}
                        <div className="hidden lg:block absolute top-[88px] left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-1 bg-neutral-200 rounded-full z-0">
                            <div
                                className="h-full bg-brand-600 rounded-full transition-all duration-500"
                                style={{ width: `${(activeStep / 3) * 100}%` }}
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {processSteps.map((step, index) => (
                                <div
                                    key={step.title}
                                    onClick={() => setActiveStep(index)}
                                    className="cursor-pointer"
                                >
                                    <ProcessStep
                                        step={index + 1}
                                        title={step.title}
                                        description={step.description}
                                        icon={step.icon}
                                        isActive={activeStep === index}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* WHY CHOOSE US - Feature Grid */}
            {/* ============================================ */}
            <section className="py-20 px-4 bg-brand-600">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Why Choose LawEthic?
                        </h2>
                        <p className="text-lg text-brand-200 max-w-2xl mx-auto">
                            We do things differently, and your business benefits from it
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="group p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="w-14 h-14 bg-brand-200/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-200/30 transition-colors">
                                    <feature.icon className="h-7 w-7 text-brand-200" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-brand-200/80 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* STATS SECTION */}
            {/* ============================================ */}
            <section className="py-16 px-4 bg-gradient-to-r from-brand-200 to-blue-200">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <p className="text-4xl font-bold text-brand-600 mb-1">
                                <AnimatedCounter end={50} suffix="+" />
                            </p>
                            <p className="text-brand-700 text-sm font-medium">Services Offered</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-brand-600 mb-1">
                                <AnimatedCounter end={10} suffix="+" />
                            </p>
                            <p className="text-brand-700 text-sm font-medium">Expert Professionals</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-brand-600 mb-1">
                                <AnimatedCounter end={100} suffix="%" />
                            </p>
                            <p className="text-brand-700 text-sm font-medium">Manual Filing</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-brand-600 mb-1">24/7</p>
                            <p className="text-brand-700 text-sm font-medium">Order Tracking</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* FAQ SECTION */}
            {/* ============================================ */}
            <section className="py-20 px-4 bg-white">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-brand-600 mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-lg text-neutral-600">
                            Got questions? We've got answers.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-lg">
                        {faqs.map((faq, index) => (
                            <FAQItem
                                key={index}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openFAQ === index}
                                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* FINAL CTA SECTION */}
            {/* ============================================ */}
            <section className="py-20 px-4 bg-gradient-to-br from-brand-50 to-brand-100">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-brand-600 mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
                        Join businesses across India who trust LawEthic for their compliance needs.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/services"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            Browse Services
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <a
                            href="https://wa.me/918420562101"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-brand-200 text-brand-600 rounded-xl font-semibold hover:bg-brand-50 transition-all duration-300"
                        >
                            <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Chat on WhatsApp
                        </a>
                    </div>
                </div>
            </section>

            {/* ============================================ */}
            {/* FOOTER */}
            {/* ============================================ */}
            <Footer />
        </div>
    );
}
